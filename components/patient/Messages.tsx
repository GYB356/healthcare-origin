import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewConversation from "../NewConversation";
import LoadingSpinner from "../LoadingSpinner";
import { InlineNotification } from "../Notification";
import { formatDate, timeAgo } from "../../lib/formatDate";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  read: boolean;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    image: string;
  };
}

interface Conversation {
  id: string;
  doctor: {
    id: string;
    name: string;
    image: string;
  };
  messages: Message[];
}

export default function Messages() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXTAUTH_URL || "http://localhost:3000");

    // Listen for new messages
    socketRef.current.on("new_message", (message: Message) => {
      setConversations((prev) => {
        const updated = [...prev];
        const conversation = updated.find((c) => c.id === message.conversationId);
        if (conversation) {
          conversation.messages.push(message);
        }
        return updated;
      });

      // Show notification for new message
      if (message.sender.id !== session.user.id) {
        toast.info(`New message from ${message.sender.name}`);
      }
    });

    // Listen for message read status updates
    socketRef.current.on("message_read", (messageId: string) => {
      setConversations((prev) => {
        const updated = [...prev];
        updated.forEach((conversation) => {
          conversation.messages.forEach((message) => {
            if (message.id === messageId) {
              message.read = true;
            }
          });
        });
        return updated;
      });
    });

    // Listen for unread count updates
    socketRef.current.on("unread_count_update", (count: number) => {
      setUnreadCount(count);
    });

    // Fetch initial conversations
    fetchConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session?.user?.id]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setLoadingError(null);

    try {
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);

      // Calculate total unread messages
      const totalUnread = data.reduce((acc: number, conv: Conversation) => {
        return (
          acc + conv.messages.filter((m) => !m.read && m.sender.id !== session?.user?.id).length
        );
      }, 0);
      setUnreadCount(totalUnread);

      // Select first conversation if none selected and there are conversations
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoadingError("Failed to load conversations. Please try again later.");
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const conversation = conversations.find((c) => c.id === selectedConversation);
      if (!conversation) return;

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          conversationId: selectedConversation,
          receiverId: conversation.doctor.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds: [messageId] }),
      });

      if (!response.ok) throw new Error("Failed to mark message as read");
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleConversationCreated = () => {
    fetchConversations();
  };

  useEffect(() => {
    if (selectedConversation) {
      // Mark unread messages as read when conversation is selected
      const conversation = conversations.find((c) => c.id === selectedConversation);
      if (conversation) {
        conversation.messages.forEach((message) => {
          if (!message.read && message.sender.id !== session?.user?.id) {
            markAsRead(message.id);
          }
        });
      }

      scrollToBottom();
    }
  }, [selectedConversation, conversations]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <InlineNotification message={loadingError} type="error" />
          <button
            onClick={fetchConversations}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ToastContainer position="top-right" />
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        <div className="p-4">
          <NewConversation onConversationCreated={handleConversationCreated} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet. Start a new one!
            </div>
          ) : (
            conversations.map((conversation) => {
              const unreadMessagesCount = conversation.messages.filter(
                (m) => !m.read && m.sender.id !== session?.user?.id,
              ).length;

              const lastMessage = conversation.messages[conversation.messages.length - 1];

              return (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center">
                    <img
                      src={conversation.doctor.image || "/default-avatar.png"}
                      alt={conversation.doctor.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{conversation.doctor.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {timeAgo(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate max-w-[180px]">
                          {lastMessage?.content || "No messages"}
                        </p>
                        {unreadMessagesCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                {conversations.find((c) => c.id === selectedConversation)?.doctor.name}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {conversations.find((c) => c.id === selectedConversation)?.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                conversations
                  .find((c) => c.id === selectedConversation)
                  ?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.sender.id === session?.user?.id ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.sender.id === session?.user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100"
                        }`}
                        onMouseEnter={() => {
                          if (!message.read && message.sender.id !== session?.user?.id) {
                            markAsRead(message.id);
                          }
                        }}
                      >
                        <p className="break-words">{message.content}</p>
                        <div className="flex items-center justify-end mt-1 text-xs opacity-75 space-x-1">
                          <span>{formatDate(message.createdAt)}</span>
                          {message.sender.id === session?.user?.id && (
                            <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Send
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
