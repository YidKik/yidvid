import { Link } from "react-router-dom";
import yidvidLogo from "@/assets/yidvid-logo-icon.png";

export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border/50 bg-muted/30">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-12 xl:px-16 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <img 
              src={yidvidLogo} 
              alt="YidVid" 
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground font-friendly">YidVid</span>
              <span className="text-sm text-muted-foreground">Safe videos for the whole family</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} YidVid. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
