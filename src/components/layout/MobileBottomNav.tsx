import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Library, Menu, X, ChevronDown, Mail, FileText, Shield, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import {
  DISCOVER_ITEMS, LIBRARY_ITEMS, ACCOUNT_ITEMS, CATEGORIES_ICON,
  isNavPathActive, isCategoryRouteActive, isLibraryRoute, isMoreRoute,
} from "./navConfig";
import { useNavDialogs } from "./NavDialogs";

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

type SheetKind = "library" | "more" | null;
const byId = (id: string) => DISCOVER_ITEMS.find((i) => i.id === id)!;

export const MobileBottomNav = (_props: MobileBottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allCategories } = useCategories();
  const { openDialog, element: dialogs } = useNavDialogs();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [catOpen, setCatOpen] = useState(false);
  const pushedRef = useRef(false);

  const categories = allCategories.filter((c) => !(c.icon?.startsWith("http") || c.icon?.startsWith("/")));
  const { pathname, search } = location;

  // Browser back dismisses an open sheet: push a marker entry while open.
  useEffect(() => {
    if (!sheet) return;
    window.history.pushState({ ...window.history.state, yvNavSheet: true }, "");
    pushedRef.current = true;
    const onPop = () => { pushedRef.current = false; setSheet(null); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [sheet]);

  // Route change closes sheet.
  useEffect(() => { setSheet(null); }, [pathname, search]);

  const closeSheet = () => {
    if (pushedRef.current) { pushedRef.current = false; window.history.back(); }
    setSheet(null);
  };

  /** Navigate from within the sheet, replacing the marker entry so Back works normally. */
  const go = (path: string) => {
    const replace = pushedRef.current;
    pushedRef.current = false;
    setSheet(null);
    navigate(path, { replace });
  };

  /** Close sheet first, then launch existing popup (no stacked dialogs). */
  const launch = (kind: "contact" | "terms" | "privacy") => {
    closeSheet();
    setTimeout(() => openDialog(kind), 150);
  };

  const tabs: { id: string; label: string; icon: LucideIcon; active: boolean; path?: string; sheet?: SheetKind }[] = [
    { ...byId("home"), active: !sheet && isNavPathActive("/", pathname, search) },
    { ...byId("videos"), active: !sheet && isNavPathActive("/videos", pathname, search) },
    { ...byId("shorts"), active: !sheet && isNavPathActive("/shorts", pathname, search) },
    { id: "library", label: "Library", icon: Library, sheet: "library", active: sheet === "library" || (!sheet && isLibraryRoute(pathname)) },
    { id: "more", label: "More", icon: Menu, sheet: "more", active: sheet === "more" || (!sheet && isMoreRoute(pathname, search)) },
  ];

  const sheetLink = (id: string, label: string, path: string, Icon?: LucideIcon, active?: boolean, indent = false) => (
    <li key={id}>
      <Link
        to={path}
        onClick={(e) => { e.preventDefault(); go(path); }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 min-h-11 px-3 rounded-control text-sm leading-5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "bg-brand/10 text-brand" : "text-foreground hover:bg-surface-hover",
          indent && "pl-11",
        )}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />}
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );

  const actionRow = (label: string, Icon: LucideIcon, onClick: () => void) => (
    <li key={label}>
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 min-h-11 px-3 rounded-control text-sm leading-5 font-medium text-foreground hover:bg-surface-hover outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />
        {label}
      </button>
    </li>
  );

  const groupLabel = (t: string) => <h3 className="px-3 pt-3 pb-1 type-label text-muted-foreground">{t}</h3>;
  const CatIcon = CATEGORIES_ICON;
  const catActive = isCategoryRouteActive(pathname, search);

  return (
    <>
      <DialogPrimitive.Root open={!!sheet} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-foreground/30 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="phone-nav-sheet fixed inset-x-0 bottom-0 z-[61] mx-auto w-full max-w-[720px] max-h-[85dvh] flex flex-col bg-card text-foreground border-t border-border rounded-t-dialog shadow-overlay outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between px-4 pt-2 pb-1 shrink-0">
              <DialogPrimitive.Title className="type-h3">{sheet === "library" ? "Library" : "More"}</DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label={`Close ${sheet === "library" ? "Library" : "More"}`}
                className="w-11 h-11 flex items-center justify-center rounded-control text-muted-foreground hover:bg-surface-hover outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="w-5 h-5" />
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Description className="sr-only">
              {sheet === "library" ? "Your saved videos and history" : "More pages and information"}
            </DialogPrimitive.Description>
            <nav aria-label={sheet === "library" ? "Library" : "More"} className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
              {sheet === "library" && (
                <ul className="space-y-1">
                  {LIBRARY_ITEMS.map((i) => sheetLink(i.id, i.label, i.path, i.icon, pathname === i.path))}
                </ul>
              )}
              {sheet === "more" && (
                <>
                  {groupLabel("Explore")}
                  <ul className="space-y-1">
                    {["new", "channels"].map((id) => {
                      const i = byId(id);
                      return sheetLink(i.id, i.label, i.path, i.icon, isNavPathActive(i.path, pathname, search));
                    })}
                    <li>
                      <button
                        type="button"
                        aria-expanded={catOpen}
                        aria-controls="sheet-categories"
                        onClick={() => setCatOpen(!catOpen)}
                        className={cn(
                          "w-full flex items-center gap-3 min-h-11 px-3 rounded-control text-sm leading-5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          catActive ? "text-brand" : "text-foreground hover:bg-surface-hover",
                        )}
                      >
                        <CatIcon className="w-5 h-5 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span className="flex-1 text-left">Categories</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", catOpen && "rotate-180")} aria-hidden />
                      </button>
                      {catOpen && (
                        <ul id="sheet-categories" className="space-y-1 mt-1">
                          {categories.map((c) =>
                            sheetLink(c.id, c.label, `/videos?category=${c.id}`, undefined, isCategoryRouteActive(pathname, search, c.id), true))}
                        </ul>
                      )}
                    </li>
                  </ul>
                  {groupLabel("Account")}
                  <ul className="space-y-1">
                    {ACCOUNT_ITEMS.map((i) => sheetLink(i.id, i.label, i.path, i.icon, isNavPathActive(i.path, pathname, search)))}
                  </ul>
                  {groupLabel("Help & legal")}
                  <ul className="space-y-1">
                    {actionRow("Contact us", Mail, () => launch("contact"))}
                    {actionRow("Terms of Service", FileText, () => launch("terms"))}
                    {actionRow("Privacy Policy", Shield, () => launch("privacy"))}
                  </ul>
                </>
              )}
            </nav>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5 h-16 max-w-[720px] mx-auto px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const cls = cn(
              "w-full h-full flex flex-col items-center justify-center gap-1 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
              t.active ? "text-brand" : "text-muted-foreground hover:text-foreground",
            );
            const inner = (
              <span className={cn("flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-control", t.active && "bg-brand/10")}>
                <Icon className="w-[22px] h-[22px]" strokeWidth={1.75} aria-hidden />
                <span className="text-xs leading-4 font-medium">{t.label}</span>
              </span>
            );
            return (
              <li key={t.id} className="flex items-stretch py-1">
                {t.path ? (
                  <Link to={t.path} aria-current={t.active ? "page" : undefined} className={cls}>{inner}</Link>
                ) : (
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={sheet === t.sheet}
                    onClick={() => (sheet === t.sheet ? closeSheet() : setSheet(t.sheet!))}
                    className={cls}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {dialogs}
    </>
  );
};
