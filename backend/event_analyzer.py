import re


def analyze_event(event):
    content = event.content()

    findings = []

    # --------------------------------------------------
    # 1. External links
    # --------------------------------------------------

    urls = re.findall(r"https?://\S+", content)

    if urls:
        findings.append({
            "type": "link",
            "severity": "attention",
            "message": (
                f"This event publicly references {len(urls)} "
                "external link(s)."
            ),
            "details": urls,
            "privacy_signal": (
                "External links can connect this Nostr activity "
                "to other websites or services."
            )
        })

    # --------------------------------------------------
    # 2. Email addresses
    # --------------------------------------------------

    emails = re.findall(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        content
    )

    if emails:
        findings.append({
            "type": "contact",
            "severity": "review",
            "message": (
                "This event appears to publicly expose "
                "an email address."
            ),
            "details": emails,
            "privacy_signal": (
                "An email address can directly connect this "
                "Nostr identity with an external contact identity."
            )
        })

    # --------------------------------------------------
    # 3. Mentions
    # --------------------------------------------------

    mentions = re.findall(r"@[A-Za-z0-9_]+", content)

    if mentions:
        findings.append({
            "type": "mention",
            "severity": "info",
            "message": (
                f"This event contains {len(mentions)} "
                "public mention(s)."
            ),
            "details": mentions,
            "privacy_signal": (
                "Mentions can reveal relationships or interactions "
                "between public identities."
            )
        })

    # --------------------------------------------------
    # 4. Image / media links
    # --------------------------------------------------

    image_extensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".svg"
    ]

    image_links = [
        url
        for url in urls
        if any(
            ext in url.lower()
            for ext in image_extensions
        )
    ]

    if image_links:
        findings.append({
            "type": "media",
            "severity": "attention",
            "message": (
                "This event contains publicly accessible "
                "media links."
            ),
            "details": image_links,
            "privacy_signal": (
                "Public media URLs may reveal content hosted "
                "outside the Nostr network."
            )
        })

    # --------------------------------------------------
    # 5. Hashtags / interests
    # --------------------------------------------------

    hashtags = re.findall(
        r"(?<!\w)#\w+",
        content
    )

    if hashtags:
        findings.append({
            "type": "hashtag",
            "severity": "info",
            "message": (
                f"This event contains {len(hashtags)} "
                "public hashtag(s)."
            ),
            "details": hashtags,
            "privacy_signal": (
                "Hashtags can reveal topics, interests, "
                "communities, or activities associated "
                "with this public identity."
            )
        })

    # --------------------------------------------------
    # 6. Possible location signals
    # --------------------------------------------------

    location_keywords = [
        "ahmedabad",
        "mumbai",
        "delhi",
        "bangalore",
        "bengaluru",
        "pune",
        "surat",
        "vadodara",
        "india",
        "london",
        "new york",
        "usa",
        "uk"
    ]

    detected_locations = []

    content_lower = content.lower()

    for location in location_keywords:
        if re.search(
            rf"\b{re.escape(location)}\b",
            content_lower
        ):
            detected_locations.append(location)

    if detected_locations:
        findings.append({
            "type": "location",
            "severity": "review",
            "message": (
                "This event may publicly reveal "
                "a geographic location."
            ),
            "details": detected_locations,
            "privacy_signal": (
                "Location references can provide clues "
                "about where an account may be based "
                "or where an activity occurred."
            )
        })

    # --------------------------------------------------
    # 7. Phone numbers
    # --------------------------------------------------

    phone_numbers = re.findall(
        r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)",
        content
    )

    if phone_numbers:
        findings.append({
            "type": "phone",
            "severity": "review",
            "message": (
                "This event may contain a publicly visible "
                "phone number."
            ),
            "details": phone_numbers,
            "privacy_signal": (
                "A phone number can directly link public "
                "Nostr activity to an external identity."
            )
        })

    # --------------------------------------------------
    # 8. GitHub / code identity
    # --------------------------------------------------

    github_links = [
        url
        for url in urls
        if "github.com" in url.lower()
    ]

    if github_links:
        findings.append({
            "type": "external_identity",
            "severity": "attention",
            "message": (
                "This event references a GitHub identity "
                "or repository."
            ),
            "details": github_links,
            "privacy_signal": (
                "A public GitHub link may allow observers "
                "to connect this Nostr identity with "
                "another online identity."
            )
        })

    return findings