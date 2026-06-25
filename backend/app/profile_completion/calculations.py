from app.models.user import User
from app.models.campaign import CampaignStatus

def calculate_business_completion(user: User):
    weights = {
        "company_name": 10,
        "logo": 10,
        "industry": 10,
        "description": 15,
        "website": 10,
        "location": 10,
        "contact": 10,
        "published_campaign": 15,
        "verification": 5,
        "social_links": 5
    }
    
    completed = []
    missing = []
    
    bp = user.business_profile
    if not bp:
        return {
            "percentage": 0,
            "completed_items": [],
            "missing_items": list(weights.keys()),
            "next_best_action": "company_name"
        }
        
    if bp.company_name: completed.append("company_name")
    else: missing.append("company_name")
    
    if bp.logo_url: completed.append("logo")
    else: missing.append("logo")
    
    if bp.industry: completed.append("industry")
    else: missing.append("industry")
    
    if bp.description: completed.append("description")
    else: missing.append("description")
    
    if bp.website: completed.append("website")
    else: missing.append("website")
    
    if bp.location: completed.append("location")
    else: missing.append("location")
    
    if user.email or user.full_name: completed.append("contact")
    else: missing.append("contact")
    
    has_published_campaign = any(c.status in [CampaignStatus.OPEN, CampaignStatus.ACTIVE, CampaignStatus.COMPLETED] for c in getattr(bp, 'campaigns', []))
    if has_published_campaign: completed.append("published_campaign")
    else: missing.append("published_campaign")
    
    if user.is_verified: completed.append("verification")
    else: missing.append("verification")
    
    # Social links for business isn't directly in the model. We can just add it to missing, or check if they exist somehow.
    if hasattr(user, 'social_links') and user.social_links:
        completed.append("social_links")
    else:
        missing.append("social_links")

    # Calculate percentage
    percentage = sum(weights[item] for item in completed)
    
    # Next best action is the highest value missing item
    next_best_action = None
    if missing:
        next_best_action = max(missing, key=lambda item: weights[item])
        
    return {
        "percentage": percentage,
        "completed_items": completed,
        "missing_items": missing,
        "next_best_action": next_best_action
    }


def calculate_promoter_completion(user: User):
    weights = {
        "profile_photo": 10,
        "headline": 10,
        "bio": 15,
        "primary_niche": 10,
        "location": 10,
        "experience": 10,
        "portfolio": 20,
        "social_links": 10,
        "contact": 5
    }
    
    completed = []
    missing = []
    
    pp = user.promoter_profile
    if not pp:
        return {
            "percentage": 0,
            "completed_items": [],
            "missing_items": list(weights.keys()),
            "next_best_action": "portfolio"
        }
        
    if pp.avatar_url: completed.append("profile_photo")
    else: missing.append("profile_photo")
    
    if pp.headline: completed.append("headline")
    else: missing.append("headline")
    
    if pp.bio: completed.append("bio")
    else: missing.append("bio")
    
    if pp.niche: completed.append("primary_niche")
    else: missing.append("primary_niche")
    
    if pp.location: completed.append("location")
    else: missing.append("location")
    
    if pp.years_experience is not None: completed.append("experience")
    else: missing.append("experience")
    
    if pp.portfolio_items: completed.append("portfolio")
    else: missing.append("portfolio")
    
    if hasattr(user, 'social_links') and user.social_links: completed.append("social_links")
    else: missing.append("social_links")
    
    if user.email: completed.append("contact")
    else: missing.append("contact")
    
    percentage = sum(weights[item] for item in completed)
    
    next_best_action = None
    if missing:
        next_best_action = max(missing, key=lambda item: weights[item])
        
    return {
        "percentage": percentage,
        "completed_items": completed,
        "missing_items": missing,
        "next_best_action": next_best_action
    }
