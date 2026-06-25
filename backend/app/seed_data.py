#!/usr/bin/env python3
"""Seed the B2P Connect database with realistic demo data.

Usage:
    python -m app.seed_data
"""

import sys
import uuid
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models import (
    User,
    RoleEnum,
    BusinessProfile,
    PromoterProfile,
    NicheEnum,
    PortfolioItem,
    SocialLink,
    PlatformEnum,
    Campaign,
    CampaignStatus,
    CampaignVisibility,
    SavedPromoter,
    CampaignApplication,
    ApplicationStatus,
    CampaignInvitation,
    InvitationStatus,
    Collaboration,
    CollaborationStatus,
    MatchResult,
    Review,
)

SEED_PASSWORD = "SeedPass123!"
PASSWORD_HASH = None
NOW = datetime.now(timezone.utc)

# ---------------------------------------------------------------------------
# Data pools
# ---------------------------------------------------------------------------

BUSINESSES = [
    ("TechVibe Marketing", "TECH", "San Francisco, CA",
     "Full-service digital marketing agency specializing in tech product launches and brand awareness campaigns for SaaS and hardware companies.",
     "https://techvibe.io", "50-200"),
    ("GreenLeaf Promotions", "FASHION", "New York, NY",
     "Eco-conscious fashion promotion agency connecting sustainable brands with top content creators. We specialize in ethical fashion campaigns.",
     "https://greenleafpromo.com", "10-50"),
    ("CloudCommerce Inc", "TECH", "Seattle, WA",
     "Enterprise e-commerce platform provider looking to expand brand reach through influencer partnerships and authentic content creation.",
     "https://cloudcommerce.com", "200-500"),
    ("FreshBites Agency", "FOOD", "Los Angeles, CA",
     "Food marketing agency representing restaurant chains, meal delivery services, and gourmet food brands across North America.",
     "https://freshbites.io", "50-200"),
    ("Wanderlust Media", "TRAVEL", "London, UK",
     "Travel and hospitality marketing firm promoting luxury resorts, adventure tours, and travel experiences to global audiences.",
     "https://wanderlustmedia.co.uk", "10-50"),
    ("FitFusion Group", "FITNESS", "Berlin, Germany",
     "Health and fitness brand management company specializing in workout programs, nutrition products, and wellness technology.",
     "https://fitfusion.eu", "50-200"),
    ("PixelPerfect Studios", "TECH", "Tokyo, Japan",
     "Creative tech studio producing AR/VR experiences, gaming content, and digital art. We bridge technology and creativity.",
     "https://pixelperfect.jp", "10-50"),
    ("UrbanStyle Collective", "FASHION", "New York, NY",
     "Streetwear and urban fashion collective representing emerging designers and lifestyle brands in the fashion industry.",
     "https://urbanstyle.co", "10-50"),
    ("GlobalTaste Partners", "FOOD", "Singapore",
     "International food and beverage marketing agency connecting Asian cuisine brands with influencers across Southeast Asia.",
     "https://globaltaste.sg", "50-200"),
    ("Summit Adventures Co", "TRAVEL", "Vancouver, BC",
     "Outdoor adventure and eco-tourism company promoting sustainable travel experiences, hiking gear, and wilderness expeditions.",
     "https://summitadventures.ca", "10-50"),
]

PROMOTERS = [
    # (username, full_name, niche, location, headline, followers, engagement, years_exp, verified)
    ("starlight_emma", "Emma Richardson", NicheEnum.LIFESTYLE, "Los Angeles, CA",
     "Lifestyle & Travel Creator | 250K+ Followers", 245000, 4.2, 5, True),
    ("trend_taylor", "Taylor Brooks", NicheEnum.LIFESTYLE, "New York, NY",
     "Fashion & Lifestyle Content Creator | Brand Strategist", 180000, 3.9, 4, False),
    ("zen_life_co", "Olivia Bennett", NicheEnum.LIFESTYLE, "London, UK",
     "Mindful Living & Wellness | Slow Fashion Advocate", 95000, 5.1, 3, False),
    ("wander_soul", "Liam Foster", NicheEnum.LIFESTYLE, "Bali, Indonesia",
     "Digital Nomad | Lifestyle & Travel Photography", 312000, 4.8, 6, True),
    ("cozy_vibes", "Sophia Hayes", NicheEnum.LIFESTYLE, "Portland, OR",
     "Home & Lifestyle Creator | Interior Design Lover", 67000, 3.5, 2, False),
    ("tech_ninja", "Marcus Chen", NicheEnum.TECH, "San Francisco, CA",
     "Tech Reviewer & Gadget Enthusiast | 89K Subs", 89000, 3.8, 3, False),
    ("code_and_chips", "Aria Patel", NicheEnum.TECH, "Bangalore, India",
     "DevOps & Cloud Content | Software Tutorials", 42000, 4.1, 4, False),
    ("future_byte", "Noah Kim", NicheEnum.TECH, "Seattle, WA",
     "AI & Machine Learning Content Creator | Tech Speaker", 156000, 6.2, 5, True),
    ("pixel_pilgrim", "Luna Torres", NicheEnum.TECH, "Austin, TX",
     "Web3 & Blockchain Creator | Digital Art Innovator", 78000, 3.4, 2, False),
    ("style_muse", "Chloe Martin", NicheEnum.FASHION, "Paris, France",
     "Haute Couture & Street Style | Fashion Week Regular", 423000, 4.5, 6, True),
    ("thread_and_trend", "Zoe Brooks", NicheEnum.FASHION, "Milan, Italy",
     "Sustainable Fashion & Luxury Brand Collaborations", 198000, 5.8, 4, True),
    ("vintage_rose", "Isabella Cruz", NicheEnum.FASHION, "New York, NY",
     "Vintage Fashion Stylist | Thrift Flip Expert", 54000, 3.2, 1, False),
    ("catwalk_diaries", "Mia Zhang", NicheEnum.FASHION, "Shanghai, China",
     "Fashion Blogger & Stylist | Asia Fashion Scene", 287000, 4.0, 5, False),
    ("flavor_hunter", "Jack Thompson", NicheEnum.FOOD, "Chicago, IL",
     "Food Critic & Recipe Developer | Farm-to-Table Advocate", 134000, 4.6, 4, False),
    ("spice_route", "Ava Martinez", NicheEnum.FOOD, "Mexico City, Mexico",
     "Latin Cuisine Expert | Street Food Explorer", 89000, 5.2, 3, False),
    ("savory_bites", "Lucas Brown", NicheEnum.FOOD, "Melbourne, Australia",
     "Home Chef & Food Blogger | International Recipes", 45000, 3.1, 2, False),
    ("globe_trotter", "Sophie Turner", NicheEnum.TRAVEL, "Sydney, Australia",
     "Adventure Traveler | Destination Photographer", 512000, 4.9, 7, True),
    ("wander_wise", "Oliver Gray", NicheEnum.TRAVEL, "Barcelona, Spain",
     "Budget Travel Tips | Solo Female Travel Advocate", 167000, 5.5, 4, True),
    ("nomad_heart", "Emily White", NicheEnum.TRAVEL, "Lisbon, Portugal",
     "Digital Nomad Lifestyle | Remote Work Travel Guides", 92000, 3.7, 3, False),
    ("trail_finder", "Leo Anderson", NicheEnum.TRAVEL, "Denver, CO",
     "Hiking & Outdoor Adventure | National Parks Explorer", 73000, 4.3, 2, False),
    ("iron_pulse", "Jake Mitchell", NicheEnum.FITNESS, "Miami, FL",
     "Personal Trainer & Nutrition Coach | Fitness Motivation", 298000, 6.8, 5, True),
    ("flex_and_flow", "Grace Lee", NicheEnum.FITNESS, "Seoul, South Korea",
     "Yoga & Pilates Instructor | Mind-Body Wellness", 156000, 4.4, 4, False),
    ("peak_performer", "Ryan Cooper", NicheEnum.FITNESS, "Toronto, Canada",
     "CrossFit Athlete | Sports Nutrition Specialist", 87000, 3.6, 2, False),
    ("pixel_warrior", "Ethan Wright", NicheEnum.GAMING, "Los Angeles, CA",
     "FPS Pro Gamer | Twitch Partner | 500K Followers", 500000, 7.2, 5, True),
    ("nova_strike", "Maya Singh", NicheEnum.GAMING, "London, UK",
     "RPG & Strategy Games | Game Dev Commentary", 210000, 5.9, 4, True),
    ("retro_rewind", "Kai Williams", NicheEnum.GAMING, "Tokyo, Japan",
     "Retro Gaming Collector | Speedrun Enthusiast", 34000, 2.8, 1, False),
    ("startup_sage", "Sarah Collins", NicheEnum.BUSINESS, "New York, NY",
     "Startup Founder | Business Growth & Entrepreneurship Content", 125000, 3.3, 6, True),
    ("market_mover", "David Park", NicheEnum.BUSINESS, "Singapore",
     "Digital Marketing Strategist | B2B Content Creator", 56000, 2.9, 4, False),
    ("curious_mind", "Riley Quinn", NicheEnum.OTHER, "Remote",
     "Science Communicator | Educational Content Creator", 189000, 4.7, 3, False),
    ("eco_warrior", "Morgan Reed", NicheEnum.OTHER, "Berlin, Germany",
     "Environmental Activist | Zero Waste Lifestyle Advocate", 234000, 5.4, 5, True),
]

