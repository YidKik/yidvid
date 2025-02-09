
import { Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddChannelForm } from "@/components/AddChannelForm";
import { AddVideoForm } from "@/components/youtube/AddVideoForm";
import { toast } from "sonner";

interface ChannelsHeaderProps {
  isVideoDialogOpen: boolean;
  setIsVideoDialogOpen: (open: boolean) => void;
  isChannelDialogOpen: boolean;
  setIsChannelDialogOpen: (open: boolean) => void;
  refetchChannels: () => void;
}

export const ChannelsHeader = ({
  isVideoDialogOpen,
  setIsVideoDialogOpen,
  isChannelDialogOpen,
  setIsChannelDialogOpen,
  refetchChannels,
}: ChannelsHeaderProps) => {
  const handleSuccess = () => {
    setIsChannelDialogOpen(false);
    refetchChannels();
    toast.success("Channel added successfully");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">YouTube Channels</h2>
        <div className="flex items-center gap-4">
          <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                size="lg"
                className="inline-flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary/10 font-semibold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Video className="h-6 w-6" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Single Video</DialogTitle>
              </DialogHeader>
              <AddVideoForm
                onClose={() => setIsVideoDialogOpen(false)}
                onSuccess={() => {
                  setIsVideoDialogOpen(false);
                  refetchChannels();
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default"
                size="lg"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-6 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Plus className="h-6 w-6" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add YouTube Channel</DialogTitle>
              </DialogHeader>
              <AddChannelForm
                onClose={() => setIsChannelDialogOpen(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
