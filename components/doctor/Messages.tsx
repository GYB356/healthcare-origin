import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewConversation from "../NewConversation";

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
  patient: {
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
    try {
      const response = await fetch("/api/conversations/doctor");
      const data = await response.json();
      setConversations(data);

      // Calculate total unread messages
      const totalUnread = data.reduce((acc: number, conv: Conversation) => {
        return (
          acc + conv.messages.filter((m) => !m.read && m.sender.id !== session?.user?.id).length
        );
      }, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
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
          receiverId: conversation.patient.id,
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
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error("Failed to mark message as read");
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to mark message as read");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleConversationCreated = () => {
    fetchConversations();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ToastContainer position="top-right" />
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="p-4">
          <NewConversation onConversationCreated={handleConversationCreated} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center">
                <img
                  src={conversation.patient.image || "/default-avatar.png"}
                  alt={conversation.patient.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">{conversation.patient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {conversation.messages[conversation.messages.length - 1]?.content ||
                      "No messages"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                {conversations.find((c) => c.id === selectedConversation)?.patient.name}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {conversations
                .find((c) => c.id === selectedConversation)
                ?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender.id === session?.user?.id ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
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
                      <p>{message.content}</p>
                      <span className="text-xs opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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