FIRST_NAMES = [
    "James", "Amanda", "Robert", "Sarah", "Michael", "Jessica", "David", "Emily",
    "Daniel", "Ashley", "Matthew", "Sophie", "Andrew", "Victoria", "Christopher",
]

LAST_NAMES = [
    "Thompson", "Garcia", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas",
    "Hernandez", "Moore", "Jackson", "Martin", "Lee", "Perez", "White", "Harris",
]

CAMPAIGN_CATEGORIES = ["TECH", "FASHION", "FOOD", "TRAVEL", "FITNESS", "LIFESTYLE", "GAMING"]

CAMPAIGN_TITLES = {
    "TECH": [
        "Next-Gen SaaS Product Launch",
        "Mobile App Beta Testing Campaign",
        "Cloud Platform Brand Awareness",
        "AI-Powered Tool Showcase",
        "Developer Tool Community Campaign",
        "Cybersecurity Solution Launch",
        "IoT Device Market Entry",
        "Blockchain Innovation Campaign",
        "Enterprise Software Upgrade Push",
        "Tech Startup Growth Campaign",
        "Smart Home Device Launch",
        "Wearable Tech Promotion",
        "EdTech Platform Awareness",
        "FinTech Solution Launch",
        "AR/VR Experience Campaign",
        "Data Analytics Platform Launch",
        "Open Source Community Drive",
        "Productivity Tool Awareness",
        "Cloud Migration Service Push",
        "API Integration Showcase",
    ],
    "FASHION": [
        "Summer Collection 2026 Launch",
        "Streetwear Brand Awareness",
        "Sustainable Fashion Campaign",
        "Accessory Line Promotion",
        "Luxury Brand Collaboration",
        "Seasonal Wardrobe Refresh",
        "Athleisure Wear Launch",
        "Vintage Revival Collection",
        "Designer Collaboration Series",
        "Fashion Week Preview Campaign",
        "Jewelry Collection Launch",
        "Ethical Fashion Initiative",
        "Plus Size Fashion Line",
        "Urban Fashion Showcase",
        "Beauty & Cosmetics Launch",
        "Denim Collection Launch",
        "Footwear Brand Campaign",
        "Lingerie Line Promotion",
        "Kids Fashion Collection",
        "Wedding Attire Showcase",
    ],
    "FOOD": [
        "Farm-to-Table Campaign",
        "New Menu Item Launch",
        "Food Delivery Service Push",
        "Organic Product Line Launch",
        "Seasonal Recipe Promotion",
        "Meal Prep Service Launch",
        "Restaurant Brand Awareness",
        "Healthy Snack Launch",
        "International Cuisine Series",
        "Plant-Based Product Launch",
        "Artisanal Food Collection",
        "Cooking App Promotion",
        "Beverage Brand Launch",
        "Food Festival Campaign",
        "Gourmet Subscription Box",
        "Wine & Spirits Collection",
        "Bakery Brand Launch",
        "Superfood Product Push",
        "Coffee Roaster Campaign",
        "Street Food Series Launch",
    ],
    "TRAVEL": [
        "Summer Destination Campaign",
        "Adventure Travel Series",
        "Luxury Resort Promotion",
        "Budget Travel Awareness",
        "Cultural Experience Campaign",
        "Eco-Tourism Initiative",
        "Travel App Launch Campaign",
        "Hidden Gems Discovery Series",
        "Solo Travel Promotion",
        "Family Vacation Campaign",
        "Wellness Retreat Launch",
        "Travel Insurance Awareness",
        "Hotel Brand Launch",
        "Expedition Gear Promotion",
        "Digital Nomad Campaign",
        "Road Trip Adventure Series",
        "Cruise Line Promotion",
        "Backpacker Route Campaign",
        "Luxury Safari Experience",
        "City Break Discovery Series",
    ],
    "FITNESS": [
        "Home Workout App Launch",
        "Gym Membership Campaign",
        "Nutrition Plan Launch",
        "Yoga & Wellness Series",
        "Running Challenge Campaign",
        "Fitness Wearable Promotion",
        "Personal Training Push",
        "Health Supplement Launch",
        "Boot Camp Program Campaign",
        "Mindfulness App Launch",
        "Sports Equipment Promotion",
        "Weight Loss Program Launch",
        "Marathon Training Campaign",
        "Fitness Studio Opening",
        "Outdoor Adventure Fitness",
        "HIIT Program Launch",
        "Dance Fitness Challenge",
        "Recovery & Stretching Series",
        "Swimming Technique Campaign",
        "Cycling Community Push",
    ],
    "LIFESTYLE": [
        "Minimalist Living Campaign",
        "Home Decor Collection Launch",
        "Productivity App Promotion",
        "Sustainable Living Push",
        "Pet Care Product Launch",
        "Parenting Tips Campaign",
        "Home Office Setup Series",
        "Skincare Routine Launch",
        "Gift Guide Campaign",
        "Subscription Box Launch",
        "DIY Craft Series",
        "Book Club Campaign",
        "Personal Finance Awareness",
        "Mindfulness & Meditation Push",
        "Smart Home Lifestyle Launch",
        "Gardening Tips Series",
        "Photography Gear Promotion",
        "Music Streaming Campaign",
        "Online Course Launch",
        "Charity Fundraiser Campaign",
    ],
    "GAMING": [
        "New Game Title Launch",
        "Esports Tournament Campaign",
        "Gaming Console Promotion",
        "Mobile Game Launch Push",
        "Game Accessory Launch",
        "Streaming Channel Growth",
        "VR Gaming Experience Launch",
        "Indie Game Spotlight",
        "Gaming Community Campaign",
        "Board Game Revival Series",
        "Game Developer Studio Push",
        "Retro Gaming Collection",
        "Cloud Gaming Service Launch",
        "Gaming Chair Launch",
        "Esports Team Sponsorship",
        "Battle Royale Tournament",
        "RPG Expansion Pack Launch",
        "Gaming Merchandise Line",
        "Tabletop Gaming Campaign",
        "Game Audio & Music Push",
    ],
}

