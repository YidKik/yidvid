
import { CopyToClipboard } from "./CopyUtils.tsx";

interface ProfileFieldProps {
  label: string;
  value: string;
  isMobile?: boolean;
}

export const ProfileField = ({ label, value, isMobile = false }: ProfileFieldProps) => {
  // Truncate value if it's too long (especially for mobile)
  const displayValue = isMobile && value.length > 12 
    ? `${value.slice(0, 12)}...` 
    : value;
    
  return (
    <div className="flex items-center gap-1 text-muted-foreground overflow-hidden">
      <span className={`${isMobile ? 'text-[10px]' : 'text-sm'} font-medium whitespace-nowrap`}>{label}:</span>
      <span className={`${isMobile ? 'text-[10px]' : 'text-sm'} font-normal flex items-center truncate`}>
        {displayValue}
        {(label === "Email" || label === "Username") && (
          <CopyToClipboard textToCopy={value} label={label} />
        )}
      </span>
    </div>
  );
};
