import re


def analyze_profile(profile):
    findings = []

    name = profile.get("name", "")
    about = profile.get("about", "")
    picture = profile.get("picture", "")
    nip05 = profile.get("nip05", "")

    if name:
        findings.append({
            "type": "identity",
            "field": "name",
            "severity": "info",
            "message": "Your profile publicly reveals a display name."
        })

    if about:
        findings.append({
            "type": "bio",
            "field": "about",
            "severity": "info",
            "message": "Your profile contains a public bio."
        })

    if picture:
        findings.append({
            "type": "image",
            "field": "picture",
            "severity": "info",
            "message": "Your profile has a publicly visible profile picture."
        })

    if nip05:
        findings.append({
            "type": "identifier",
            "field": "nip05",
            "severity": "attention",
            "message": "Your profile exposes a NIP-05 identifier."
        })

    if re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        about
    ):
        findings.append({
            "type": "contact",
            "field": "email",
            "severity": "review",
            "message": "Your bio appears to contain an email address."
        })

    if re.search(r"https?://\S+|www\.\S+", about):
        findings.append({
            "type": "link",
            "field": "url",
            "severity": "attention",
            "message": "Your bio contains a publicly visible website or link."
        })

    location_keywords = [
        "india",
        "ahmedabad",
        "delhi",
        "mumbai",
        "bangalore",
        "london",
        "new york",
        "usa",
        "uk"
    ]

    about_lower = about.lower()

    for location in location_keywords:
        if location in about_lower:
            findings.append({
                "type": "location",
                "field": "about",
                "severity": "review",
                "message": "Your bio may reveal a location."
            })
            break

    return findings


def generate_report(findings):
    report = {
        "total_findings": len(findings),
        "info": 0,
        "attention": 0,
        "review": 0,
    }

    for finding in findings:
        severity = finding.get("severity")

        if severity in report:
            report[severity] += 1

    return report


def generate_event_report(all_findings, events_analyzed=0):
    """
    Generate a structured privacy report from analyzed Nostr events.
    """

    report = {
        "events_analyzed": events_analyzed,
        "total_findings": len(all_findings),

        "severity": {
            "info": 0,
            "attention": 0,
            "review": 0
        },

        "categories": {},

        "findings": all_findings
    }

    for finding in all_findings:

        severity = finding.get("severity")
        finding_type = finding.get("type")

        # Count severity
        if severity in report["severity"]:
            report["severity"][severity] += 1

        # Count categories
        if finding_type:
            report["categories"][finding_type] = (
                report["categories"].get(finding_type, 0) + 1
            )

    return report