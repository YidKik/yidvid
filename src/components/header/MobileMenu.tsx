
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ContactDialog } from "../contact/ContactDialog";
import { useState } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border-t border-gray-100"
    >
      <nav className="py-2 px-4 space-y-2">
        <Link 
          to="/"
          className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          Home
        </Link>
        <button
          onClick={handleContactClick}
          className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900 w-full text-left"
        >
          Contact Us
        </button>
        <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      </nav>
    </motion.div>
  );
};
