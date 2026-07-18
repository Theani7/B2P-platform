export interface ExportRequest {
  module: string;
  format: 'csv' | 'xlsx';
  filters?: Record<string, any>;
  sort?: Record<string, any>;
  columns?: string[];
}

export interface ExportResponse {
  download_url: string;
  expires_at: string;
  filename: string;
}
