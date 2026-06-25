"""Social link validators."""
import re
from app.models.social_link import PlatformEnum
from app.exceptions.custom import ValidationError

def validate_platform_url(platform: PlatformEnum, url: str) -> None:
    patterns = {
        PlatformEnum.INSTAGRAM: r"^https?://(www\.)?instagram\.com/.*$",
        PlatformEnum.YOUTUBE: r"^https?://(www\.)?youtube\.com/.*$",
        PlatformEnum.GITHUB: r"^https?://(www\.)?github\.com/.*$",
        PlatformEnum.X: r"^https?://(www\.)?(twitter\.com|x\.com)/.*$",
        PlatformEnum.LINKEDIN: r"^https?://(www\.)?linkedin\.com/.*$",
        PlatformEnum.FACEBOOK: r"^https?://(www\.)?facebook\.com/.*$",
        PlatformEnum.TIKTOK: r"^https?://(www\.)?tiktok\.com/.*$",
        PlatformEnum.WEBSITE: r"^https?://.*$"
    }

    pattern = patterns.get(platform)
    if pattern and not re.match(pattern, url):
        raise ValidationError(f"Invalid URL for platform {platform.value}. Must match expected domain.")
