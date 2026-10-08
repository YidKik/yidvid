import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown, PanelLeftClose, PanelLeftOpen, HelpCircle, LogIn, Library, Mail, FileText, Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import yidvidLogoIcon from "@/assets/yidvid-logo-icon.png";
import { useCategories } from "@/hooks/useCategories";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DISCOVER_ITEMS, LIBRARY_ITEMS, ACCOUNT_ITEMS, CATEGORIES_ICON, isNavPathActive, isCategoryRouteActive, isLibraryRoute,
  type NavLinkItem,
} from "./navConfig";
import { useNavDialogs } from "./NavDialogs";

interface SidebarProps {
  isAuthenticated?: boolean;
  userId?: string;
}

const rowBase =
  "flex items-center min-h-11 rounded-control text-sm leading-5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring";
const rowState = (active: boolean) =>
  active
    ? "bg-brand/10 text-brand"
    : "text-foreground hover:bg-surface-hover";

export const Sidebar = ({ isAuthenticated = false }: SidebarProps) => {
  const location = useLocation();
  const { isExpanded, setIsExpanded } = useSidebarContext();
  const auth = useAuthDialog();
  const { allCategories } = useCategories();
  const { openDialog, element: dialogs } = useNavDialogs();
  const categoryActive = isCategoryRouteActive(location.pathname, location.search);
  const [catOpen, setCatOpen] = useState(categoryActive);
  useEffect(() => { if (categoryActive) setCatOpen(true); }, [categoryActive]);

  const categories = allCategories.filter((c) => !(c.icon?.startsWith("http") || c.icon?.startsWith("/")));
  const expanded = isExpanded;

  const withTip = (label: string, node: JSX.Element) =>
    expanded ? node : (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );

  const renderLink = (item: NavLinkItem) => {
    const active = isNavPathActive(item.path, location.pathname, location.search);
    const Icon = item.icon;
    return (
      <li key={item.id}>
        {withTip(item.label,
          <Link
            to={item.path}
            aria-current={active ? "page" : undefined}
            aria-label={expanded ? undefined : item.label}
            className={cn(rowBase, rowState(active), expanded ? "gap-3 px-3" : "justify-center w-12 mx-auto")}
          >
            <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />
            {expanded && <span className="truncate">{item.label}</span>}
          </Link>
        )}
      </li>
    );
  };

  /** Collapsed rail: named anchored menu panel instead of tiny nested icons. */
  const railMenu = (label: string, Icon: LucideIcon, active: boolean, items: { id: string; label: string; path: string }[]) => (
    <li>
      <DropdownMenu>
        {withTip(label,
          <DropdownMenuTrigger
            aria-label={label}
            className={cn(rowBase, rowState(active), "justify-center w-12 mx-auto")}
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} aria-hidden />
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent side="right" align="start" className="w-56 max-h-[70vh] overflow-y-auto">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {items.map((i) => {
            const a = i.path.includes("category=")
              ? isCategoryRouteActive(location.pathname, location.search, i.id)
              : isNavPathActive(i.path, location.pathname, location.search);
            return (
              <DropdownMenuItem key={i.id} asChild className={cn("min-h-11", a && "text-brand")}>
                <Link to={i.path} aria-current={a ? "page" : undefined}>{i.label}</Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );

  const groupHeading = (text: string, id: string) =>
    expanded ? <h2 id={id} className="px-3 pt-2 pb-1 type-label text-muted-foreground">{text}</h2> : <h2 id={id} className="sr-only">{text}</h2>;

  const CatIcon = CATEGORIES_ICON;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-background border-r border-border transition-[width] duration-200"
        style={{ width: "var(--sidebar-w)" }}
      >
        {/* Brand + collapse */}
        <div className={cn("flex items-center h-14 shrink-0 px-3", expanded ? "justify-between" : "justify-center")}>
          {expanded && (
            <Link to="/" className="flex items-center gap-2 min-h-11 rounded-control" aria-label="YidVid home">
              <img src={yidvidLogoIcon} alt="" className="w-8 h-8 object-contain" />
              <span className="type-h3 text-foreground">YidVid</span>
            </Link>
          )}
          {withTip(expanded ? "Collapse sidebar" : "Expand sidebar",
            <button
              type="button"
              onClick={() => setIsExpanded(!expanded)}
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={expanded}
              className="w-11 h-11 flex items-center justify-center rounded-control text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              {expanded ? <PanelLeftClose className="w-5 h-5" strokeWidth={1.75} /> : <PanelLeftOpen className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          )}
        </div>

        {/* Scrollable middle */}
        <nav aria-label="Main" className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          <section aria-labelledby="nav-discover">
            {groupHeading("Discover", "nav-discover")}
            <ul className="space-y-1">
              {DISCOVER_ITEMS.map(renderLink)}
              {expanded ? (
                <li>
                  <button
                    type="button"
                    aria-expanded={catOpen}
                    aria-controls="nav-categories"
                    onClick={() => setCatOpen(!catOpen)}
                    className={cn(rowBase, "w-full gap-3 px-3", categoryActive && !catOpen ? rowState(true) : rowState(false))}
                  >
                    <CatIcon className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="flex-1 text-left">Categories</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", catOpen && "rotate-180")} aria-hidden />
                  </button>
                  {catOpen && (
                    <ul id="nav-categories" className="mt-1 space-y-1">
                      {categories.map((c) => {
                        const a = isCategoryRouteActive(location.pathname, location.search, c.id);
                        return (
                          <li key={c.id}>
                            <Link
                              to={`/videos?category=${c.id}`}
                              aria-current={a ? "page" : undefined}
                              className={cn(rowBase, rowState(a), "pl-11 pr-3")}
                            >
                              <span className="truncate">{c.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ) : (
                railMenu("Categories", CatIcon, categoryActive,
                  categories.map((c) => ({ id: c.id, label: c.label, path: `/videos?category=${c.id}` })))
              )}
            </ul>
          </section>

          <div className="my-3 border-t border-border" role="presentation" />

          <section aria-labelledby="nav-library">
            {groupHeading("Library", "nav-library")}
            <ul className="space-y-1">
              {expanded
                ? LIBRARY_ITEMS.map(renderLink)
                : railMenu("Library", Library, isLibraryRoute(location.pathname), LIBRARY_ITEMS)}
            </ul>
          </section>
        </nav>

        {/* Footer / account */}
        <div className="shrink-0 border-t border-border px-3 py-2">
          <ul className="space-y-1" aria-label="Account and help">
            {renderLink(ACCOUNT_ITEMS[0])}
            <li>
              <DropdownMenu>
                {withTip("Help & info",
                  <DropdownMenuTrigger
                    aria-label="Help and info"
                    className={cn(rowBase, rowState(location.pathname === "/about"), expanded ? "w-full gap-3 px-3" : "justify-center w-12 mx-auto")}
                  >
                    <HelpCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {expanded && <span className="flex-1 text-left">Help & info</span>}
                  </DropdownMenuTrigger>
                )}
                <DropdownMenuContent side={expanded ? "top" : "right"} align="start" className="w-56">
                  <DropdownMenuItem asChild className="min-h-11">
                    <Link to="/about" aria-current={location.pathname === "/about" ? "page" : undefined}>
                      <ACCOUNT_ITEMS[1].icon className="w-4 h-4 mr-2" /> About YidVid
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="min-h-11" onSelect={() => openDialog("contact")}>
                    <Mail className="w-4 h-4 mr-2" /> Contact us
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="min-h-11" onSelect={() => openDialog("terms")}>
                    <FileText className="w-4 h-4 mr-2" /> Terms of Service
                  </DropdownMenuItem>
                  <DropdownMenuItem className="min-h-11" onSelect={() => openDialog("privacy")}>
                    <Shield className="w-4 h-4 mr-2" /> Privacy Policy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            {!isAuthenticated && (
              <li>
                {withTip("Sign in",
                  <button
                    type="button"
                    onClick={() => auth?.setIsAuthOpen(true)}
                    aria-label={expanded ? undefined : "Sign in"}
                    className={cn(rowBase, rowState(false), expanded ? "w-full gap-3 px-3" : "justify-center w-12 mx-auto")}
                  >
                    <LogIn className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {expanded && <span>Sign in</span>}
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
        {dialogs}
      </aside>
    </TooltipProvider>
  );
};

export { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/contexts/SidebarContext";
