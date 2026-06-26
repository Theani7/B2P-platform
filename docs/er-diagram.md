# Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| BUSINESS_PROFILES : "1:1"
    USERS ||--o| PROMOTER_PROFILES : "1:1"
    USERS ||--o{ REFRESH_TOKENS : "1:M"
    USERS ||--o{ SEARCH_HISTORY : "1:M"

    BUSINESS_PROFILES ||--o{ CAMPAIGNS : "1:M"
    PROMOTER_PROFILES ||--o{ APPLICATIONS : "1:M"
    PROMOTER_PROFILES ||--o{ PORTFOLIO_ITEMS : "1:M"

    CAMPAIGNS ||--o{ APPLICATIONS : "1:M"
    CAMPAIGNS ||--o{ COLLABORATIONS : "1:M"

    APPLICATIONS ||--|| COLLABORATIONS : "1:1 (When Approved)"

    COLLABORATIONS ||--o{ REVIEWS : "1:M"
    COLLABORATIONS ||--o{ MESSAGES : "1:M"
```
