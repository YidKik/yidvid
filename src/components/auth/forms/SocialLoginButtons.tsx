
import { useIsMobile } from "@/hooks/use-mobile";

export const SocialLoginButtons = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) return null;
  
  return (
    <>
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-sm text-gray-400">Or continue with</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          className="flex justify-center items-center py-2 px-4 border border-[#ea384c] rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="h-5 w-5 mr-2" />
          <span className="text-sm">Google</span>
        </button>
        <button
          type="button"
          className="flex justify-center items-center py-2 px-4 border border-[#ea384c] rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook" className="h-5 w-5 mr-2" />
          <span className="text-sm">Facebook</span>
        </button>
        <button
          type="button"
          className="flex justify-center items-center py-2 px-4 border border-[#ea384c] rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" className="h-5 w-5 mr-2" />
          <span className="text-sm">Apple</span>
        </button>
      </div>
    </>
  );
};
