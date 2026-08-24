import re


SECURITY_RULES = [

    # ==========================================================
    # OWASP LLM01 - Prompt Injection
    # ==========================================================
    {
        "category": "PROMPT_INJECTION",
        "owasp": "LLM01",
        "description": "Prompt Injection",
        "patterns": [
            r"ignore\s+(all\s+)?previous\s+instructions",
            r"ignore\s+(all\s+)?instructions",
            r"forget\s+(all\s+)?previous\s+instructions",
            r"disregard\s+(all\s+)?previous\s+instructions",
        ],
        "score": 40,
    },

    # ==========================================================
    # OWASP LLM02 - Sensitive Information Disclosure
    # ==========================================================
    {
        "category": "SYSTEM_PROMPT_LEAK",
        "owasp": "LLM02",
        "description": "Sensitive Information Disclosure",
        "patterns": [
            r"system\s+prompt",
            r"reveal\s+(your|the)\s+instructions",
            r"show\s+(me\s+)?your\s+prompt",
            r"what\s+are\s+your\s+instructions",
            r"reveal\s+(your|the)\s+api\s+key",
            r"show\s+(me\s+)?the\s+api\s+key",
            r"reveal\s+(your|the)\s+secret",
        ],
        "score": 40,
    },

    # ==========================================================
    # OWASP LLM06 - Excessive Agency
    # ==========================================================
    {
        "category": "EXCESSIVE_AGENCY",
        "owasp": "LLM06",
        "description": "Excessive Agency",
        "patterns": [
            r"execute\s+(this|the)\s+command",
            r"run\s+(this|the)\s+command",
            r"delete\s+(all\s+)?files",
            r"delete\s+(the\s+)?database",
            r"send\s+(an\s+)?email",
            r"make\s+(a\s+)?payment",
        ],
        "score": 40,
    },

    # ==========================================================
    # Jailbreak
    # ==========================================================
    {
        "category": "JAILBREAK",
        "owasp": "LLM01",
        "description": "Jailbreak Attempt",
        "patterns": [
            r"jailbreak",
            r"bypass\s+(your|the)\s+safety",
            r"ignore\s+safety",
            r"disable\s+safety",
        ],
        "score": 50,
    },

    # ==========================================================
    # Role Manipulation
    # ==========================================================
    {
        "category": "ROLE_MANIPULATION",
        "owasp": "LLM01",
        "description": "Role Manipulation",
        "patterns": [
            r"you\s+are\s+now",
            r"act\s+as\s+if",
            r"pretend\s+you\s+are",
            r"from\s+now\s+on\s+you\s+are",
        ],
        "score": 30,
    },
]


def analyze_prompt(prompt: str):

    detected_categories = []
    detected_patterns = []
    owasp_categories = []

    total_score = 0

    for rule in SECURITY_RULES:

        category_detected = False

        for pattern in rule["patterns"]:

            if re.search(pattern, prompt, re.IGNORECASE):

                detected_patterns.append(pattern)
                category_detected = True

        if category_detected:

            detected_categories.append(rule["category"])
            owasp_categories.append(rule["owasp"])
            total_score += rule["score"]

    # Supprimer les doublons OWASP
    owasp_categories = list(set(owasp_categories))

    # Limiter le score à 100
    total_score = min(total_score, 100)

    # Décision
    if total_score >= 60:
        decision = "BLOCK"

    elif total_score > 0:
        decision = "WARNING"

    else:
        decision = "ALLOW"

    return {
        "score": total_score,
        "decision": decision,
        "categories": detected_categories,
        "owasp": owasp_categories,
        "detected_patterns": detected_patterns,
    }