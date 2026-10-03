import asyncio
import json

from nostr_sdk import Client, Filter, Kind, RelayUrl

from backend.event_analyzer import analyze_event
from backend.analyzer import generate_event_report


async def main():

    # Create Nostr client
    client = Client()

    # Connect to relay
    relay = RelayUrl.parse("wss://relay.damus.io")

    await client.add_relay(relay)
    await client.connect()

    print("Connected to Nostr relay! ✅")
    print("Fetching public notes...\n")

    # Fetch 5 public text events
    event_filter = Filter().kind(Kind(1)).limit(5)

    relay_obj = await client.relay(relay)

    events = await relay_obj.fetch_events(event_filter)

    print(f"Found {len(events)} events.\n")

    # Store findings from every event
    all_findings = []

    # Analyze every event
    for event in events:

        print("Author:", event.author().to_bech32())
        print("Content:", event.content())

        findings = analyze_event(event)

        # Add findings to global list
        all_findings.extend(findings)

        print("\n🔎 NOSTRA Findings:")

        if findings:

            for finding in findings:
                print(
                    f"- [{finding['severity']}] "
                    f"{finding['message']}"
                )

        else:
            print("- No detectable public signals.")

        print("-" * 60)

    # Generate structured report
    report = generate_event_report(
        all_findings,
        events_analyzed=len(events)
    )

    # Display readable report
    print("\n" + "=" * 60)
    print("🛡️ NOSTRA PRIVACY REPORT")
    print("=" * 60)

    print(
        "Events analyzed:",
        report["events_analyzed"]
    )

    print(
        "Total findings:",
        report["total_findings"]
    )

    print("\n⚠️ Severity:")

    print(
        "Info:",
        report["severity"]["info"]
    )

    print(
        "Attention:",
        report["severity"]["attention"]
    )

    print(
        "Review:",
        report["severity"]["review"]
    )

    print("\n📊 Categories:")

    if report["categories"]:

        for category, count in report["categories"].items():
            print(f"- {category}: {count}")

    else:
        print("- No categories detected.")

    print("=" * 60)

    # Print JSON version
    print("\n📦 STRUCTURED JSON REPORT:")
    print(
        json.dumps(
            report,
            indent=2,
            ensure_ascii=False
        )
    )

    # Disconnect
    await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())