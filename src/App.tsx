// src/App.tsx - Updated with proper height constraints
"use client";

import { useEffect, useState } from "react";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { BlogPage } from "./components/BlogPage";
import { BlogPost } from "./components/BlogPost";
import { ChatLayout } from "./components/chat/ChatLayout";

import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";

type View = "home" | "dashboard" | "admin" | "blog" | "chat";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedBlogId, setSelectedBlogId] = useState<Id<"blogs"> | null>(null);

  const userProfile = useQuery(api.users.getProfile);
  const programs = useQuery(api.programs.list, {});
  const seedPrograms = useMutation(api.seedData.seedPrograms);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1);

      if (hash.startsWith("blog-")) {
        setSelectedBlogId(hash.replace("blog-", "") as Id<"blogs">);
        setCurrentView("blog");
      } else if (hash === "blog") {
        setSelectedBlogId(null);
        setCurrentView("blog");
      } else if (hash === "dashboard") setCurrentView("dashboard");
      else if (hash === "admin") setCurrentView("admin");
      else if (hash === "chat") setCurrentView("chat");
      else setCurrentView("home");
    };

    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (programs !== undefined && programs.length === 0) {
      seedPrograms().catch(console.error);
    }
  }, [programs, seedPrograms]);

  const backToBlogRoot = () => {
    setSelectedBlogId(null);
    window.location.hash = "blog";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50"> {/* Changed to h-screen */}
      {/* Navigation Header - Fixed height */}
      <header className="h-16 flex-shrink-0 bg-white/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => {
                  setCurrentView("home");
                  window.location.hash = "";
                }}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                Fellows Abroad
              </button>

              {/* Authenticated Navigation */}
              <Authenticated>
                <nav className="hidden md:flex space-x-6">
                  {[
                    { label: "Programs", view: "home", hash: "" },
                    { label: "My Applications", view: "dashboard", hash: "dashboard" },
                    { label: "Blog", view: "blog", hash: "blog" },
                    { label: "Chat", view: "chat", hash: "chat" },
                  ].map((btn) => (
                    <button
                      key={btn.view}
                      onClick={() => {
                        setCurrentView(btn.view as View);
                        window.location.hash = btn.hash;
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentView === btn.view
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}

                  {userProfile?.profile?.isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentView("admin");
                        window.location.hash = "admin";
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentView === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Admin Panel
                    </button>
                  )}
                </nav>
              </Authenticated>

              {/* Unauthenticated Navigation */}
              <Unauthenticated>
                <nav className="hidden md:flex space-x-6">
                  <button
                    onClick={() => {
                      setCurrentView("blog");
                      backToBlogRoot();
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === "blog"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Blog
                  </button>
                </nav>
              </Unauthenticated>
            </div>

            <div className="flex items-center space-x-4">
              <Authenticated>
                <span className="text-sm text-gray-600">
                  Welcome, {userProfile?.user?.email}
                </span>
              </Authenticated>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Takes remaining height (screen height - 64px navbar) */}
      <main className="flex-1 min-h-0"> {/* Added min-h-0 for proper flex shrinking */}
        {/* Unauthenticated Views */}
        <Unauthenticated>
          <div className="h-full overflow-auto"> {/* Added proper height container */}
            {currentView === "blog" ? (
              selectedBlogId ? (
                <BlogPost blogId={selectedBlogId} onBack={backToBlogRoot} />
              ) : (
                <BlogPage />
              )
            ) : (
              <LandingPage />
            )}
          </div>
        </Unauthenticated>

        {/* Authenticated Views */}
        <Authenticated>
          {currentView === "home" && (
            <div className="h-full overflow-auto">
              <LandingPage />
            </div>
          )}
          
          {currentView === "dashboard" && (
            <div className="h-full overflow-auto">
              <Dashboard />
            </div>
          )}

          {currentView === "blog" && (
            <div className="h-full overflow-auto">
              {selectedBlogId ? (
                <BlogPost blogId={selectedBlogId} onBack={backToBlogRoot} />
              ) : (
                <BlogPage />
              )}
            </div>
          )}

          {/* CHAT - Full remaining height */}
          {currentView === "chat" && (
            <div className="h-full"> {/* Full height container for chat */}
              <ChatLayout />
            </div>
          )}

          {currentView === "admin" && userProfile?.profile?.isAdmin && (
            <div className="h-full overflow-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Admin Panel
                </h1>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">
                    Admin functionality coming soon...
                  </p>
                </div>
              </div>
            </div>
          )}
        </Authenticated>
      </main>

      <Toaster />
    </div>
  );
}
