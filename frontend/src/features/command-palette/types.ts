export type CommandType = 'navigation' | 'action' | 'search' | 'recent_page';

export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  type: CommandType;
  action: () => void;
  keywords?: string[];
}

export interface RecentPage {
  path: string;
  title: string;
  timestamp: number;
}
