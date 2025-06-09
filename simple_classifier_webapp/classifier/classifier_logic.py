import re
from typing import Optional, Dict

HARD_RULES: Dict[str, str] = {
    # Direct keywords from user feedback
    "game engines": "Game Development",
    "cloud computing": "DevOps/Cloud", # Also matches "Managing servers"
    "python ml": "Data Science/AI",
    "raspberry pi": "Embedded Systems/IoT",
    "smart contract": "Blockchain",
    "smart contracts": "Blockchain", # Added plural
    "unity": "AR/VR", # Also matches "Creating games" if "Unity" is mentioned
    "ui design": "UX/UI Design", # Also matches "Designing interfaces"
    "cybersecurity": "Cybersecurity", # Also matches "Securing systems"
    "aws": "DevOps/Cloud",
    "react": "Web Development", # Also matches "Building websites" if "React" is mentioned

    # Phrases from user feedback
    "designing interfaces": "UX/UI Design",
    "building websites": "Web Development",
    "analyzing datasets": "Data Science/AI", # Changed from "Data Science/Engineering" for consistency
    "securing systems": "Cybersecurity",
    "training ai models": "Data Science/AI", # Changed from "AI/ML" for consistency
    "developing mobile apps": "Mobile Development",
    "creating games": "Game Development",
    "writing algorithms": "General Programming",
    "managing servers": "DevOps/Cloud", # Changed from "Cloud Computing" for consistency

    # Additional common keywords (examples)
    "game development": "Game Development",
    "devops": "DevOps/Cloud",
    "machine learning": "Data Science/AI",
    "artificial intelligence": "Data Science/AI",
    "iot": "Embedded Systems/IoT",
    "internet of things": "Embedded Systems/IoT",
    "blockchain": "Blockchain",
    "ar": "AR/VR",
    "augmented reality": "AR/VR",
    "vr": "AR/VR",
    "virtual reality": "AR/VR",
    "ux": "UX/UI Design",
    "ui": "UX/UI Design",
    "user experience": "UX/UI Design",
    "user interface": "UX/UI Design",
    "web development": "Web Development",
    "mobile development": "Mobile Development",
    "app development": "Mobile Development", # General app dev could be mobile or web
    "ios": "Mobile Development",
    "android": "Mobile Development",
    "data science": "Data Science/AI",
    "data analysis": "Data Science/AI",
    "front-end": "Web Development",
    "back-end": "Web Development",
    "full-stack": "Web Development",
    "docker": "DevOps/Cloud",
    "kubernetes": "DevOps/Cloud",
    "azure": "DevOps/Cloud",
    "gcp": "DevOps/Cloud",
    "network security": "Cybersecurity",
    "information security": "Cybersecurity",
    "ethical hacking": "Cybersecurity",
    "apis": "General Programming", # Could also be Web Dev, but often a general skill
    "databases": "General Programming", # Could be many, general for now
    "sql": "Data Science/AI", # Often related to data
    "nosql": "General Programming", # Could be many
    "java": "General Programming", # Could be many
    "javascript": "Web Development",
    "python": "General Programming", # Could be many, but default to general if no other context
    "c++": "General Programming",
    "c#": "Game Development", # Often with Unity, or general
    "swift": "Mobile Development",
    "kotlin": "Mobile Development",
    "php": "Web Development",
    "ruby": "Web Development",
    "go": "DevOps/Cloud", # Often used in cloud/backend
    "rust": "Embedded Systems/IoT" # Or general systems programming
}

def hard_classify(text: str) -> Optional[str]:
    """
    Classifies the input text based on a predefined set of keywords.

    Args:
        text: The input string to classify.

    Returns:
        The corresponding Tech Path if a keyword is found (case-insensitive),
        otherwise None.
    """
    if not text:
        return None

    lower_text = text.lower()

    # Sort rules by length of keyword descending to match longer, more specific phrases first.
    # This helps when short keywords are substrings of longer ones.
    # (e.g. "ai" vs "training ai models")
    # Note: The original HARD_RULES does not have this issue significantly for "ai"
    # as "python ml" and "training ai models" are quite specific.
    # But it's a good practice.
    sorted_rules = sorted(HARD_RULES.items(), key=lambda item: len(item[0]), reverse=True)

    for keyword, path in sorted_rules:
        # Use regex to match whole words to avoid partial matches like 'ar' in 'regular'
        pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
        if re.search(pattern, lower_text):
            return path
    return None
