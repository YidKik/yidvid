import {
  Home, PlayCircle, Sparkles, Clapperboard, Users, LayoutGrid, History, Heart, Clock,
  ListMusic, Bell, Settings, Info, type LucideIcon,
} from "lucide-react";

export interface NavLinkItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

/** Single source of truth for sidebar + bottom nav destinations. */
export const DISCOVER_ITEMS: NavLinkItem[] = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "videos", label: "Videos", path: "/videos", icon: PlayCircle },
  { id: "new", label: "New Videos", path: "/videos?sort=newest", icon: Sparkles },
  { id: "shorts", label: "Shorts", path: "/shorts", icon: Clapperboard },
  { id: "channels", label: "Channels", path: "/channels", icon: Users },
];

export const CATEGORIES_ICON = LayoutGrid;

export const LIBRARY_ITEMS: NavLinkItem[] = [
  { id: "history", label: "History", path: "/history", icon: History },
  { id: "favorites", label: "Favorites", path: "/favorites", icon: Heart },
  { id: "watch-later", label: "Watch Later", path: "/watch-later", icon: Clock },
  { id: "playlists", label: "Playlists", path: "/playlists", icon: ListMusic },
  { id: "subscriptions", label: "Subscriptions", path: "/subscriptions", icon: Bell },
];

export const ACCOUNT_ITEMS: NavLinkItem[] = [
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
  { id: "about", label: "About", path: "/about", icon: Info },
];

/**
 * Route-aware selection. Exact root matching; /videos variants are mutually exclusive
 * (plain, ?sort=newest, ?category=...).
 */
export function isNavPathActive(path: string, pathname: string, search: string): boolean {
  const [base, query] = path.split("?");
  const params = new URLSearchParams(search);
  if (base === "/videos") {
    if (pathname !== "/videos") return false;
    if (params.get("category")) return false;
    if (query) return params.get("sort") === new URLSearchParams(query).get("sort");
    return !params.get("sort");
  }
  if (base === "/") return pathname === "/";
  if (base === "/shorts") return pathname === "/shorts" || pathname.startsWith("/shorts/");
  if (base === "/channels") return pathname === "/channels" || pathname.startsWith("/channel/");
  if (base === "/settings") return pathname === "/settings" || pathname.startsWith("/settings/");
  return pathname === base;
}

export function isCategoryRouteActive(pathname: string, search: string, id?: string) {
  if (pathname !== "/videos") return false;
  const c = new URLSearchParams(search).get("category");
  return id ? c === id : !!c;
}

export const isLibraryRoute = (pathname: string) => LIBRARY_ITEMS.some((i) => i.path === pathname);
export const isMoreRoute = (pathname: string, search: string) =>
  ["/settings", "/about", "/channels"].some((p) => pathname === p || pathname.startsWith(p + "/")) ||
  pathname.startsWith("/channel/") ||
  isNavPathActive("/videos?sort=newest", pathname, search) ||
  isCategoryRouteActive(pathname, search);
