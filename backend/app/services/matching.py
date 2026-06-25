"""Smart Matching System service.

Rule-based scoring engine that ranks promoters for campaigns.
Maximum score: 100.
"""
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from ..models.campaign import Campaign
from ..models.promoter_profile import PromoterProfile
from ..models.match_result import MatchResult
from ..models.business_profile import BusinessProfile
from ..models.user import User
from ..schemas.matching import MatchResultRead, MatchResultPromoter

MAX_SCORE = 100


def _get_business_profile(db: Session, user: User) -> BusinessProfile:
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business profile not found")
    return profile


def _get_campaign(db: Session, campaign_id: str, business_profile: BusinessProfile) -> Campaign:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    if campaign.business_profile_id != business_profile.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this campaign")
    return campaign


def _score_niche(campaign_category: str, promoter_niche: str) -> int:
    """Score niche match: exact +40, related +20, none 0."""
    if campaign_category.upper() == promoter_niche.upper():
        return 40
    related_niches = {
        "LIFESTYLE": ["FASHION", "TRAVEL", "FOOD", "FITNESS"],
        "TECH": ["GAMING", "BUSINESS"],
        "FASHION": ["LIFESTYLE"],
        "FOOD": ["LIFESTYLE", "TRAVEL"],
        "TRAVEL": ["LIFESTYLE", "FOOD"],
        "FITNESS": ["LIFESTYLE"],
        "GAMING": ["TECH"],
        "BUSINESS": ["TECH"],
        "OTHER": [],
    }
    related = related_niches.get(campaign_category.upper(), [])
    if promoter_niche.upper() in related:
        return 20
    return 0


def _score_location(campaign_location: str, promoter_location: Optional[str]) -> int:
    if not promoter_location:
        return 0
    if campaign_location.lower() == promoter_location.lower():
        return 20
    return 0


def _score_followers(followers_count: int) -> int:
    if followers_count >= 100000:
        return 15
    if followers_count >= 50000:
        return 10
    if followers_count >= 10000:
        return 5
    return 0


def _score_experience(years_experience: Optional[int]) -> int:
    if years_experience is None:
        return 0
    if years_experience >= 5:
        return 10
    if years_experience >= 3:
        return 7
    if years_experience >= 1:
        return 5
    return 0


def _score_engagement(engagement_rate: float) -> int:
    if engagement_rate >= 10.0:
        return 15
    if engagement_rate >= 5.0:
        return 10
    if engagement_rate >= 2.0:
        return 5
    return 0


def _classify(score: float) -> str:
    if score >= 90:
        return "EXCELLENT_MATCH"
    if score >= 70:
        return "GOOD_MATCH"
    if score >= 50:
        return "AVERAGE_MATCH"
    return "LOW_MATCH"


def _generate_explanation(breakdown: Dict[str, int]) -> str:
    parts = []
    if breakdown.get("niche", 0) == 40:
        parts.append("Niche matches campaign")
    elif breakdown.get("niche", 0) == 20:
        parts.append("Niche is related to campaign category")
    if breakdown.get("location", 0) > 0:
        parts.append("Same location")
    if breakdown.get("followers", 0) >= 10:
        parts.append("High follower count")
    elif breakdown.get("followers", 0) > 0:
        parts.append("Moderate follower base")
    if breakdown.get("engagement", 0) >= 10:
        parts.append("High engagement rate")
    elif breakdown.get("engagement", 0) > 0:
        parts.append("Good engagement rate")
    if breakdown.get("experience", 0) >= 7:
        parts.append("Strong experience level")
    elif breakdown.get("experience", 0) > 0:
        parts.append("Some experience")
    if not parts:
        parts.append("General profile match")
    return "Recommended because: " + "; ".join(parts)