CAMPAIGN_DESCRIPTIONS = {
    "TECH": [
        "We are launching an innovative new product and need creators to showcase its features to a tech-savvy audience. The campaign will focus on highlighting key differentiators and real-world use cases through authentic demonstrations.",
        "Our platform is transforming how businesses operate and we need tech creators to produce tutorials, reviews, and case studies that demonstrate tangible value to potential customers.",
        "This campaign aims to build brand awareness for our cutting-edge technology solution. We are looking for creators who can explain complex concepts in an accessible and engaging way.",
    ],
    "FASHION": [
        "We are excited to launch our new collection and need fashion creators to style our pieces in creative ways. The focus is on authentic integration into everyday wardrobe choices and seasonal trends.",
        "Our sustainable fashion line is redefining eco-conscious style. We are seeking creators who can tell compelling stories about ethical fashion and showcase our pieces in real-life settings.",
        "This campaign celebrates urban streetwear culture. We want creators to showcase how our clothing fits into their personal style and daily life through original photo and video content.",
    ],
    "FOOD": [
        "We are launching a new menu item and want food creators to give their honest first impressions. The campaign focuses on authentic taste tests, cooking demonstrations, and creative recipe ideas.",
        "Our organic product line is expanding and we need creators to highlight the quality and versatility of our ingredients through original recipes and cooking content.",
        "This campaign promotes our food delivery service with a focus on convenience and quality. We want creators to share their unboxing and tasting experiences with their audience.",
    ],
    "TRAVEL": [
        "We are promoting an exclusive travel experience and need creators to capture the magic of the destination. The focus is on authentic storytelling through immersive photo and video content.",
        "Our eco-tourism initiative showcases sustainable travel options. We are looking for creators who can inspire their audience to explore responsibly and discover off-the-beaten-path destinations.",
        "This campaign highlights the best of urban exploration in major cities. We want creators to produce guides, tips, and visual content that captures the local culture and hidden gems.",
    ],
    "FITNESS": [
        "Our fitness program is designed for all levels and we need creators to document their journey and results. The campaign focuses on authentic transformation stories and workout demonstrations.",
        "We are launching a new line of fitness products and want creators to put them to the test. Honest reviews, workout routines, and before-and-after content are all welcome.",
        "This wellness campaign promotes holistic health practices. We are seeking creators who can share their personal routines, tips for staying motivated, and the benefits of an active lifestyle.",
    ],
    "LIFESTYLE": [
        "We are introducing a new lifestyle product and need creators to integrate it into their daily routines. The focus is on authentic, relatable content that shows real-life applications and benefits.",
        "Our home and living collection is designed to elevate everyday spaces. We want creators to showcase how our products fit into their home aesthetic and improve their daily life.",
        "This campaign promotes mindful living and personal development. We are looking for creators who can share their tips, routines, and experiences in an authentic and inspiring way.",
    ],
    "GAMING": [
        "We are launching a highly anticipated game title and need gaming creators to produce early access content, first impressions, and live streaming coverage for their communities.",
        "Our esports tournament is looking for gaming creators to cover the event, provide commentary, and engage their audience with exclusive behind-the-scenes content and analysis.",
        "This campaign showcases new gaming peripherals designed for competitive play. We want creators to review the gear, demonstrate performance in real gameplay, and share their honest opinions.",
    ],
}

