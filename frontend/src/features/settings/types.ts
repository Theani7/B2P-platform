export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_at: string;
}

export interface PlatformSettingListResponse {
  items: PlatformSetting[];
}
