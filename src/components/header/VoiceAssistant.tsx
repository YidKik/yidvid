
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mic, MicOff } from 'lucide-react';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  onSpeakingChange: (speaking: boolean) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSpeakingChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startConversation = async () => {
    try {
      const chat = new RealtimeChat((message) => {
        console.log('Message received:', message);
        if (message.type === 'response.audio.delta') {
          onSpeakingChange(true);
          setIsListening(true);
        } else if (message.type === 'response.audio.done') {
          onSpeakingChange(false);
          setIsListening(false);
        }
      });
      
      await chat.init();
      setIsConnected(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error("Couldn't start the voice assistant. Please try again.");
    }
  };

  const endConversation = () => {
    setIsConnected(false);
    setIsListening(false);
    onSpeakingChange(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={isConnected ? endConversation : startConversation}
        variant="ghost"
        size="icon"
        className={cn(
          "relative w-9 h-9 p-2 rounded-full transition-colors z-10",
          isConnected && "bg-primary/10 hover:bg-primary/20",
          isListening && "animate-none"
        )}
      >
        {isConnected ? (
          <Mic className={cn(
            "h-5 w-5",
            isListening ? "text-primary" : "text-primary/80"
          )} />
        ) : (
          <MicOff className="h-5 w-5 text-primary/80" />
        )}
      </Button>
      
      {/* Animated circles */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
          <div className="absolute -inset-2 rounded-full animate-pulse-slow bg-primary/20" />
          <div className="absolute -inset-4 rounded-full animate-pulse-slower bg-primary/10" />
        </>
      )}
    </div>
  );
};
