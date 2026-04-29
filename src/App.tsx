/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Send, 
  MoreVertical, 
  ChevronLeft, 
  Camera, 
  Phone, 
  Video, 
  Plus, 
  Smile, 
  Paperclip,
  Trash2,
  CheckCheck,
  Copy,
  Check,
  Cpu,
  Zap,
  Brain,
  Sparkles,
  Globe,
  Instagram,
  Facebook,
  Music,
  Clapperboard,
  Info,
  ArrowLeft
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // Add image support for stickers
  timestamp: Date;
}

const STICKERS = [
  "/assets/stickers/sticker1.png",
  "/assets/stickers/sticker2.png",
  "/assets/stickers/sticker3.png",
  "/assets/stickers/sticker4.png",
  "/assets/stickers/sticker5.png",
  "/assets/stickers/sticker6.png",
];

const STICKER_RESPONSES = [
  "Ngapain lu kirim-kirim ginian? Gak guna tau gak. Lu pikir gue bocil apa suka stikeran?",
  "Sampah banget stiker lu, mending hapus aja deh.",
  "Gue dapet stiker ginian lagi? ngelunjak ya lo",
  "Maksudnya apa kirim stiker? Mau pamer? Gak lucu janc*k.",
  "Dih, stiker apaan dah? Gak jelas banget kayak idup lu.",
  "Dah gue bilang kan jangan yang aneh-aneh, malah kirim stiker busuk.",
];

