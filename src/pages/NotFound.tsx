import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import yidvidLogo from "@/assets/yidvid-logo-full.png";
import { Helmet } from "react-helmet";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Oops! Page Not Found | YidVid</title>
      </Helmet>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#FAFAFA] to-white"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <img src={yidvidLogo} alt="YidVid" className="h-14 mb-8" />
          </Link>
        </motion.div>

        {/* Big 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[120px] sm:text-[160px] font-black leading-none"
          style={{
            background: "linear-gradient(135deg, #C9253A, #C9253A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </motion.h1>

        {/* Friendly message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="text-center max-w-md mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Uh oh, wrong turn! 🙈
          </h2>
          <p className="text-base text-muted-foreground font-medium leading-relaxed">
            This page took a vacation and forgot to tell us.
            <br />
            Let's get you back to the good stuff!
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mobile-not-found-actions flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          <Button
            asChild
            className="flex-1 h-12 text-base bg-primary hover:brightness-90 text-white rounded-card font-semibold shadow-md hover:shadow-raised gap-2"
          >
            <Link to="/">
              <Home size={18} />
              Go Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 text-base border-2 border-brand text-brand bg-card hover:bg-primary hover:text-primary-foreground rounded-card font-semibold shadow-sm hover:shadow-md gap-2"
          >
            <Link to="/videos">
              <Search size={18} />
              Browse Videos
            </Link>
          </Button>
        </motion.div>

        {/* Back link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => window.history.back()}
          className="mt-4 min-h-11 px-3 rounded-control type-label text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} />
          Go back to previous page
        </motion.button>
      </div>
    </>
  );
}
