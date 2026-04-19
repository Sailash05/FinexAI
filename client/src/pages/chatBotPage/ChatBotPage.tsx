import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { TransactionService } from "../../service/transaction.service";
import ChatInterface from "../../components/chatBotComponent/ChatInterface";

type ChatMessage = {
  question: string;
  answer: string;
};

export default function ChatBotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch last 30 chats on mount
  const fetchMessages = async () => {
    try {
      const res = await TransactionService.getQuery();
      setMessages(res.data.messages || []);
    } catch (err: any) {
      console.error("Failed to fetch messages:", err.message);
      setError("Failed to load chat history.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle sending a new question
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await TransactionService.postQuery({ question: input });
      const newMessage: ChatMessage = { question: input, answer: res.data.answer };
      setMessages((prev) => [...prev, newMessage].slice(-30)); // keep last 30
      setInput("");
    } catch (err: any) {
      console.error("Failed to send query:", err.message);
      setError("Failed to send query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <MessageCircle size={28} className="text-violet-400" />
        Ask Your Finance AI
      </h2>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-black/50 backdrop-blur-lg border border-violet-700 md:p-4 flex flex-col gap-3 hide-scrollbar">
        {messages.length === 0 && !loading && (
          <p className="text-gray-400 text-center">
            No previous questions yet. Ask me anything!
          </p>
        )}

        <AnimatePresence initial={false}>
          <ChatInterface
            key="chat"
            messages={messages}
            chatEndRef={chatEndRef as React.RefObject<HTMLDivElement>}
          />
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="flex-1 rounded-xl px-4 py-2 bg-black/70 text-white border border-violet-700 focus:ring-2 focus:ring-violet-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 cursor-pointer bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition disabled:opacity-50"
          disabled={loading}
        >
          <Send size={20} />
        </button>
      </div>

      {loading && <p className="text-gray-400 text-center mt-1">Processing...</p>}
      {error && <p className="text-red-500 text-center mt-1">{error}</p>}
    </div>
  );
}
