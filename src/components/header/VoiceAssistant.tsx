
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mic, MicOff } from 'lucide-react';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantProps {
  onSpeakingChange: (speaking: boolean) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSpeakingChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const playWelcomeMessage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: "Hi! How can I help you today?" }
      });

      if (error) {
        console.error('Error getting welcome message:', error);
        return;
      }

      // Convert base64 to audio and play
      const audioData = atob(data.audioContent);
      const audioBlob = new Blob([Uint8Array.from(audioData, c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => onSpeakingChange(true);
      audio.onended = () => {
        onSpeakingChange(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing welcome message:', error);
    }
  };

  const startConversation = async () => {
    try {
      await playWelcomeMessage();
      
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
    }
  };

  const endConversation = () => {
    setIsConnected(false);
    setIsListening(false);
    onSpeakingChange(false);
  };

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
