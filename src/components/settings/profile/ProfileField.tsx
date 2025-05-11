
import { CopyToClipboard } from "./CopyUtils.tsx";

interface ProfileFieldProps {
  label: string;
  value: string;
  isMobile?: boolean;
}

export const ProfileField = ({ label, value, isMobile = false }: ProfileFieldProps) => {
  // Display appropriate fallback text when value is empty
  const displayValue = value ? 
    (isMobile && value.length > 12 ? `${value.slice(0, 12)}...` : value) : 
    (label === "Username" ? "No username" : "");
    
  return (
    <div className="flex items-center gap-1 text-muted-foreground overflow-hidden">
      <span className={`${isMobile ? 'text-[10px]' : 'text-sm'} font-medium whitespace-nowrap`}>{label}:</span>
      <span className={`${isMobile ? 'text-[10px]' : 'text-sm'} font-normal flex items-center truncate`}>
        {displayValue}
        {value && (label === "Email" || label === "Username") && (
          <CopyToClipboard textToCopy={value} label={label} />
        )}
      </span>
    </div>
  );
};
