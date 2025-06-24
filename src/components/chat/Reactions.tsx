// src/components/chat/Reactions.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";

interface ReactionsProps {
  messageId: Id<"messages">;
  onReact: (emoji: string) => void;
  currentUserId?: string;
}

export function Reactions({ messageId, onReact, currentUserId }: ReactionsProps) {
  const reactions = useQuery(api.chat.getMessageReactions, { messageId }) || [];
  const [showPicker, setShowPicker] = useState(false);

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🚀', '👀'];

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.userId);
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasCurrentUser = true;
    }
    return acc;
  }, {} as Record<string, { count: number; users: string[]; hasCurrentUser: boolean }>);

  return (
    <div className="flex items-center flex-wrap gap-1 mt-1">
      {/* Existing Reactions */}
      {Object.entries(groupedReactions).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
            data.hasCurrentUser
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
          title={`${data.count} reaction${data.count !== 1 ? 's' : ''}`}
        >
          <span>{emoji}</span>
          <span className="font-medium">{data.count}</span>
        </button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-6 h-6 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center text-sm"
          title="Add reaction"
        >
          😀
        </button>

        {showPicker && (
          <>
            <div className="absolute bottom-8 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-1 z-10">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowPicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowPicker(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