APPLICATION_MESSAGES = [
    "I am very interested in this campaign and believe my audience would love it. I have experience creating content for similar brands and can deliver high-quality results.",
    "Your campaign aligns perfectly with my content style and audience interests. I would love to collaborate and create authentic content that resonates with your target market.",
    "I have been following your brand for a while and I think we could create some amazing content together. My engagement rates are consistently high and my audience trusts my recommendations.",
    "This is exactly the type of campaign I excel at. I have a proven track record of driving engagement and conversions for brands in this space. Let me help you reach your goals.",
    "I love what you are doing with this campaign and I think my creative approach would bring a fresh perspective. I am confident my audience would respond really well to your brand.",
    "Your brand values align closely with my own content philosophy. I would be thrilled to collaborate and produce content that feels genuine and drives real results for your campaign.",
    "I have worked with several brands in this niche and understand what resonates with the audience. I can deliver creative content that tells your brand story effectively.",
    "My audience demographics match your target market perfectly. I am confident this collaboration would be mutually beneficial and produce outstanding content.",
    "I am a huge fan of your brand and have been using your products for months. Creating content for this campaign would be a dream collaboration for me and my audience.",
    "I specialize in creating viral content and driving engagement. I believe this campaign has tremendous potential and I would love to bring my creative expertise to the table.",
]

INVITATION_MESSAGES = [
    "We love your content and think you would be a perfect fit for this campaign. Your audience aligns perfectly with our target market and we admire your creative style.",
    "We have been following your work and are impressed by your engagement rates. We would like to invite you to join our upcoming campaign and collaborate with our brand.",
    "Your recent content in this space caught our attention. We believe you would be an excellent partner for this campaign and we would love to discuss a collaboration.",
    "We are specifically looking for creators with your expertise and audience demographics. This campaign is designed with your content style in mind and we think it would be a great match.",
    "We admired your previous brand collaborations and think your authentic approach would be perfect for this campaign. Let us create something amazing together.",
    "Your creative vision and storytelling ability are exactly what we need for this campaign. We would be honored to have you as one of our brand partners.",
    "We are building a team of top-tier creators for this campaign and your profile stood out to us. We believe this partnership would deliver outstanding results for both sides.",
    "This campaign is launching soon and we are curating a select group of creators. Your unique style and engaged audience make you an ideal candidate for this partnership.",
]

POSITIVE_REVIEWS = [
    "Absolutely fantastic collaboration! The creator exceeded all expectations and delivered outstanding content that resonated perfectly with our target audience. We saw a significant boost in engagement and conversions. Looking forward to working together again.",
    "One of the best partnerships we have had on this platform. Professional, creative, and highly effective. Communication was seamless and the content quality was exceptional throughout the campaign.",
    "Exceptional work from start to finish. The creator truly understood our brand vision and translated it into compelling content that our audience loved. Highly recommended for any brand collaboration.",
    "This was a wonderful partnership experience. The creator was responsive, flexible, and delivered content that perfectly aligned with our campaign goals. The results exceeded our initial projections.",
    "Working with this creator was an absolute pleasure. The content was creative, on-brand, and delivered ahead of schedule. Our engagement metrics improved dramatically during this campaign.",
    "Outstanding collaboration! The level of creativity and professionalism was remarkable. The content generated authentic conversations with our target audience and drove meaningful results for our brand.",
    "This creator brought fresh ideas and a unique perspective to our campaign. The content performed exceptionally well and the audience response was overwhelmingly positive. A truly valuable partnership.",
    "Highly professional and creative collaborator. The campaign deliverables were top-notch and the creator went above and beyond to ensure the content resonated with both their audience and ours.",
    "A seamless collaboration from briefing to delivery. The content was authentic, engaging, and perfectly aligned with our brand messaging. We exceeded our KPIs thanks to this partnership.",
    "Incredible results from this collaboration. The creator understood our goals immediately and produced content that not only met but exceeded our expectations. We have already planned future campaigns together.",
]

NEUTRAL_REVIEWS = [
    "Good collaboration overall. The content quality was decent and the creator was professional, though there were some minor delays in content delivery. The campaign results were satisfactory.",
    "The partnership went reasonably well. The content met our requirements but did not exceed expectations. Communication could have been better but the final deliverables were acceptable.",
    "Average experience. The creator delivered the required content on time but we felt there was room for more creativity and alignment with our brand voice. Results were moderate.",
    "Decent collaboration with room for improvement. The content was acceptable but we expected more engagement given the creator's following size. The process was smooth overall.",
    "The campaign ran smoothly enough but the content did not fully capture our brand essence. We appreciate the professionalism but the creative execution could have been stronger.",
    "Satisfactory partnership. The deliverables were as agreed but we felt the content lacked the creative spark we were hoping for. The audience response was moderate.",
    "Acceptable results from this collaboration. The creator was easy to work with but the content did not stand out significantly. We saw average engagement metrics for this campaign.",
    "The collaboration was fine but unremarkable. The creator met the basic requirements but we were hoping for more innovative content. Communication was adequate throughout.",
]

NEGATIVE_REVIEWS = [
    "Disappointing results from this collaboration. The content did not meet our quality standards and required multiple revisions. The engagement was far below what we expected based on the creator's profile.",
    "Poor communication throughout the campaign. The creator missed deadlines and the final content required significant rework. Would not recommend working with this creator for time-sensitive campaigns.",
    "Unfortunately this partnership did not work out well. The content lacked authenticity and did not resonate with either our audience or the creator's followers. Results were well below expectations.",
    "Below average experience. The creator seemed disengaged and the content felt rushed. We had to follow up multiple times to get deliverables and the quality was inconsistent at best.",
    "This collaboration was challenging from the start. The content missed the mark on brand alignment and the creator was difficult to communicate with. We would not work with them again.",
    "Very disappointed with this partnership. The content failed to meet the agreed specifications and the engagement was minimal. This was not a good fit for our brand or campaign goals.",
]

RATING_DISTRIBUTION = [1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5]

CITIES = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
    "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
    "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
    "Fort Worth, TX", "Columbus, OH", "Charlotte, NC", "Indianapolis, IN",
    "San Francisco, CA", "Seattle, WA", "Denver, CO", "Nashville, TN",
    "Portland, OR", "Miami, FL", "Atlanta, GA", "Boston, MA",
]

SIZE_OPTIONS = ["1-10", "10-50", "50-200", "200-500", "500-1000", "1000+"]

