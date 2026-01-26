import { Link } from "react-router-dom";
import yidvidLogo from "@/assets/yidvid-logo-icon.png";

export const Footer = () => {
  return (
    <footer className="mt-8 border-t border-border/20 bg-muted/10">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-2">
            <img 
              src={yidvidLogo} 
              alt="YidVid" 
              className="w-6 h-6 object-contain opacity-60"
            />
            <span className="text-xs text-muted-foreground/70">Safe videos for the whole family</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs">
            <Link 
              to="/terms" 
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Terms
            </Link>
            <Link 
              to="/privacy" 
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} YidVid
          </div>
        </div>
      </div>
    </footer>
  );
};
