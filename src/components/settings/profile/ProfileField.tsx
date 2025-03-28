
import { CopyToClipboard } from "./CopyUtils";

interface ProfileFieldProps {
  label: string;
  value: string;
  isMobile?: boolean;
}

export const ProfileField = ({ label, value, isMobile = false }: ProfileFieldProps) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{label}:</span>
      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-normal flex items-center`}>
        {value}
        {(label === "Email" || label === "Username") && (
          <CopyToClipboard textToCopy={value} />
        )}
      </span>
    </div>
  );
};
