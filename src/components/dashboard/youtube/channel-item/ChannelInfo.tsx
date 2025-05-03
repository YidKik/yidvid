
interface ChannelInfoProps {
  title: string;
  description: string | null;
}

export const ChannelInfo = ({ title, description }: ChannelInfoProps) => {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-medium truncate">{title}</h3>
      <p className="text-sm text-gray-500 truncate max-w-[200px]">
        {description || 'No description'}
      </p>
    </div>
  );
};
