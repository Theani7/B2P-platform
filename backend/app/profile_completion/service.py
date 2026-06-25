from app.models.user import User
from app.profile_completion.calculations import calculate_business_completion, calculate_promoter_completion

class ProfileCompletionService:
    def __init__(self, repository=None):
        self.repository = repository
        
    def get_business_completion(self, user: User):
        return calculate_business_completion(user)
        
    def get_promoter_completion(self, user: User):
        return calculate_promoter_completion(user)
