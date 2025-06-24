// src/components/chat/ChannelView.tsx
"use client";

import { useState } from "react";
import { useChannel } from "@/hooks/useChannel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Reactions } from "./Reactions";

export function ChannelView({ channelId }: { channelId: Id<"channels"> }) {
  const { messages, userProfiles, send, edit, deleteMsg, react, unreact } = useChannel(channelId);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Id<"messages"> | null>(null);
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // GET THE REAL CURRENT USER FROM CONVEX AUTH
  const currentUser = useQuery(api.chat.getCurrentUser);
  const currentUserId = currentUser?._id;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Helper function to get author name from message
  const getAuthorName = (authorId: string) => {
    if (authorId === currentUserId) {
      return "You";
    }
    return userProfiles?.[authorId]?.name || `User ${authorId.slice(-4)}`;
  };

  // Helper function to check if user can edit/delete message
  const canModifyMessage = (authorId: string) => {
    return authorId === currentUserId;
  };

  // Get top-level messages (not replies)
  const topLevelMessages = messages?.filter(m => !m.parentId) || [];

  // Message component for reusability
  const MessageComponent = ({ 
    message, 
    isReply = false, 
    showActions = true 
  }: { 
    message: any; 
    isReply?: boolean; 
    showActions?: boolean; 
  }) => {
    const isEditing = editingMessage === message._id;
    const canModify = canModifyMessage(message.authorId);
    const isMyMessage = message.authorId === currentUserId;
    const authorName = getAuthorName(message.authorId);

    return (
      <div className="group flex items-start space-x-3">
        {/* Avatar */}
        <div className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} ${isMyMessage ? 'bg-blue-500' : 'bg-gray-500'} rounded-full flex items-center justify-center text-white ${isReply ? 'text-xs' : 'text-sm'} font-medium`}>
          {message.authorId.slice(-2).toUpperCase()}
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2">
            <span className={`${isReply ? 'text-sm' : ''} font-medium ${isMyMessage ? 'text-blue-900' : 'text-gray-900'}`}> 
              {authorName}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.createdAt)}
            </span>
            {message.editedAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {/* Message text or edit input */}
          {isEditing ? (
            <div className="mt-1">
              <input
                className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (editText.trim()) {
                      edit(message._id, editText.trim());
                      setEditingMessage(null);
                      setEditText("");
                    }
                  } else if (e.key === 'Escape') {
                    setEditingMessage(null);
                    setEditText("");
                  }
                }}
                autoFocus
              />
              <div className="flex space-x-2 mt-1">
                <button
                  onClick={() => {
                    if (editText.trim()) {
                      edit(message._id, editText.trim());
                      setEditingMessage(null);
                      setEditText("");
                    }
                  }}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setEditText("");
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`${isReply ? 'text-sm' : ''} text-gray-700 mt-1`}> 
              {message.text}
            </p>
          )}

          {/* REACTIONS COMPONENT */}
          <Reactions
            messageId={message._id}
            onReact={(emoji) => react(message._id, emoji)}
            currentUserId={currentUserId}
          />

          {/* Message Actions */}
          {showActions && !isEditing && (
            <div className="flex items-center space-x-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setReplyTo(message._id)}
                className="text-xs text-blue-600 hover:underline"
              >
                💬 Reply
              </button>
              
              {canModify && (
                <>
                  <button
                    onClick={() => {
                      setEditingMessage(message._id);
                      setEditText(message.text);
                    }}
                    className="text-xs text-green-600 hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this message?")) {
                        deleteMsg(message._id);
                      }
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!channelId) {
    return (
      <p className="p-6 text-gray-500">
        No channel selected or channel does not exist.
      </p>
    );
  }

  // Update the return statement in your ChannelView.tsx
return (
  <div className="flex flex-col h-full"> {/* Full height container */}
    {/* Header - Fixed at top */}
    <div className="border-b border-gray-200 p-4 flex-shrink-0 bg-white">
      <h2 className="text-lg font-semibold">Channel Messages</h2>
      <div className="text-xs text-gray-500 mt-1 space-y-1">
        <p>Signed in as: {currentUser?.name || currentUser?.email || 'Loading...'}</p>
        <p>Total messages: {messages?.length || 0}</p>
      </div>
    </div>

    {/* Messages Area - Scrollable */}
    <div className="flex-1 overflow-y-auto bg-white"> {/* This will scroll */}
      <div className="p-4 space-y-4"> {/* Padding inside scrollable area */}
        {messages?.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No messages in this channel yet. Send the first message!
          </div>
        )}
        
        {topLevelMessages.map((message) => {
          if (message.deleted) {
            return (
              <div key={message._id} className="text-gray-400 text-sm italic border-b border-gray-100 pb-4">
                🗑️ This message was deleted
              </div>
            );
          }

          const replies = messages?.filter(m => m.parentId === message._id) || [];
          const replyCount = replies.length;
          const isThreadOpen = openThreads.has(message._id);

          return (
            <div key={message._id} className="border-b border-gray-100 pb-4">
              {/* Your existing message component JSX */}
              <MessageComponent message={message} />
              
              {/* Thread Controls and Replies - same as before */}
              {replyCount > 0 && (
                <div className="ml-11 mt-2">
                  <button
                    onClick={() => {
                      const newOpenThreads = new Set(openThreads);
                      if (newOpenThreads.has(message._id)) {
                        newOpenThreads.delete(message._id);
                      } else {
                        newOpenThreads.add(message._id);
                      }
                      setOpenThreads(newOpenThreads);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {isThreadOpen ? '📁' : '📂'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </button>
                </div>
              )}

              {/* Rest of your existing thread and reply JSX */}
              {/* ... */}
            </div>
          );
        })}
      </div>
    </div>

    {/* Input Area - Fixed at bottom */}
    {!replyTo && (
      <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) {
              send(text);
              setText("");
            }
          }}
          className="flex gap-2"
        >
          <input
            className="flex-grow border rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message…"
          />
          <button 
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    )}
  </div>
);
}