def generate_matches(db: Session, user: User, campaign_id: str) -> int:
    """Evaluate all promoters, calculate scores, store results, return count."""
    business_profile = _get_business_profile(db, user)
    campaign = _get_campaign(db, campaign_id, business_profile)

    promoters = db.query(PromoterProfile).all()

    existing_map = {
        mr.promoter_profile_id: mr
        for mr in db.query(MatchResult).filter(MatchResult.campaign_id == campaign.id).all()
    }

    count = 0
    for promoter in promoters:
        breakdown: Dict[str, Any] = {
            "niche": _score_niche(campaign.category, promoter.niche),
            "location": _score_location(campaign.location, promoter.location),
            "followers": _score_followers(promoter.followers_count),
            "experience": _score_experience(promoter.years_experience),
            "engagement": _score_engagement(promoter.engagement_rate),
        }
        score = sum(breakdown.values())
        classification = _classify(score)

        existing = existing_map.get(promoter.id)

        if existing:
            existing.score = score
            existing.classification = classification
            existing.score_breakdown = breakdown
        else:
            match = MatchResult(
                campaign_id=campaign.id,
                promoter_profile_id=promoter.id,
                score=score,
                classification=classification,
                score_breakdown=breakdown,
            )
            db.add(match)
        count += 1

    db.commit()
    return count


def get_matches(
    db: Session,
    user: User,
    campaign_id: str,
    page: int = 1,
    limit: int = 10,
    classification: Optional[str] = None,
    min_score: Optional[float] = None,
    verified: Optional[bool] = None,
) -> Tuple[List[MatchResultRead], int]:
    """Get ranked match results for a campaign. Business only."""
    business_profile = _get_business_profile(db, user)
    campaign = _get_campaign(db, campaign_id, business_profile)

    query = db.query(MatchResult).options(joinedload(MatchResult.promoter_profile)).filter(MatchResult.campaign_id == campaign.id)

    if classification:
        query = query.filter(MatchResult.classification == classification)
    if min_score is not None:
        query = query.filter(MatchResult.score >= min_score)
    if verified is not True:
        pass
    else:
        query = query.join(PromoterProfile).filter(PromoterProfile.verified == True)

    total = query.count()
    matches = (
        query.order_by(desc(MatchResult.score))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    items = []
    for m in matches:
        promoter = m.promoter_profile
        if not promoter:
            continue
        breakdown = m.score_breakdown if m.score_breakdown else {}
        explanation = _generate_explanation(breakdown)
        items.append(MatchResultRead(
            id=m.id,
            campaign_id=m.campaign_id,
            promoter=MatchResultPromoter(
                id=promoter.id,
                username=promoter.username,
                headline=promoter.headline,
                avatar_url=promoter.avatar_url,
                niche=promoter.niche,
                location=promoter.location,
                followers_count=promoter.followers_count,
                engagement_rate=promoter.engagement_rate,
                years_experience=promoter.years_experience,
                verified=promoter.verified,
            ),
            score=m.score,
            classification=m.classification,
            score_breakdown=breakdown,
            created_at=m.created_at,
            explanation=explanation,
        ))

    return items, total


def get_promoter_matching_strengths(promoter: PromoterProfile) -> Dict[str, Any]:
    """Return matching strengths for a promoter profile."""
    strengths = []
    if promoter.niche:
        strengths.append({"label": "Niche", "value": promoter.niche})
    if promoter.followers_count:
        label = "Followers"
        if promoter.followers_count >= 100000:
            value = f"{promoter.followers_count:,} (Top Tier)"
        elif promoter.followers_count >= 50000:
            value = f"{promoter.followers_count:,} (Strong)"
        elif promoter.followers_count >= 10000:
            value = f"{promoter.followers_count:,} (Growing)"
        else:
            value = f"{promoter.followers_count:,}"
        strengths.append({"label": label, "value": value})
    if promoter.engagement_rate:
        label = "Engagement"
        if promoter.engagement_rate >= 10:
            value = f"{promoter.engagement_rate:.1f}% (Excellent)"
        elif promoter.engagement_rate >= 5:
            value = f"{promoter.engagement_rate:.1f}% (Good)"
        else:
            value = f"{promoter.engagement_rate:.1f}%"
        strengths.append({"label": label, "value": value})
    if promoter.years_experience:
        label = "Experience"
        if promoter.years_experience >= 5:
            value = f"{promoter.years_experience} Years (Senior)"
        elif promoter.years_experience >= 3:
            value = f"{promoter.years_experience} Years (Mid)"
        elif promoter.years_experience >= 1:
            value = f"{promoter.years_experience} Years (Junior)"
        else:
            value = f"{promoter.years_experience} Years"
        strengths.append({"label": label, "value": value})
    return {"strengths": strengths}
