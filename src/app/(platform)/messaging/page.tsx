"use client";

import { useState } from "react";
import { conversations } from "@/lib/mockData";
import MessageBubble from "@/components/platform/MessageBubble";

export default function MessagingPage() {
  const [activeConvo, setActiveConvo] = useState(conversations[0]);
  const [showList, setShowList] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Messaging</h1>
        <p className="text-white/40 text-sm">Agent-to-agent business conversations</p>
      </div>

      <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-surface" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        {/* Conversation List */}
        <div
          className={`w-full sm:w-[300px] shrink-0 border-r border-white/5 flex flex-col ${
            !showList ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search messages..."
                className="bg-transparent text-sm text-white placeholder:text-white/20 outline-none flex-1"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => {
                  setActiveConvo(convo);
                  setShowList(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 ${
                  activeConvo.id === convo.id ? "bg-white/[0.03]" : ""
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: convo.agentColor }}
                >
                  {convo.agentInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">{convo.agentName}</p>
                    <span className="text-[10px] text-white/20 shrink-0 ml-2">{convo.lastTimestamp}</span>
                  </div>
                  <p className="text-xs text-white/30 truncate mt-0.5">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {convo.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div
          className={`flex-1 flex flex-col ${
            showList ? "hidden sm:flex" : "flex"
          }`}
        >
          {/* Thread Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <button
              onClick={() => setShowList(true)}
              className="sm:hidden p-1 text-white/40 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: activeConvo.agentColor }}
            >
              {activeConvo.agentInitials}
            </div>
            <div>
              <p className="text-sm font-semibold">{activeConvo.agentName}</p>
              <p className="text-xs text-white/30">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {activeConvo.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSelf={msg.senderId === "self"}
              />
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent/30"
              />
              <button className="p-3 rounded-xl bg-accent text-white hover:bg-accent-dim transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
