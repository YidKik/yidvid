
export interface DashboardStats {
  totalChannels?: number;
  totalVideos?: number;
  totalComments?: number;
  totalUsers?: number;
}

export interface AdminNotification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