SOCIAL_PLATFORMS = [
    (PlatformEnum.INSTAGRAM, "https://instagram.com/{}"),
    (PlatformEnum.TIKTOK, "https://tiktok.com/@{}"),
    (PlatformEnum.YOUTUBE, "https://youtube.com/@{}"),
    (PlatformEnum.FACEBOOK, "https://facebook.com/{}"),
    (PlatformEnum.LINKEDIN, "https://linkedin.com/in/{}"),
    (PlatformEnum.X, "https://x.com/{}"),
]

PORTFOLIO_TITLES = [
    "Brand Campaign Showcase",
    "Product Launch Content",
    "Social Media Takeover",
    "Video Series Collaboration",
    "Photo Shoot Collection",
    "Event Coverage Package",
    "Tutorial Series",
    "Review Compilation",
    "Sponsored Content Reel",
    "Creative Campaign Portfolio",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def random_date(start: datetime, end: datetime) -> datetime:
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))


def weighted_sample(population, weights, k):
    """Sample k items from population with given weights (with replacement)."""
    return random.choices(population, weights=weights, k=k)


def generate_app_message() -> str:
    msg = random.choice(APPLICATION_MESSAGES)
    return msg


def generate_invitation_message() -> str:
    msg = random.choice(INVITATION_MESSAGES)
    return msg


def generate_full_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def generate_campaign_description(category: str) -> str:
    descs = CAMPAIGN_DESCRIPTIONS.get(category, CAMPAIGN_DESCRIPTIONS["LIFESTYLE"])
    return random.choice(descs)


# ---------------------------------------------------------------------------
# Clear existing data
# ---------------------------------------------------------------------------


def clear_data(db: Session) -> None:
    print("  Clearing existing data...")
    db.execute(text("""
        TRUNCATE TABLE
            reviews,
            collaborations,
            campaign_applications,
            campaign_invitations,
            match_results,
            saved_promoters,
            campaigns,
            social_links,
            portfolio_items,
            verification_requests,
            audit_logs,
            promoter_profiles,
            business_profiles,
            users,
            revoked_refresh_tokens,
            platform_settings
        RESTART IDENTITY CASCADE
    """))
    db.commit()
    print("  Existing data cleared.")


# ---------------------------------------------------------------------------
# Seed users
# ---------------------------------------------------------------------------


def seed_users(db: Session) -> tuple[list[User], list[User]]:
    print("  Creating business users...")
    business_users = []
    for i, (company, industry, location, desc, website, size) in enumerate(BUSINESSES, 1):
        username = f"biz_{company.lower().replace(' ', '_').replace('-', '_')[:12]}_{i}"
        email = f"hello@{company.lower().replace(' ', '').replace('-', '')}.com"
        full_name = generate_full_name()
        user = User(
            id=uuid.uuid4(),
            username=username,
            full_name=full_name,
            email=email,
            password_hash=PASSWORD_HASH,
            role=RoleEnum.BUSINESS,
            is_active=True,
            is_verified=True,
            created_at=NOW - timedelta(days=random.randint(30, 180)),
            updated_at=NOW - timedelta(days=random.randint(0, 7)),
        )
        db.add(user)
        business_users.append(user)

    print("  Creating promoter users...")
    promoter_users = []
    for uname, fname, niche, loc, headline, followers, engage, exp, verified in PROMOTERS:
        email = f"{uname}@example.com"
        user = User(
            id=uuid.uuid4(),
            username=uname,
            full_name=fname,
            email=email,
            password_hash=PASSWORD_HASH,
            role=RoleEnum.PROMOTER,
            is_active=True,
            is_verified=True,
            created_at=NOW - timedelta(days=random.randint(30, 365)),
            updated_at=NOW - timedelta(days=random.randint(0, 7)),
        )
        db.add(user)
        promoter_users.append(user)

    # One admin user
    admin = User(
        id=uuid.uuid4(),
        username="admin",
        full_name="Platform Admin",
        email="admin@b2pconnect.com",
        password_hash=PASSWORD_HASH,
        role=RoleEnum.ADMIN,
        is_active=True,
        is_verified=True,
        created_at=NOW - timedelta(days=365),
        updated_at=NOW,
    )
    db.add(admin)

    db.flush()
    print(f"    Created {len(business_users)} business users, {len(promoter_users)} promoter users, 1 admin")
    return business_users, promoter_users


# ---------------------------------------------------------------------------
# Seed profiles
# ---------------------------------------------------------------------------


def seed_business_profiles(db: Session, business_users: list[User]) -> list[BusinessProfile]:
    print("  Creating business profiles...")
    profiles = []
    for user, (company, industry, location, desc, website, size) in zip(business_users, BUSINESSES):
        profile = BusinessProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            company_name=company,
            industry=industry,
            description=desc,
            location=location,
            website=website,
            logo_url=f"https://picsum.photos/seed/{user.id.hex[:8]}/200/200",
            company_size=size,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        db.add(profile)
        profiles.append(profile)
    db.flush()
    print(f"    Created {len(profiles)} business profiles")
    return profiles


def seed_promoter_profiles(db: Session, promoter_users: list[User]) -> list[PromoterProfile]:
    print("  Creating promoter profiles...")
    profiles = []
    for user, (uname, fname, niche, loc, headline, followers, engage, exp, verified) in zip(promoter_users, PROMOTERS):
        profile = PromoterProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            username=uname,
            headline=headline,
            bio=f"{fname} is a passionate {niche.value.lower()} content creator based in {loc}. "
                f"Creating authentic content that inspires and engages. "
                f"Open for brand collaborations and creative partnerships.",
            niche=niche.value,
            location=loc,
            avatar_url=f"https://picsum.photos/seed/{user.id.hex[:8]}/400/400",
            followers_count=followers,
            engagement_rate=engage,
            years_experience=exp,
            verified=verified,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        db.add(profile)
        profiles.append(profile)
    db.flush()
    print(f"    Created {len(profiles)} promoter profiles")
    return profiles


def seed_social_links(db: Session, promoter_profiles: list[PromoterProfile]) -> int:
    print("  Creating social links...")
    count = 0
    for profile in promoter_profiles:
        platform_count = random.randint(2, 5)
        chosen = random.sample(SOCIAL_PLATFORMS, platform_count)
        for platform, url_template in chosen:
            link = SocialLink(
                id=uuid.uuid4(),
                promoter_profile_id=profile.id,
                platform=platform.value,
                url=url_template.format(profile.username),
                created_at=profile.created_at,
            )
            db.add(link)
            count += 1
    db.flush()
    print(f"    Created {count} social links")
    return count


