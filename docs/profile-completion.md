# Profile Completion Engine

## Overview

The Dynamic Profile Completion Engine calculates the profile completeness of both Business and Promoter users. It provides real-time scoring, checklist generation, and intelligent "next best action" recommendations to drive users to fully optimize their profiles.

## Business Profile Calculation

The Business profile score is heavily oriented toward company information and social proof.

| Field | Weight | Description |
|-------|--------|-------------|
| Company Name | 10% | The registered company name |
| Logo | 10% | Uploaded company logo URL |
| Industry | 10% | Business industry categorization |
| Description | 15% | Detailed about section |
| Website | 10% | Company website URL |
| Location | 10% | HQ or primary location |
| Contact Information | 10% | Primary contact details |
| Campaign Activity | 15% | At least 1 published campaign |
| Verification | 5% | Official platform verification |
| Social Links | 5% | Linked external socials |

## Promoter Profile Calculation

The Promoter profile score is oriented toward content creation history, portfolio size, and niche expertise.

| Field | Weight | Description |
|-------|--------|-------------|
| Profile Photo | 10% | Avatar image |
| Headline | 10% | Short impactful title |
| Bio | 15% | Detailed biography |
| Primary Niche | 10% | Main content category |
| Location | 10% | Current location |
| Experience | 10% | Years of experience |
| Portfolio | 20% | Quality portfolio items |
| Social Links | 10% | Linked platforms (Insta, TikTok, etc.) |
| Contact Information | 5% | Direct contact email/phone |

## API Contract

Both endpoints (`GET /api/v1/profile-completion/business` and `GET /api/v1/profile-completion/promoter`) return the following `ProfileCompletionResponse` schema:

```json
{
  "percentage": 78,
  "completed_items": [
    {
      "key": "bio",
      "label": "Biography",
      "route": "/settings#bio"
    }
  ],
  "missing_items": [
    {
      "key": "portfolio",
      "label": "Portfolio",
      "weight": 20,
      "route": "/settings#portfolio"
    }
  ],
  "next_best_action": {
    "title": "Upload your portfolio",
    "description": "Completing your portfolio can significantly improve your visibility to businesses.",
    "weight": 20
  }
}
```

## Smart Recommendations

The engine always evaluates the array of `missing_items`, sorts them by their `weight` descending, and sets the top item as the `next_best_action`.

## Future Extensions

Additional fields can be integrated cleanly into the calculation engine by adding their keys to the respective weighting dictionary in `backend/app/profile_completion/calculations.py`.

* **Reviews Score**: Can add 10% weight if a user has at least 3 reviews above 4.5 stars.
* **Response Rate**: Can add 5% weight if a promoter maintains a >90% message response rate.
* **Stripe KYC**: Can add 10% weight once identity verification is completed via payment gateway.
