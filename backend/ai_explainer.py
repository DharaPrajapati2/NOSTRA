import re


def explain_findings(findings):
    """
    Local privacy explanation engine.

    This provides human-readable explanations without
    requiring an external AI API.
    """

    if not findings:
        return {
            "summary": "No obvious privacy signals were detected.",
            "explanation": (
                "NOSTRA did not detect any of the currently "
                "supported public privacy signals."
            ),
            "recommendations": [
                "Review your public Nostr profile periodically.",
                "Remember that public Nostr events can be visible through relays."
            ]
        }

    explanations = []
    recommendations = []

    finding_types = set()

    for finding in findings:
        finding_type = finding.get("type", "")
        finding_types.add(finding_type)

        if finding_type == "link":
            explanations.append(
                "Some of your public Nostr activity contains "
                "links to external websites. These links can "
                "connect your Nostr activity with activity "
                "on other services."
            )

            recommendations.append(
                "Review external links in public posts and "
                "consider whether they reveal another online identity."
            )

        elif finding_type == "external_identity":
            explanations.append(
                "Your public activity references another online "
                "identity, such as a GitHub profile or repository. "
                "This can make it easier to connect identities "
                "across different platforms."
            )

            recommendations.append(
                "Check whether external profiles linked from Nostr "
                "contain information you also want associated with your Nostr identity."
            )

        elif finding_type == "contact":
            explanations.append(
                "A public event appears to contain contact information. "
                "Contact details can directly connect public Nostr "
                "activity with an external communication identity."
            )

            recommendations.append(
                "Review whether publicly posting contact information "
                "is necessary."
            )

        elif finding_type == "location":
            explanations.append(
                "A public event appears to contain a geographic reference. "
                "Location information can reveal where an activity "
                "may have occurred or where an account may be based."
            )

            recommendations.append(
                "Avoid sharing precise location information publicly "
                "unless you intentionally want it associated with the event."
            )

        elif finding_type == "phone":
            explanations.append(
                "A possible phone number was detected in public content. "
                "A phone number can provide a direct connection between "
                "a public Nostr identity and another identity."
            )

            recommendations.append(
                "Review public posts for phone numbers or other direct contact details."
            )

        elif finding_type == "media":
            explanations.append(
                "Your public activity contains externally hosted media. "
                "Media URLs may connect your Nostr activity to another "
                "hosting service."
            )

            recommendations.append(
                "Review externally hosted images and media before posting them publicly."
            )

        elif finding_type == "hashtag":
            explanations.append(
                "Your public activity contains hashtags that can reveal "
                "topics, interests, communities, or activities associated "
                "with your public identity."
            )

            recommendations.append(
                "Consider whether your public hashtags reveal information "
                "you would prefer to keep less connected to your identity."
            )

        elif finding_type == "mention":
            explanations.append(
                "Your public activity contains mentions of other accounts. "
                "Public mentions can reveal relationships or interactions "
                "between identities."
            )

            recommendations.append(
                "Review public mentions when they reveal relationships "
                "you may not want broadly associated with your profile."
            )

    # Remove duplicate recommendations
    recommendations = list(dict.fromkeys(recommendations))

    # Build summary
    signal_count = len(findings)

    if signal_count == 1:
        summary = "NOSTRA detected 1 public privacy signal."
    else:
        summary = f"NOSTRA detected {signal_count} public privacy signals."

    # Build explanation
    if explanations:
        explanation = " ".join(explanations)
    else:
        explanation = (
            "NOSTRA detected public signals that may be useful "
            "to review as part of your privacy footprint."
        )

    return {
        "summary": summary,
        "explanation": explanation,
        "recommendations": recommendations
    }