def seed_portfolio_items(db: Session, promoter_profiles: list[PromoterProfile]) -> int:
    print("  Creating portfolio items...")
    count = 0
    for profile in promoter_profiles:
        item_count = random.randint(1, 4)
        selected_titles = random.sample(PORTFOLIO_TITLES, min(item_count, len(PORTFOLIO_TITLES)))
        for title in selected_titles:
            item = PortfolioItem(
                id=uuid.uuid4(),
                promoter_profile_id=profile.id,
                title=title,
                description=f"A showcase of {title.lower()} projects created for brand partnerships and collaborations with industry-leading companies.",
                image_url=f"https://picsum.photos/seed/{uuid.uuid4().hex[:8]}/800/600",
                external_link=f"https://example.com/portfolio/{profile.username}/{title.lower().replace(' ', '-')}",
                created_at=profile.created_at + timedelta(days=random.randint(1, 60)),
            )
            db.add(item)
            count += 1
    db.flush()
    print(f"    Created {count} portfolio items")
    return count


# ---------------------------------------------------------------------------
# Seed campaigns
# ---------------------------------------------------------------------------


def seed_campaigns(db: Session, business_profiles: list[BusinessProfile]) -> list[Campaign]:
    print("  Creating campaigns...")

    status_distribution = (
        [CampaignStatus.DRAFT] * 5
        + [CampaignStatus.OPEN] * 40
        + [CampaignStatus.ACTIVE] * 30
        + [CampaignStatus.COMPLETED] * 20
        + [CampaignStatus.ARCHIVED] * 5
    )

    # Assign campaigns to businesses with varying loads
    campaign_counts = [15, 12, 12, 10, 10, 10, 10, 8, 8, 5]
    random.shuffle(campaign_counts)

    campaigns = []
    idx = 0
    for bp, count in zip(business_profiles, campaign_counts):
        for _ in range(count):
            status = status_distribution[idx]
            category = random.choice(CAMPAIGN_CATEGORIES)
            title = random.choice(CAMPAIGN_TITLES[category])
            description = generate_campaign_description(category)
            budget = random.randint(500, 50000)
            location = random.choice(CITIES)
            target_audience = (
                f"Young adults aged 18-35 interested in {category.lower()}, "
                f"with a focus on urban professionals and digital natives."
            )
            requirements = (
                f"Creators must have at least 10,000 followers, "
                f"produce high-resolution photo and video content, "
                f"and be able to deliver within the campaign timeframe."
            )
            visibility = random.choice([CampaignVisibility.PUBLIC] * 8 + [CampaignVisibility.PRIVATE] * 2)

            is_past = status in (CampaignStatus.COMPLETED, CampaignStatus.ARCHIVED)
            is_active = status == CampaignStatus.ACTIVE
            is_future = status in (CampaignStatus.DRAFT, CampaignStatus.OPEN)

            if is_past:
                end = NOW - timedelta(days=random.randint(1, 60))
                start = end - timedelta(days=random.randint(14, 60))
            elif is_active:
                start = NOW - timedelta(days=random.randint(1, 30))
                end = NOW + timedelta(days=random.randint(7, 45))
            else:
                start = NOW + timedelta(days=random.randint(1, 60))
                end = start + timedelta(days=random.randint(14, 60))

            campaign = Campaign(
                id=uuid.uuid4(),
                business_profile_id=bp.id,
                title=title,
                description=description,
                category=category,
                budget=float(budget),
                location=location,
                target_audience=target_audience,
                requirements=requirements,
                start_date=start,
                end_date=end,
                status=status,
                visibility=visibility,
                created_at=NOW - timedelta(days=random.randint(1, 90)),
                updated_at=NOW - timedelta(days=random.randint(0, 5)),
            )
            db.add(campaign)
            campaigns.append(campaign)
            idx += 1

    db.flush()
    print(f"    Created {len(campaigns)} campaigns")
    return campaigns


# ---------------------------------------------------------------------------
# Seed applications
# ---------------------------------------------------------------------------


def seed_applications(
    db: Session,
    campaigns: list[Campaign],
    promoter_profiles: list[PromoterProfile],
) -> list[CampaignApplication]:
    print("  Creating applications...")
    applications = []
    used_pairs: set[tuple[str, str]] = set()

    target = 300

    # Assign per-campaign app counts to hit target reliably
    eligible_campaigns = [c for c in campaigns if c.status not in (CampaignStatus.DRAFT, CampaignStatus.ARCHIVED)]
    random.shuffle(eligible_campaigns)

    # Distribute target apps across eligible campaigns (4-7 per campaign)
    num_campaigns = len(eligible_campaigns)
    per_campaign = [0] * num_campaigns
    remaining = target
    for i in range(num_campaigns):
        if remaining <= 0:
            break
        max_for_this = min(remaining, random.randint(4, 7))
        per_campaign[i] = max_for_this
        remaining -= max_for_this
    # Distribute any remaining
    idx = 0
    while remaining > 0 and idx < num_campaigns:
        per_campaign[idx] += 1
        remaining -= 1
        idx += 1

    for campaign, count in zip(eligible_campaigns, per_campaign):
        if count == 0:
            continue
        is_open = campaign.status == CampaignStatus.OPEN
        eligible = [p for p in promoter_profiles if (str(campaign.id), str(p.id)) not in used_pairs]
        random.shuffle(eligible)
        chosen = eligible[:min(count, len(eligible))]
        for promoter in chosen:
            key = (str(campaign.id), str(promoter.id))
            if key in used_pairs:
                continue
            used_pairs.add(key)

            if is_open:
                roll = random.random()
                if roll < 0.40:
                    status = ApplicationStatus.PENDING
                elif roll < 0.60:
                    status = ApplicationStatus.ACCEPTED
                elif roll < 0.85:
                    status = ApplicationStatus.REJECTED
                else:
                    status = ApplicationStatus.WITHDRAWN
            else:
                status = ApplicationStatus.ACCEPTED

            app = CampaignApplication(
                id=uuid.uuid4(),
                campaign_id=campaign.id,
                promoter_profile_id=promoter.id,
                message=generate_app_message(),
                status=status,
                created_at=NOW - timedelta(days=random.randint(1, 60)),
                updated_at=NOW - timedelta(days=random.randint(0, 10)),
            )
            db.add(app)
            applications.append(app)

    db.flush()
    print(f"    Created {len(applications)} applications")
    return applications


