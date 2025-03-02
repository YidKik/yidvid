
import { LayoutConfig } from "./types";
import { LivePreview } from "./LivePreview";

interface PreviewPanelProps {
  sections: LayoutConfig[];
}

export const PreviewPanel = ({ sections }: PreviewPanelProps) => {
  return (
    <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
      <div className="sticky top-0 bg-white p-4 shadow-sm mb-6 rounded-lg">
        <h2 className="text-xl font-semibold">Live Preview</h2>
      </div>
      <LivePreview sections={sections} />
    </div>
  );
};
