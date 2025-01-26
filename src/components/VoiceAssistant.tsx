import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playWelcomeMessage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech');
      
      if (error) throw error;
      
      const audioContent = data.audioContent;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(audioBlob);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing welcome message:', error);
      toast({
        title: "Error",
        description: "Failed to play welcome message",
        variant: "destructive",
      });
    }
  };

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
      await playWelcomeMessage();
      
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
    audioRef.current = new Audio();
    
    return () => {
      chatRef.current?.disconnect();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
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
    </>
  );
};

export default VoiceAssistant;