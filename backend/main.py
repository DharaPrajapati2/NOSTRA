from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from nostr_sdk import (
    Client,
    Filter,
    Kind,
    Nip19,
    RelayUrl,
)

from backend.event_analyzer import analyze_event
from backend.analyzer import generate_event_report
from backend.ai_explainer import explain_findings


app = FastAPI(
    title="NOSTRA API",
    description="AI-Powered Privacy Intelligence for Nostr",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    npub: str

    relays: list[str] = [
        "wss://relay.damus.io",
        "wss://relay.primal.net",
        "wss://nos.lol",
    ]

    limit: int = 20


@app.get("/")
async def root():
    return {
        "name": "NOSTRA",
        "status": "online",
        "message": "Privacy intelligence for Nostr",
    }


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):

    # -----------------------------------------
    # 1. Decode npub
    # -----------------------------------------

    try:

        decoded = Nip19.from_bech32(request.npub)

        nip19_enum = decoded.as_enum()

        if not nip19_enum.is_pubkey():

            raise HTTPException(
                status_code=400,
                detail="Provided value is not a valid Nostr npub.",
            )

        public_key = nip19_enum.npub

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid Nostr npub: {error}",
        )

    # -----------------------------------------
    # 2. Create Nostr client
    # -----------------------------------------

    client = Client()

    # Store unique events using event ID
    unique_events = {}

    successful_relays = []
    failed_relays = []

    try:

        # -----------------------------------------
        # 3. Connect to multiple relays
        # -----------------------------------------

        for relay_url in request.relays:

            try:

                relay = RelayUrl.parse(relay_url)

                await client.add_relay(relay)

                successful_relays.append(relay_url)

                print(
                    "Added relay:",
                    relay_url,
                )

            except Exception as error:

                print(
                    "Failed to add relay:",
                    relay_url,
                    repr(error),
                )

                failed_relays.append(relay_url)

        if not successful_relays:

            raise HTTPException(
                status_code=500,
                detail="Could not connect to any Nostr relay.",
            )

        await client.connect()

        print("Connected to relays.")

        # -----------------------------------------
        # 4. Fetch user's Kind 1 events
        # -----------------------------------------

        event_filter = (
            Filter()
            .author(public_key)
            .kind(Kind(1))
            .limit(request.limit)
        )

        for relay_url in successful_relays:

            try:

                relay = RelayUrl.parse(relay_url)

                relay_obj = await client.relay(relay)

                events = await relay_obj.fetch_events(
                    event_filter
                )

                print(
                    f"{relay_url} returned "
                    f"{len(events)} events."
                )

                # -----------------------------------------
                # 5. Deduplicate events
                # -----------------------------------------

                for event in events:

                    event_id = str(event.id())

                    if event_id not in unique_events:

                        unique_events[event_id] = event

            except Exception as error:

                print(
                    f"Failed fetching from {relay_url}:",
                    repr(error),
                )

                failed_relays.append(relay_url)

        # -----------------------------------------
        # 6. Analyze unique events
        # -----------------------------------------

        all_findings = []
        analyzed_events = []

        events_list = list(
            unique_events.values()
        )

        for event in events_list:

            findings = analyze_event(event)

            all_findings.extend(findings)

            analyzed_events.append(
                {
                    "id": str(event.id()),

                    "author": (
                        event.author()
                        .to_bech32()
                    ),

                    "content": event.content(),

                    "findings": findings,
                }
            )

        # -----------------------------------------
        # 7. Generate privacy report
        # -----------------------------------------

        report = generate_event_report(
            all_findings,
            events_analyzed=len(events_list),
        )

        # -----------------------------------------
        # 8. Generate AI privacy explanation
        # -----------------------------------------

        ai_explanation = explain_findings(
            all_findings
        )

        # -----------------------------------------
        # 9. Add metadata
        # -----------------------------------------

        report["npub"] = request.npub

        report["relays_checked"] = request.relays

        report["successful_relays"] = (
            successful_relays
        )

        report["failed_relays"] = list(
            set(failed_relays)
        )

        # -----------------------------------------
        # 10. Add AI explanation
        # -----------------------------------------

        report["ai_explanation"] = ai_explanation

        # -----------------------------------------
        # 11. Add analyzed events
        # -----------------------------------------

        report["events"] = analyzed_events

        # -----------------------------------------
        # 12. Return complete NOSTRA report
        # -----------------------------------------

        return report

    except HTTPException:
        raise

    except Exception as error:

        print(
            "ANALYSIS ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=f"Nostr analysis failed: {error}",
        )

    finally:

        await client.disconnect()