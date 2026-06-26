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
    
    def format_item(key, label, route=None):
        return {"key": key, "label": label, "route": route}
        
    labels = {
        "company_name": "Add Company Name",
        "logo": "Upload Company Logo",
        "industry": "Select Industry",
        "description": "Add Company Description",
        "website": "Add Company Website",
        "location": "Add Headquarters Location",
        "contact": "Add Contact Information",
        "published_campaign": "Publish a Campaign",
        "verification": "Verify your Business",
        "social_links": "Add Social Links"
    }

    completed = []
    missing = []

    bp = user.business_profile
    if not bp:
        return {
            "percentage": 0,
            "completed_items": [],
            "missing_items": [format_item(k, labels[k]) for k in weights.keys()],
            "next_best_action": {"title": labels["company_name"], "description": "Add your company name to get started.", "weight": weights["company_name"]}
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
    
    if hasattr(user, 'social_links') and user.social_links:
        completed.append("social_links")
    else:
        missing.append("social_links")

    percentage = sum(weights[item] for item in completed)
    
    next_best_action = None
    if missing:
        nba_key = max(missing, key=lambda item: weights[item])
        next_best_action = {"title": labels[nba_key], "description": f"Please {labels[nba_key].lower()} to improve your profile.", "weight": weights[nba_key]}
        
    return {
        "percentage": percentage,
        "completed_items": [format_item(k, labels[k]) for k in completed],
        "missing_items": [format_item(k, labels[k]) for k in missing],
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
    
    def format_item(key, label, route=None):
        return {"key": key, "label": label, "route": route}
        
    labels = {
        "profile_photo": "Upload Profile Photo",
        "headline": "Add Headline",
        "bio": "Add Bio",
        "primary_niche": "Select Primary Niche",
        "location": "Add Location",
        "experience": "Add Years of Experience",
        "portfolio": "Add Portfolio Items",
        "social_links": "Add Social Links",
        "contact": "Add Contact Information"
    }

    completed = []
    missing = []

    pp = user.promoter_profile
    if not pp:
        return {
            "percentage": 0,
            "completed_items": [],
            "missing_items": [format_item(k, labels[k]) for k in weights.keys()],
            "next_best_action": {"title": labels["portfolio"], "description": "Add portfolio items to get started.", "weight": weights["portfolio"]}
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
        nba_key = max(missing, key=lambda item: weights[item])
        next_best_action = {"title": labels[nba_key], "description": f"Please {labels[nba_key].lower()} to improve your profile.", "weight": weights[nba_key]}
        
    return {
        "percentage": percentage,
        "completed_items": [format_item(k, labels[k]) for k in completed],
        "missing_items": [format_item(k, labels[k]) for k in missing],
        "next_best_action": next_best_action
    }
