// src/components/chat/Sidebar.tsx - Fixed all null safety issues
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";

interface SidebarProps {
  currentChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  currentUserId?: string;
}

export function Sidebar({ currentChannelId, onChannelSelect, currentUserId }: SidebarProps) {
  const workspaces = useQuery(api.chat.listWorkspaces) || [];
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  
  // Auto-select first workspace when available
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace && workspaces[0]) {
      setSelectedWorkspace(workspaces[0]._id);
      console.log("Auto-selected workspace:", workspaces[0]._id, workspaces[0].name);
    }
  }, [workspaces, selectedWorkspace]);

  const channels = useQuery(
    api.chat.listChannels,
    selectedWorkspace ? { workspaceId: selectedWorkspace as Id<"workspaces"> } : "skip"
  );
  
  const createWorkspace = useMutation(api.chat.createWorkspace);
  const createChannel = useMutation(api.chat.createChannel);

  // Get regular channels and DMs
  const regularChannels = channels?.filter(c => !c.isPrivate && !c.isDM) || [];
  const dmChannels = channels?.filter(c => c.isDM) || [];

  // Safe workspace name retrieval
  const currentWorkspaceName = selectedWorkspace 
    ? workspaces.find(w => w?._id === selectedWorkspace)?.name ?? "Unknown Workspace"
    : "Loading...";

  console.log("Sidebar render:", {
    workspaceCount: workspaces.length,
    selectedWorkspace,
    channelCount: channels?.length || 0,
    regularChannels: regularChannels.length,
    dmChannels: dmChannels.length,
    currentChannelId
  });

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg truncate">
            {currentWorkspaceName}
          </h2>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        
        {/* Workspace Selector */}
        {workspaces.length > 1 && (
          <select
            value={selectedWorkspace || ""}
            onChange={(e) => {
              console.log("Workspace changed to:", e.target.value);
              setSelectedWorkspace(e.target.value);
            }}
            className="w-full mt-2 bg-gray-800 text-white rounded px-2 py-1 text-sm"
          >
            {workspaces
              .filter(ws => ws != null) // ✅ Filter out null values
              .map((ws) => (
                <option key={ws._id} value={ws._id}>
                  {ws.name}
                </option>
              ))}
          </select>
        )}

        {/* Create Workspace Button */}
        <button
          onClick={() => {
            const name = prompt("Workspace name:");
            if (name?.trim()) {
              createWorkspace({ name: name.trim() })
                .then((workspaceId) => {
                  console.log("Created workspace:", workspaceId);
                  setSelectedWorkspace(workspaceId as string);
                })
                .catch(console.error);
            }
          }}
          className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
        >
          + New Workspace
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Channels Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Channels ({regularChannels.length})
            </h3>
            <button
              onClick={() => {
                if (!selectedWorkspace) {
                  alert("Please select a workspace first");
                  return;
                }
                const name = prompt("Channel name:");
                if (name?.trim()) {
                  const channelName = name.trim().toLowerCase().replace(/\s+/g, '-');
                  console.log("Creating channel:", channelName, "in workspace:", selectedWorkspace);
                  createChannel({
                    workspaceId: selectedWorkspace as Id<"workspaces">,
                    name: channelName,
                    isPrivate: false,
                  })
                    .then((channelId) => {
                      console.log("Created channel:", channelId);
                      onChannelSelect(channelId as string);
                    })
                    .catch(console.error);
                }
              }}
              className="text-gray-400 hover:text-white text-lg"
              title="Create channel"
            >
              +
            </button>
          </div>
          
          <div className="space-y-1">
            {regularChannels
              .filter(channel => channel != null) // ✅ Filter out null channels
              .map((channel) => (
                <button
                  key={channel._id}
                  onClick={() => {
                    console.log("Channel clicked:", channel._id, channel.name);
                    onChannelSelect(channel._id);
                  }}
                  className={`w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-gray-800 transition-colors ${
                    currentChannelId === channel._id ? "bg-blue-600" : ""
                  }`}
                >
                  <span className="text-gray-400">#</span>
                  <span className="truncate">{channel.name}</span>
                  {currentChannelId === channel._id && (
                    <span className="text-xs bg-blue-500 px-1 rounded ml-auto">●</span>
                  )}
                </button>
              ))}
            
            {regularChannels.length === 0 && (
              <p className="text-gray-500 text-sm px-2 py-1">
                No channels yet. Click + to create one!
              </p>
            )}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Direct Messages ({dmChannels.length})
            </h3>
            <button
              onClick={() => {
                alert("Direct messaging feature coming soon!");
              }}
              className="text-gray-400 hover:text-white text-lg"
              title="New direct message"
            >
              +
            </button>
          </div>
          
          <div className="space-y-1">
            {dmChannels
              .filter(dm => dm != null) // ✅ Filter out null DMs
              .map((dm) => (
                <button
                  key={dm._id}
                  onClick={() => {
                    console.log("DM clicked:", dm._id);
                    onChannelSelect(dm._id);
                  }}
                  className={`w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-gray-800 transition-colors ${
                    currentChannelId === dm._id ? "bg-blue-600" : ""
                  }`}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="truncate">Direct Message</span>
                </button>
              ))}
            
            {dmChannels.length === 0 && (
              <p className="text-gray-500 text-sm px-2 py-1">
                No direct messages yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
            {currentUserId?.slice(-2).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">You</p>
            <p className="text-xs text-gray-400">🟢 Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
