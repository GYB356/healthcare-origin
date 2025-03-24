import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { showNotification } from "../components/Notification";

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export default function useSocket(
  url: string = process.env.NEXTAUTH_URL || "http://localhost:3000",
  options: UseSocketOptions = {},
) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  useEffect(() => {
    if (!session?.user?.id || !autoConnect) return;

    if (!socketRef.current) {
      socketRef.current = io(url, {
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        auth: {
          userId: session.user.id,
        },
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        setError(null);
        onConnect?.();
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
        onDisconnect?.();
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(err);
        onError?.(err);
        showNotification({
          message: "Connection error. Trying to reconnect...",
          type: "error",
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    session?.user?.id,
    url,
    autoConnect,
    reconnection,
    reconnectionAttempts,
    reconnectionDelay,
    onConnect,
    onDisconnect,
    onError,
  ]);

  const connect = () => {
    if (!socketRef.current && session?.user?.id) {
      socketRef.current = io(url, {
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        auth: {
          userId: session.user.id,
        },
      });
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const emit = <T>(event: string, data?: T) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected, unable to emit event:", event);
    }
  };

  const on = <T>(event: string, callback: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
