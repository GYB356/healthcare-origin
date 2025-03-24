import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

export const useSocket = () => {
  const { data: session } = useSession();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize socket connection
    const initSocket = async () => {
      await fetch("/api/socketio");
      socketRef.current = io(SOCKET_URL, {
        path: "/api/socketio",
        auth: {
          token: session.token,
        },
      });

      // Handle connection events
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session]);

  // Helper functions for emitting events
  const emitAppointmentUpdate = (data) => {
    if (socketRef.current) {
      socketRef.current.emit("appointment:update", data);
    }
  };

  const emitTaskUpdate = (data) => {
    if (socketRef.current) {
      socketRef.current.emit("task:update", data);
    }
  };

  const emitNotification = (data) => {
    if (socketRef.current) {
      socketRef.current.emit("notification:create", data);
    }
  };

  // Helper functions for listening to events
  const onAppointmentUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("appointment:updated", callback);
    }
  };

  const onTaskUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("task:updated", callback);
    }
  };

  const onNewNotification = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("notification:new", callback);
    }
  };

  return {
    socket: socketRef.current,
    emitAppointmentUpdate,
    emitTaskUpdate,
    emitNotification,
    onAppointmentUpdate,
    onTaskUpdate,
    onNewNotification,
  };
}; 