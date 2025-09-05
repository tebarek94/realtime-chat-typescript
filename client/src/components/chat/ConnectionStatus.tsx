import React, { useState, useEffect } from 'react';
import { socketService } from '../../services/socket';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('disconnected');

  useEffect(() => {
    const updateStatus = () => {
      setStatus(socketService.getConnectionStatus());
    };

    // Initial status
    updateStatus();

    // Listen for connection events
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('connect', updateStatus);
      socket.on('disconnect', updateStatus);
      (socket as any).on('reconnect', updateStatus);
      (socket as any).on('reconnect_error', updateStatus);
      (socket as any).on('reconnect_failed', updateStatus);

      return () => {
        socket.off('connect', updateStatus);
        socket.off('disconnect', updateStatus);
        (socket as any).off('reconnect', updateStatus);
        (socket as any).off('reconnect_error', updateStatus);
        (socket as any).off('reconnect_failed', updateStatus);
      };
    }
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  if (status === 'connected') {
    return null; // Don't show when connected
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 border-b border-gray-200 ${className}`}>
      <div className={`w-2 h-2 ${getStatusColor()} rounded-full animate-pulse`} />
      <span className="text-xs text-gray-600">{getStatusText()}</span>
    </div>
  );
};

export default ConnectionStatus;
