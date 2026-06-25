export interface ProfileCompletionItem {
  key: string;
  label: string;
  weight?: number;
  route?: string;
}

export interface NextBestAction {
  title: string;
  description: string;
  weight: number;
}

export interface ProfileCompletionResponse {
  percentage: number;
  completed_items: ProfileCompletionItem[];
  missing_items: ProfileCompletionItem[];
  next_best_action: NextBestAction | null;
}
