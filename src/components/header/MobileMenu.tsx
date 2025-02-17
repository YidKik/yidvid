
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ContactDialog } from "../contact/ContactDialog";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;

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
        <ContactDialog />
      </nav>
    </motion.div>
  );
};
