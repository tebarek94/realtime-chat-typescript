import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onStartTyping: () => void;
  onStopTyping: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Handle typing indicators
    if (value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        onStartTyping();
      }
      
      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onStopTyping();
      }, 3000);
    } else {
      // If input is empty, stop typing immediately
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Stop typing
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="textarea w-full"
          rows={1}
          maxLength={1000}
        />
      </div>
      
      <Button
        onClick={handleSendMessage}
        disabled={!message.trim()}
        className="px-4 py-3"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </Button>
    </div>
  );
};

export default MessageInput;
