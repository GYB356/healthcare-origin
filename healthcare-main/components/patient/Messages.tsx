import { useState, useEffect, useRef, useCallback } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import io, { Socket } from "socket.io-client";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderRole: "patient" | "doctor";
  read: boolean;
}

interface Conversation {
  id: string;
  doctorName: string;
  specialty: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function Messages() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const shouldAutoScroll = useRef(true);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session?.user?.id) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    // Authenticate user
    socketRef.current.emit("authenticate", session.user.id);

    // Handle new messages
    socketRef.current.on("newMessage", (message: Message) => {
      if (message.conversationId === selectedConversation) {
        setMessages((prev) => [...prev, message]);
        if (shouldAutoScroll.current) {
          scrollToBottom();
        }
      }

      // Update conversations list with new message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
                unreadCount: conv.unreadCount + 1,
              }
            : conv,
        ),
      );

      // Show notification for new message
      if (message.conversationId !== selectedConversation) {
        toast.success(`New message from ${message.senderName}`);
      }
    });

    // Handle message read status
    socketRef.current.on("messageRead", (messageId: string) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)),
      );
    });

    // Handle unread count updates
    socketRef.current.on("unreadCount", (count: number) => {
      // Update the unread count in the UI if needed
      console.log("Unread count updated:", count);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session?.user?.id, selectedConversation]);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && shouldAutoScroll.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/patient/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError("Failed to load conversations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/patient/messages?conversationId=${conversationId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data);
      setSelectedConversation(conversationId);

      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const response = await fetch("/api/patient/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (!response.ok) throw new Error("Failed to mark messages as read");

      // Emit read status through WebSocket
      if (socketRef.current && session?.user?.id) {
        socketRef.current.emit("markAsRead", {
          conversationId,
          userId: session.user.id,
        });
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Send new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || !session?.user) return;

    try {
      // Emit message through WebSocket
      if (socketRef.current) {
        socketRef.current.emit("sendMessage", {
          conversationId: selectedConversation,
          content: newMessage.trim(),
          senderId: session.user.id,
          senderName: session.user.name,
          senderRole: "patient",
        });
      }

      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => fetchMessages(conv.id)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              selectedConversation === conv.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{conv.doctorName}</h3>
                <p className="text-sm text-gray-500">{conv.specialty}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
            <p className="text-xs text-gray-400">
              {new Date(conv.lastMessageTime).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === session?.user?.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
