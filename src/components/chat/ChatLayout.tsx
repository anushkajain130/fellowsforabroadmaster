// src/components/chat/ChatLayout.tsx - Fixed height management
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Sidebar } from "./Sidebar";
import { ChannelView } from "./ChannelView";

export function ChatLayout() {
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentUser = useQuery(api.chat.getCurrentUser);
  const workspaces = useQuery(api.chat.listWorkspaces);
  const ensureChannel = useMutation(api.chat.ensureGeneralChannel);

  // Auto-select the general channel when component mounts
  useEffect(() => {
    if (!currentChannelId && currentUser && !isLoading) {
      setIsLoading(true);
      ensureChannel()
        .then((channelId) => {
          console.log("Auto-selected general channel:", channelId);
          setCurrentChannelId(channelId as string);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to ensure general channel:", error);
          setIsLoading(false);
        });
    }
  }, [ensureChannel, currentChannelId, currentUser, isLoading]);

  useEffect(() => {
    if (currentUser && workspaces !== undefined) {
      setIsLoading(false);
    }
  }, [currentUser, workspaces]);

  const handleChannelSelect = (channelId: string) => {
    console.log("Channel selected:", channelId);
    setCurrentChannelId(channelId);
  };

  // Show loading state
  if (isLoading || !currentUser) {
    return (
      <div className="flex h-full bg-white">
        <div className="w-64 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-sm">Loading sidebar...</div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Setting up your workspace...
            </h2>
            <p className="text-gray-500">
              Please wait while we prepare your chat experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white"> {/* Full height flex container */}
      {/* Sidebar - Fixed width, full height */}
      <div className="w-64 flex-shrink-0"> {/* Prevent sidebar from shrinking */}
        <Sidebar
          currentChannelId={currentChannelId}
          onChannelSelect={handleChannelSelect}
          currentUserId={currentUser._id}
        />
      </div>
      
      {/* Main Chat Area - Takes remaining width, full height */}
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 allows flex item to shrink below content size */}
        {currentChannelId ? (
          <>
            {/* Optional Debug Info - Remove in production */}
            <div className="p-2 bg-blue-100 text-xs border-b flex-shrink-0">
              <span className="font-mono">
                DEBUG: Channel {currentChannelId} | User: {currentUser.email || currentUser.name}
              </span>
            </div>
            
            {/* Channel View - Takes all remaining space */}
            <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for proper scrolling */}
              <ChannelView channelId={currentChannelId as Id<"channels">} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Welcome to your workspace
              </h2>
              <p className="text-gray-500 mb-4">
                Select a channel from the sidebar to start chatting
              </p>
              <div className="text-sm text-gray-400">
                Or wait for the general channel to load automatically...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
