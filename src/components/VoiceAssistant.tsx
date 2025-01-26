import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'response.audio.delta') {
      onSpeakingChange(true);
      setIsListening(true);
    } else if (event.type === 'response.audio.done') {
      onSpeakingChange(false);
      setIsListening(false);
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Voice Assistant Ready",
        description: "You can now speak your request",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start voice assistant',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsListening(false);
    onSpeakingChange(false);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Button
      onClick={isConnected ? endConversation : startConversation}
      variant="ghost"
      size="icon"
      className={cn(
        "relative w-9 h-9 p-2 rounded-full transition-colors",
        isConnected && "bg-primary/10 hover:bg-primary/20",
        isListening && "animate-pulse"
      )}
    >
      {isConnected ? (
        <Mic className={cn(
          "h-5 w-5",
          isListening ? "text-primary animate-pulse" : "text-primary/80"
        )} />
      ) : (
        <MicOff className="h-5 w-5 text-primary/80" />
      )}
    </Button>
  );
};

export default VoiceAssistant;