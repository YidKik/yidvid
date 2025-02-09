
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Define the message type for better type safety
type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
  videoId?: string;
}

export const VideoAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<AssistantMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const navigate = useNavigate();

  const { data: videos } = useQuery({
    queryKey: ["all_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .is('deleted_at', null)
        .order("views", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage: AssistantMessage = { role: 'user', content: userInput };
    setConversation([...conversation, newMessage]);
    setUserInput("");

    // Simulate AI response with video recommendation
    if (videos && videos.length > 0) {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const response: AssistantMessage = {
        role: 'assistant',
        content: `Based on your interest, I recommend watching "${randomVideo.title}". Would you like to check it out?`,
        videoId: randomVideo.id
      };
      
      setTimeout(() => {
        setConversation(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-4 right-4 z-50"
      >
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`bg-white rounded-lg shadow-xl border border-gray-200 ${
              isMinimized ? 'w-64' : 'w-80'
            }`}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Video Assistant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <ScrollArea className="h-64 p-3">
                  <div className="space-y-4">
                    {conversation.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.content}
                          {message.videoId && (
                            <Button
                              variant="link"
                              className="text-xs mt-1 text-primary-foreground underline"
                              onClick={() => handleVideoClick(message.videoId)}
                            >
                              Watch Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="p-3 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Ask for video recommendations..."
                      className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button type="submit" size="sm">
                      Send
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
