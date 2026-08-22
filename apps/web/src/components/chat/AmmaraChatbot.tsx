"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Calendar,
  Utensils,
  Receipt,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "ammara" | "user";
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url: string }[];
  isSpecialistHandoff?: boolean;
}

export function AmmaraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ammara",
      text: "Namaste, I’m Ammara—your Annapoorna wellness companion. I can help you explore classes, find recipes, manage bookings and connect with an expert. How can I help today?",
      timestamp: "Just now",
      actionLinks: [
        { label: "🗓️ Live Cooking Classes", url: "/classes" },
        { label: "🥗 Anti-Inflammatory Recipes", url: "/recipes" },
        { label: "📅 Book 1-on-1 Consultation", url: "/dashboard/appointments" },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "🗓️ Live Cooking Classes",
    "🥗 Low-GI Recipes",
    "📅 Book 1-on-1 Consultation",
    "🧾 Download Tax Invoices",
    "👩‍⚕️ Speak to a Human Expert",
  ];

  const generateAmmaraReply = (userText: string): ChatMessage => {
    const q = userText.toLowerCase();

    // 1. Medical Diagnosis / Medication Disclaimer
    if (
      q.includes("diagnose") ||
      q.includes("prescribe") ||
      q.includes("medicine") ||
      q.includes("drug") ||
      q.includes("insulin dose") ||
      q.includes("metformin dose")
    ) {
      return {
        id: "msg-" + Date.now(),
        sender: "ammara",
        text: "Important Medical Note: I am your wellness education companion and do not provide medical diagnoses or prescribe medications. For clinical prescriptions or medication adjustments, please consult directly with our Board-Certified physician, Dr. Maya Rao, MD, during a 1-on-1 clinical session.",
        timestamp: "Just now",
        actionLinks: [
          { label: "📅 Book Dr. Maya Rao Consultation", url: "/dashboard/appointments" },
          { label: "👩‍⚕️ Request Clinical Handoff", url: "/dashboard/membership" },
        ],
      };
    }

    // 2. Classes & Workshops
    if (q.includes("class") || q.includes("workshop") || q.includes("calendar") || q.includes("live")) {
      return {
        id: "msg-" + Date.now(),
        sender: "ammara",
        text: "We offer weekly live interactive masterclasses across all 6 Lifestyle Pillars! Popular upcoming sessions include Chef Anita's 'Zero-Oil Sautéing & Emulsions' and Dr. Maya's 'Cellular Insulin Resistance' workshop with real-time Zoom/Google Meet links.",
        timestamp: "Just now",
        actionLinks: [
          { label: "🗓️ Explore Live Calendar", url: "/classes" },
          { label: "🎓 View Video Course Labs", url: "/dashboard/courses" },
        ],
      };
    }

    // 3. Recipes & Cooking
    if (q.includes("recipe") || q.includes("food") || q.includes("cook") || q.includes("oil") || q.includes("meal")) {
      return {
        id: "msg-" + Date.now(),
        sender: "ammara",
        text: "All Annapoorna recipes are 100% whole-food, zero-oil, and rich in prebiotic dietary fiber to prevent post-meal glucose spikes. Top member favorites include our Adobo Mushroom Bowl, Spiced Mung Dal, and Cherry Balsamic Satiety Bowl.",
        timestamp: "Just now",
        actionLinks: [
          { label: "🥗 Browse Recipe Archive", url: "/recipes" },
          { label: "📘 Download Starter Pantry Guide", url: "/lead-guide" },
        ],
      };
    }

    // 4. Invoices, Payments & Billing
    if (q.includes("invoice") || q.includes("receipt") || q.includes("bill") || q.includes("payment") || q.includes("tax") || q.includes("order")) {
      return {
        id: "msg-" + Date.now(),
        sender: "ammara",
        text: "You can view itemized tax receipts and download official PDF/Text invoices (including 9% GST/sales tax breakdown and transaction IDs) inside your Member Purchases tab.",
        timestamp: "Just now",
        actionLinks: [
          { label: "🧾 View Invoices & Receipts", url: "/dashboard/purchases" },
          { label: "💎 Manage VIP Membership", url: "/dashboard/membership" },
        ],
      };
    }

    // 5. Booking 1-on-1 Consultation
    if (q.includes("book") || q.includes("appointment") || q.includes("consult") || q.includes("slot") || q.includes("maya")) {
      return {
        id: "msg-" + Date.now(),
        sender: "ammara",
        text: "You can book 1-on-1 discovery and clinical strategy sessions with Dr. Maya Rao, MD, Chef Anita Desai, or Coach Jim Jones. Check our real-time capacity calendar for available green slots!",
        timestamp: "Just now",
        actionLinks: [
          { label: "📅 Open Consultation Calendar", url: "/dashboard/appointments" },
        ],
      };
    }

    // 6. Specialist / Human Handoff
    if (q.includes("human") || q.includes("expert") || q.includes("doctor") || q.includes("support") || q.includes("specialist")) {
      return {
        id: "msg-" + Date.now(),
        sender: "ammara",
        text: "I’d be delighted to connect you with a human specialist! Our clinical mentors (Dr. Maya Rao, Anita Desai, and Jim Jones) are available for direct messaging via VIP Concierge or 1-on-1 video office hours.",
        timestamp: "Just now",
        actionLinks: [
          { label: "💬 Message VIP Concierge", url: "/dashboard/membership" },
          { label: "👥 Join Community Forum", url: "/dashboard/community" },
        ],
        isSpecialistHandoff: true,
      };
    }

    // Default Fallback
    return {
      id: "msg-" + Date.now(),
      sender: "ammara",
      text: "I’m here to support your metabolic lifestyle journey! Whether you'd like to browse zero-oil recipes, reserve a seat in an upcoming masterclass, or download your tax invoices, I can guide you directly.",
      timestamp: "Just now",
      actionLinks: [
        { label: "🗓️ Live Calendar", url: "/classes" },
        { label: "🥗 Whole Food Recipes", url: "/recipes" },
        { label: "🧑‍💻 Member Workspace", url: "/dashboard" },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: messageText,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAmmaraReply(messageText);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-full bg-[#C35B32] hover:bg-[#a74b2c] text-white font-semibold text-xs shadow-xl transition-all flex items-center gap-2.5 group cursor-pointer animate-fade-in"
          aria-label="Open Ammara Wellness Companion Chat"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#C35B32]"></span>
          </div>
          <div className="text-left">
            <span className="font-bold block text-sm leading-tight">Ask Ammara</span>
            <span className="text-[10px] text-sand-200 font-light block">Wellness Companion</span>
          </div>
        </button>
      )}

      {/* Floating Chatbot Modal Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[600px] bg-white rounded-3xl border border-[#e5ddd3] shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans text-sage-900">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#163B8A] to-[#C35B32] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
                अ
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-base leading-tight">Ammara</h3>
                  <span className="text-[10px] bg-emerald-400/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-sand-200 font-light">Your Annapoorna wellness companion</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/60 text-[10px] text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Ammara provides approved lifestyle guidance and does not diagnose disease or prescribe medication.</span>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#faf8f5] text-xs">
            {messages.map((msg) => {
              const isAmmara = msg.sender === "ammara";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAmmara ? "items-start" : "items-end justify-end"}`}
                >
                  {isAmmara && (
                    <div className="w-7 h-7 rounded-full bg-[#C35B32] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 shadow-xs">
                      A
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl space-y-2.5 shadow-xs ${
                      isAmmara
                        ? "bg-white border border-[#e5ddd3] text-sage-900 rounded-tl-xs"
                        : "bg-[#C35B32] text-white rounded-tr-xs font-medium"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                    {/* Actionable Click Links */}
                    {msg.actionLinks && msg.actionLinks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.actionLinks.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.url}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sand-100 hover:bg-sand-200 text-[#C35B32] font-bold text-[10px] border border-sand-200 transition-all shadow-2xs"
                          >
                            <span>{link.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}

                    <span className={`text-[9px] block text-right ${isAmmara ? "text-sage-400" : "text-sand-200"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-sage-500 text-[11px] pl-2">
                <span className="w-2 h-2 rounded-full bg-[#C35B32] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#C35B32] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#C35B32] animate-bounce [animation-delay:0.4s]"></span>
                <span>Ammara is preparing your guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#e5ddd3] overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-[#faf8f5] hover:bg-sand-200 text-sage-800 text-[10px] font-semibold border border-sand-200 transition-all cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#e5ddd3] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about recipes, classes, bookings..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs p-2.5 rounded-2xl bg-[#faf8f5] border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-2xl bg-[#C35B32] hover:bg-[#a74b2c] text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
