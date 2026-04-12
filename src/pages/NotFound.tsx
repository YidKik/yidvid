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
        style={{ fontFamily: "'Quicksand', 'Rubik', sans-serif" }}
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
          className="text-[120px] sm:text-[160px] font-black leading-none tracking-tight"
          style={{
            background: "linear-gradient(135deg, #FF0000, #FFCC00)",
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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
            Uh oh, wrong turn! 🙈
          </h2>
          <p className="text-base text-[#666] font-medium leading-relaxed">
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
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          <Button
            asChild
            className="flex-1 h-12 text-base bg-[#FF0000] hover:brightness-90 text-white rounded-2xl font-semibold shadow-md hover:shadow-lg gap-2"
          >
            <Link to="/">
              <Home size={18} />
              Go Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 text-base border-2 border-[#FFCC00] text-[#1A1A1A] bg-white hover:bg-[#FFCC00] rounded-2xl font-semibold shadow-sm hover:shadow-md gap-2"
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
          className="mt-6 text-sm text-[#999] hover:text-[#666] font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          Go back to previous page
        </motion.button>
      </div>
    </>
  );
}
