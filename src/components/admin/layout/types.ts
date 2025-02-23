
export interface LayoutConfig {
  id: string;
  name: string;
  mobile_order: number;
  desktop_order: number;
  spacing: {
    marginTop: string;
    marginBottom: string;
    padding: string;
  };
  visibility: {
    mobile: boolean;
    desktop: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface LayoutConfigResponse {
  id: string;
  name: string;
  mobile_order: number;
  desktop_order: number;
  spacing: {
    marginTop: string;
    marginBottom: string;
    padding: string;
  } | null;
  visibility: {
    mobile: boolean;
    desktop: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export type SpacingProperty = keyof LayoutConfig['spacing'];
export type VisibilityDevice = keyof LayoutConfig['visibility'];