const MODELS = [
  { id: "openrouter/auto", name: "Auto Mode", icon: <Sparkles size={16} />, desc: "Best appropriate model" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", icon: <Brain size={16} />, desc: "High performance logic" },
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", icon: <Zap size={16} />, desc: "Reliable standard" },
  { id: "nvidia/nemotron-3-nano-omni", name: "Nemotron 3 Nano", icon: <Brain size={16} />, desc: "Advanced reasoning" },
  { id: "laguna/laguna-xs-2", name: "Laguna XS.2", icon: <Zap size={16} />, desc: "Ultra fast model" },
  { id: "laguna/laguna-m-1", name: "Laguna M.1", icon: <Cpu size={16} />, desc: "Medium performance" },
  { id: "ling/ling-2.6-1t", name: "Ling-2.6-1T", icon: <Brain size={16} />, desc: "Gigantic scale" },
  { id: "hy/hy3-preview", name: "Hy3 Preview", icon: <Sparkles size={16} />, desc: "Next-gen tech" },
  { id: "baidu/qianfan-ocr-fast", name: "Qianfan OCR", icon: <Camera size={16} />, desc: "Fast vision/OCR" },
  { id: "google/gemma-4-31b", name: "Gemma 4 31B", icon: <Sparkles size={16} />, desc: "Google state-of-art" },
  { id: "google/gemma-4-26b-a4b", name: "Gemma 4 26B", icon: <Brain size={16} />, desc: "Optimized Gemma" },
];

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] text-gray-400 text-xs border-b border-gray-800">
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "14px",
          backgroundColor: "#1e1e1e",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("kumar_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        return [{
          id: "1",
          role: "assistant",
          content: "Apaan? Gue Kumar. Mau nanya apaan? Jangan yang bego-bego amat ya, males gue jawabnya.",
          timestamp: new Date(),
        }];
      }
    }
    return [{
      id: "1",
      role: "assistant",
      content: "Apaan? Gue Kumar. Mau nanya apaan? Jangan yang bego-bego amat ya, males gue jawabnya.",
      timestamp: new Date(),
    }];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem("kumar_selected_model");
    if (saved) {
      const found = MODELS.find(m => m.id === saved);
      return found || MODELS[0];
    }
    return MODELS[0];
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("kumar_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("kumar_selected_model", selectedModel.id);
  }, [selectedModel]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "info">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const stickerPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
      if (stickerPickerRef.current && !stickerPickerRef.current.contains(event.target as Node)) {
        setShowStickerPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setConnectionStatus(data.status === "connected" ? "connected" : "error");
      } catch {
        setConnectionStatus("error");
      }
    };
    checkConnection();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearChat = () => {
    const initialMessage: Message = {
      id: "1",
      role: "assistant",
      content: "Dah bersih ya. Jangan nanya yang aneh-aneh lagi lu.",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    localStorage.setItem("kumar_chat_history", JSON.stringify([initialMessage]));
    setShowMenu(false);
  };

  const handleCameraClick = () => {
    const cameraErrorMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "AI gratisan ngarep apa jir😂",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cameraErrorMessage]);
  };

  const sendSticker = (url: string) => {
    const userSticker: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "",
      image: url,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userSticker]);
    setShowStickerPicker(false);

    // Kumar reacts to stickers
    setTimeout(() => {
      const randomResponse = STICKER_RESPONSES[Math.floor(Math.random() * STICKER_RESPONSES.length)];
      const kumarResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, kumarResponse]);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.choices[0].message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Aduh kayaknya ada yang error cok",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentView === "info") {
    return (
      <div className="flex flex-col h-screen max-w-lg mx-auto bg-white relative overflow-y-auto">
        {/* Header Info */}
        <header className="sticky top-0 z-10 bg-white px-4 py-4 flex items-center">
          <button 
            onClick={() => setCurrentView("chat")}
            className="text-ios-blue flex items-center gap-1 font-semibold group transition-all"
          >
            <ArrowLeft size={24} />
            <span className="text-lg">Kembali</span>
          </button>
        </header>

        <main className="p-8 space-y-12">
          {/* Section: Informasi */}
          <section className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Informasi</h1>
            <div className="space-y-6 text-gray-800 leading-relaxed text-[16px]">
              <p>
                Platform <strong>Kumar AI</strong> dikembangkan sebagai asisten virtual untuk membantu mempermudah produktivitas dan komunikasi Anda.
              </p>
              <p>
                Asisten ini menggunakan model bahasa (LLM) gratis melalui layanan <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-ios-blue hover:underline font-bold">OpenRouter</a>. Karena merupakan model non-premium, sistem ini mungkin dapat menghasilkan informasi yang kurang akurat atau mengalami kendala teknis dalam pemrosesan data yang kompleks.
              </p>
              <p>
                Untuk stabilitas dan akurasi yang lebih baik, kami menyarankan penggunaan model <strong>"Auto Mode"</strong> atau <strong>"GPT-3.5 Turbo"</strong>.
              </p>
            </div>
          </section>

          {/* Section: Developer */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Developer</h2>
            <div className="space-y-6">
              <p className="text-xl font-bold text-gray-900">Henkaramazov</p>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="https://sketchy-portfolio-three.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-gray-600 hover:text-ios-blue transition-colors"
                >
                  <Globe size={20} />
                  <span className="text-sm font-medium">Website</span>
                </a>
                <a 
                  href="https://www.instagram.com/hen.draprtm?igsh=MTc3anVjYzdndzd6bg==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-gray-600 hover:text-ios-blue transition-colors"
                >
                  <Instagram size={20} />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                <a 
                  href="https://www.facebook.com/share/1D9SyBoHCz/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-gray-600 hover:text-ios-blue transition-colors"
                >
                  <Facebook size={20} />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@yam1suk6hiro?_r=1&_t=ZS-95wjVG0imd3" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-gray-600 hover:text-ios-blue transition-colors"
                >
                  <Clapperboard size={20} />
                  <span className="text-sm font-medium">TikTok</span>
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-auto py-10 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.25em]">
            @ 2026 Henkaramazov - All Rights Deserved.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#f8f8f8] shadow-2xl relative border-x border-gray-200">
      {/* Header */}
      <header className="ios-glass sticky top-0 z-10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-black/5">
                <img 
                  src="/assets/avatars/kumar.png" 
                  alt="Kumar AI" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Kumar+AI&background=000&color=fff";
                  }}
                />
             </div>
             <div>
                <h1 className="font-semibold text-[17px] leading-tight">Kumar AI</h1>
                <p className={`text-[12px] font-medium ${
                  connectionStatus === "connected" ? "text-green-500" : 
                  connectionStatus === "checking" ? "text-amber-500" : "text-red-500"
                }`}>
                  {connectionStatus === "connected" ? "Online" : 
                   connectionStatus === "checking" ? "Menghubungkan..." : "Offline / API Error"}
                </p>
             </div>
          </div>
        <div className="flex items-center gap-5 text-ios-blue relative" ref={menuRef}>
          <Video size={22} className="hidden sm:block cursor-pointer" />
          <Phone size={20} className="hidden sm:block cursor-pointer" />
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <MoreVertical size={22} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setCurrentView("info");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 text-[15px] transition-colors border-b border-gray-50"
                >
                  <Info size={18} />
                  <span>Informasi</span>
                </button>
                <button
                  onClick={clearChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 text-[15px] transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Hapus Chat</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 messages-container space-y-4">
        {/* Date Header */}
        <div className="flex justify-center mb-6">
          <div className="px-4 py-1.5 bg-gray-200/50 backdrop-blur-md rounded-full border border-white/50 shadow-sm flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              {currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[16px] relative shadow-sm ${
                  message.role === "user"
                    ? "bg-ios-bubble-user text-white rounded-tr-none"
                    : "bg-ios-bubble-ai text-black rounded-tl-none border border-gray-100"
                }`}
              >
                {message.image && (
                  <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-105">
                    <img 
                      src={message.image} 
                      alt="Sticker" 
                      className="w-full h-auto object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {message.role === "assistant" ? (
                  <div className="markdown-body">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, "")}
                            />
                          ) : (
                            <code className={`${className} bg-black/10 px-1 rounded`} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content && <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
                <div className={`flex items-center justify-end gap-1 mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
                  <span className="text-[10px]">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === "user" && <CheckCheck size={12} />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-ios-bubble-ai px-4 py-2 rounded-2xl rounded-tl-none animate-pulse text-gray-400 flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-gray-50/90 backdrop-blur-md border-t border-gray-200 relative">
        <div className="flex items-center gap-3">
          <div className="relative" ref={modelMenuRef}>
            <button 
              onClick={() => setShowModelMenu(!showModelMenu)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white border border-gray-200 shadow-sm ${
                showModelMenu ? "text-ios-blue scale-110" : "text-gray-500"
              }`}
            >
              <Plus size={24} className={`transition-transform duration-300 ${showModelMenu ? "rotate-45" : ""}`} />
            </button>

            <AnimatePresence>
              {showModelMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: -10 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-2"
                >
                  <p className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pilih Model AI</p>
                  <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                          selectedModel.id === model.id ? "bg-ios-blue text-white" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${selectedModel.id === model.id ? "bg-white/20" : "bg-gray-100 group-hover:bg-white"}`}>
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{model.name}</p>
                          <p className={`text-[10px] truncate ${selectedModel.id === model.id ? "text-blue-100" : "text-gray-400"}`}>
                            {model.desc}
                          </p>
                        </div>
                        {selectedModel.id === model.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center gap-2 focus-within:ring-1 focus-within:ring-ios-blue transition-all relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[15px] resize-none max-h-32 py-1 scrollbar-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="relative" ref={stickerPickerRef}>
              <button 
                onClick={() => setShowStickerPicker(!showStickerPicker)}
                className={`transition-colors ${showStickerPicker ? "text-ios-blue" : "text-gray-400 hover:text-ios-blue"}`}
              >
                <Smile size={22} />
              </button>

              <AnimatePresence>
                {showStickerPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50"
                  >
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                      {STICKERS.map((sticker, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendSticker(sticker)}
                          className="aspect-square rounded-lg overflow-hidden hover:bg-gray-100 p-1 transition-all hover:scale-110 active:scale-95"
                        >
                          <img 
                            src={sticker} 
                            alt={`Sticker ${idx}`} 
                            className="w-full h-full object-cover rounded-md"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={input.trim() ? handleSend : handleCameraClick}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              input.trim() ? "bg-ios-blue text-white shadow-lg" : "text-gray-400 hover:text-ios-blue"
            }`}
          >
            {input.trim() ? <Send size={18} fill="currentColor" /> : <Camera size={24} />}
          </motion.button>
        </div>
        
        {/* iOS Home Indicator mock */}
        <div className="w-32 h-1.5 bg-black/10 rounded-full mx-auto mt-6"></div>
      </footer>
    </div>
  );
}