# ---------------------------------------------------------------------------
# Seed invitations
# ---------------------------------------------------------------------------


def seed_invitations(
    db: Session,
    campaigns: list[Campaign],
    promoter_profiles: list[PromoterProfile],
    business_profiles: list[BusinessProfile],
) -> list[CampaignInvitation]:
    print("  Creating invitations...")
    invitations = []
    used_pairs: set[tuple[str, str]] = set()

    target = 100
    eligible_campaigns = [c for c in campaigns if c.status not in (CampaignStatus.DRAFT, CampaignStatus.ARCHIVED)]

    for _ in range(target * 2):
        if len(invitations) >= target:
            break
        campaign = random.choice(eligible_campaigns)
        promoter = random.choice(promoter_profiles)
        key = (str(campaign.id), str(promoter.id))
        if key in used_pairs:
            continue
        used_pairs.add(key)

        roll = random.random()
        if roll < 0.35:
            status = InvitationStatus.PENDING
        elif roll < 0.60:
            status = InvitationStatus.ACCEPTED
        elif roll < 0.85:
            status = InvitationStatus.REJECTED
        else:
            status = InvitationStatus.EXPIRED

        invitation = CampaignInvitation(
            id=uuid.uuid4(),
            campaign_id=campaign.id,
            promoter_profile_id=promoter.id,
            message=generate_invitation_message(),
            status=status,
            created_at=NOW - timedelta(days=random.randint(1, 45)),
            updated_at=NOW - timedelta(days=random.randint(0, 10)),
        )
        db.add(invitation)
        invitations.append(invitation)

    db.flush()
    print(f"    Created {len(invitations)} invitations")
    return invitations


# ---------------------------------------------------------------------------
# Seed collaborations
# ---------------------------------------------------------------------------


def seed_collaborations(
    db: Session,
    applications: list[CampaignApplication],
    invitations: list[CampaignInvitation],
    business_profiles: list[BusinessProfile],
    promoter_profiles: list[PromoterProfile],
    campaigns: list[Campaign],
) -> list[Collaboration]:
    print("  Creating collaborations...")
    collaborations = []
    used_pairs: set[tuple[str, str, str]] = set()

    campaign_map = {c.id: c for c in campaigns}
    promoter_map = {p.id: p for p in promoter_profiles}
    business_map = {b.id: b for b in business_profiles}

    target = 160

    # From accepted applications
    accepted_apps = [a for a in applications if a.status == ApplicationStatus.ACCEPTED]
    random.shuffle(accepted_apps)
    for app in accepted_apps:
        if len(collaborations) >= target:
            break
        campaign = campaign_map.get(app.campaign_id)
        if not campaign:
            continue
        key = (str(campaign.id), str(campaign.business_profile_id), str(app.promoter_profile_id))
        if key in used_pairs:
            continue
        used_pairs.add(key)

        # 85% chance of COMPLETED to ensure enough data for reviews
        is_completed = random.random() < 0.85
        collab_status = CollaborationStatus.COMPLETED if is_completed else CollaborationStatus.ACTIVE

        collab = Collaboration(
            id=uuid.uuid4(),
            campaign_id=campaign.id,
            business_profile_id=campaign.business_profile_id,
            promoter_profile_id=app.promoter_profile_id,
            application_id=app.id,
            invitation_id=None,
            status=collab_status,
            started_at=NOW - timedelta(days=random.randint(10, 90)),
            completed_at=NOW - timedelta(days=random.randint(1, 30)) if is_completed else None,
            created_at=NOW - timedelta(days=random.randint(10, 90)),
            updated_at=NOW - timedelta(days=random.randint(0, 5)),
        )
        db.add(collab)
        collaborations.append(collab)

    # From accepted invitations (fill remaining)
    accepted_invs = [i for i in invitations if i.status == InvitationStatus.ACCEPTED]
    random.shuffle(accepted_invs)
    for inv in accepted_invs:
        if len(collaborations) >= target:
            break
        campaign = campaign_map.get(inv.campaign_id)
        if not campaign:
            continue
        key = (str(campaign.id), str(campaign.business_profile_id), str(inv.promoter_profile_id))
        if key in used_pairs:
            continue
        used_pairs.add(key)

        is_completed = random.random() < 0.85
        collab_status = CollaborationStatus.COMPLETED if is_completed else CollaborationStatus.ACTIVE

        collab = Collaboration(
            id=uuid.uuid4(),
            campaign_id=campaign.id,
            business_profile_id=campaign.business_profile_id,
            promoter_profile_id=inv.promoter_profile_id,
            application_id=None,
            invitation_id=inv.id,
            status=collab_status,
            started_at=NOW - timedelta(days=random.randint(10, 90)),
            completed_at=NOW - timedelta(days=random.randint(1, 30)) if is_completed else None,
            created_at=NOW - timedelta(days=random.randint(10, 90)),
            updated_at=NOW - timedelta(days=random.randint(0, 5)),
        )
        db.add(collab)
        collaborations.append(collab)

    db.flush()
    print(f"    Created {len(collaborations)} collaborations")
    return collaborations


# ---------------------------------------------------------------------------
# Seed reviews
# ---------------------------------------------------------------------------


def seed_reviews(db: Session, collaborations: list[Collaboration]) -> int:
    print("  Creating reviews...")
    count = 0
    target = 250

    # Only completed collaborations can have reviews
    completed = [c for c in collaborations if c.status == CollaborationStatus.COMPLETED]
    if not completed:
        print("    WARNING: No completed collaborations found for reviews")
        return 0

    for collab in completed:
        if count >= target:
            break

        campaign = collab.campaign
        rating = random.choice(RATING_DISTRIBUTION)

        if rating >= 4:
            comment = random.choice(POSITIVE_REVIEWS)
        elif rating == 3:
            comment = random.choice(NEUTRAL_REVIEWS)
        else:
            comment = random.choice(NEGATIVE_REVIEWS)

        # Business reviews promoter
        business_user_id = None
        bp = collab.business_profile
        if bp:
            business_user_id = bp.user_id

        promoter_user_id = None
        pp = collab.promoter_profile
        if pp:
            promoter_user_id = pp.user_id

        if business_user_id and promoter_user_id:
            review_biz = Review(
                id=uuid.uuid4(),
                collaboration_id=collab.id,
                reviewer_id=business_user_id,
                reviewee_id=promoter_user_id,
                rating=rating,
                comment=comment,
                created_at=NOW - timedelta(days=random.randint(1, 30)),
                updated_at=NOW - timedelta(days=random.randint(0, 5)),
            )
            db.add(review_biz)
            count += 1

        if count >= target:
            break

        # Promoter reviews business
        rating2 = random.choice(RATING_DISTRIBUTION)
        if rating2 >= 4:
            comment2 = random.choice(POSITIVE_REVIEWS)
        elif rating2 == 3:
            comment2 = random.choice(NEUTRAL_REVIEWS)
        else:
            comment2 = random.choice(NEGATIVE_REVIEWS)

        review_prom = Review(
            id=uuid.uuid4(),
            collaboration_id=collab.id,
            reviewer_id=promoter_user_id,
            reviewee_id=business_user_id,
            rating=rating2,
            comment=comment2,
            created_at=NOW - timedelta(days=random.randint(1, 30)),
            updated_at=NOW - timedelta(days=random.randint(0, 5)),
        )
        db.add(review_prom)
        count += 1

    db.flush()
    print(f"    Created {count} reviews")
    return count


# ---------------------------------------------------------------------------
# Seed saved promoters
# ---------------------------------------------------------------------------


def seed_saved_promoters(
    db: Session,
    business_profiles: list[BusinessProfile],
    promoter_profiles: list[PromoterProfile],
) -> int:
    print("  Creating saved promoters...")
    count = 0
    used_pairs: set[tuple[str, str]] = set()

    for bp in business_profiles:
        num_saved = random.randint(2, 6)
        eligible = [p for p in promoter_profiles if (str(bp.id), str(p.id)) not in used_pairs]
        random.shuffle(eligible)
        for promoter in eligible[:num_saved]:
            key = (str(bp.id), str(promoter.id))
            if key in used_pairs:
                continue
            used_pairs.add(key)
            saved = SavedPromoter(
                id=uuid.uuid4(),
                business_profile_id=bp.id,
                promoter_profile_id=promoter.id,
                created_at=NOW - timedelta(days=random.randint(1, 60)),
            )
            db.add(saved)
            count += 1

    db.flush()
    print(f"    Created {count} saved promoters")
    return count


# ---------------------------------------------------------------------------
# Seed match results
# ---------------------------------------------------------------------------


def seed_match_results(
    db: Session,
    campaigns: list[Campaign],
    promoter_profiles: list[PromoterProfile],
) -> int:
    print("  Creating match results...")
    count = 0

    for campaign in campaigns[:80]:
        num_matches = random.randint(3, 8)
        random_promoters = random.sample(promoter_profiles, min(num_matches, len(promoter_profiles)))
        for promoter in random_promoters:
            score = round(random.uniform(20, 99), 1)
            if score >= 80:
                classification = "EXCELLENT"
            elif score >= 60:
                classification = "GOOD"
            elif score >= 40:
                classification = "FAIR"
            else:
                classification = "POOR"

            breakdown = {
                "niche_match": round(random.uniform(0, 100), 1),
                "audience_overlap": round(random.uniform(0, 100), 1),
                "engagement_quality": round(random.uniform(0, 100), 1),
                "location_relevance": round(random.uniform(0, 100), 1),
                "experience_score": round(random.uniform(0, 100), 1),
            }

            result = MatchResult(
                id=uuid.uuid4(),
                campaign_id=campaign.id,
                promoter_profile_id=promoter.id,
                score=score,
                classification=classification,
                score_breakdown=breakdown,
                created_at=NOW - timedelta(days=random.randint(1, 30)),
            )
            db.add(result)
            count += 1

    db.flush()
    print(f"    Created {count} match results")
    return count


# ---------------------------------------------------------------------------
# Main seed orchestrator
# ---------------------------------------------------------------------------


def seed_all() -> None:
    global PASSWORD_HASH
    PASSWORD_HASH = get_password_hash(SEED_PASSWORD)

    print(f"\n{'=' * 60}")
    print("  B2P Connect - Database Seed Script")
    print(f"{'=' * 60}\n")

    db = SessionLocal()
    try:
        clear_data(db)
        print()

        # Seed users
        business_users, promoter_users = seed_users(db)
        print()

        # Seed profiles
        business_profiles = seed_business_profiles(db, business_users)
        promoter_profiles = seed_promoter_profiles(db, promoter_users)
        print()

        # Seed social links and portfolio items
        social_count = seed_social_links(db, promoter_profiles)
        portfolio_count = seed_portfolio_items(db, promoter_profiles)
        print()

        # Seed campaigns
        campaigns = seed_campaigns(db, business_profiles)
        print()

        # Seed applications and invitations
        applications = seed_applications(db, campaigns, promoter_profiles)
        invitations = seed_invitations(db, campaigns, promoter_profiles, business_profiles)
        print()

        # Seed collaborations
        collaborations = seed_collaborations(
            db, applications, invitations,
            business_profiles, promoter_profiles, campaigns,
        )
        print()

        # Seed reviews (depends on collaborations)
        review_count = seed_reviews(db, collaborations)
        print()

        # Seed saved promoters and match results
        saved_count = seed_saved_promoters(db, business_profiles, promoter_profiles)
        match_count = seed_match_results(db, campaigns, promoter_profiles)
        print()

        db.commit()

        # Summary
        print(f"{'=' * 60}")
        print("  Seeding complete!")
        print(f"{'=' * 60}")
        print(f"  Users:              {len(business_users) + len(promoter_users) + 1}")
        print(f"    Business users:   {len(business_users)}")
        print(f"    Promoter users:   {len(promoter_users)}")
        print(f"    Admin:            1")
        print(f"  Business profiles:  {len(business_profiles)}")
        print(f"  Promoter profiles:  {len(promoter_profiles)}")
        print(f"  Social links:       {social_count}")
        print(f"  Portfolio items:    {portfolio_count}")
        print(f"  Campaigns:          {len(campaigns)}")
        print(f"  Applications:       {len(applications)}")
        print(f"  Invitations:        {len(invitations)}")
        print(f"  Collaborations:     {len(collaborations)}")
        print(f"  Reviews:            {review_count}")
        print(f"  Saved promoters:    {saved_count}")
        print(f"  Match results:      {match_count}")
        print(f"{'=' * 60}\n")

    except Exception:
        db.rollback()
        print("\n  ERROR: Seeding failed. Transaction rolled back.\n", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
