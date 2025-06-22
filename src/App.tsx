import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { BlogPage } from "./components/BlogPage";
import { BlogPost } from "./components/BlogPost";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "dashboard" | "admin" | "blog">("home");
  const [selectedBlogId, setSelectedBlogId] = useState<Id<"blogs"> | null>(null);
  const userProfile = useQuery(api.users.getProfile);
  const seedPrograms = useMutation(api.seedData.seedPrograms);
  const programs = useQuery(api.programs.list, {});

  // Handle URL hash changes for blog navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('blog-')) {
        const blogId = hash.replace('blog-', '') as Id<"blogs">;
        setSelectedBlogId(blogId);
        setCurrentView("blog");
      } else if (hash === 'blog') {
        setSelectedBlogId(null);
        setCurrentView("blog");
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Seed data on first load if no programs exist
  useEffect(() => {
    if (programs !== undefined && programs.length === 0) {
      seedPrograms().catch(console.error);
    }
  }, [programs, seedPrograms]);

  const handleBlogBack = () => {
    setSelectedBlogId(null);
    window.location.hash = 'blog';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => {
                  setCurrentView("home");
                  window.location.hash = '';
                }}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                Fellows Abroad
              </button>
              <Authenticated>
                <nav className="hidden md:flex space-x-6">
                  <button
                    onClick={() => {
                      setCurrentView("home");
                      window.location.hash = '';
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === "home" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Programs
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView("dashboard");
                      window.location.hash = 'dashboard';
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === "dashboard" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    My Applications
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView("blog");
                      setSelectedBlogId(null);
                      window.location.hash = 'blog';
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === "blog" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Blog
                  </button>
                  {userProfile?.profile?.isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentView("admin");
                        window.location.hash = 'admin';
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
              <Unauthenticated>
                <nav className="hidden md:flex space-x-6">
                  <button
                    onClick={() => {
                      setCurrentView("blog");
                      setSelectedBlogId(null);
                      window.location.hash = 'blog';
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

      <main className="flex-1">
        <Unauthenticated>
          {currentView === "blog" ? (
            selectedBlogId ? (
              <BlogPost blogId={selectedBlogId} onBack={handleBlogBack} />
            ) : (
              <BlogPage />
            )
          ) : (
            <LandingPage />
          )}
        </Unauthenticated>
        
        <Authenticated>
          {currentView === "home" && <LandingPage />}
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "blog" && (
            selectedBlogId ? (
              <BlogPost blogId={selectedBlogId} onBack={handleBlogBack} />
            ) : (
              <BlogPage />
            )
          )}
          {currentView === "admin" && userProfile?.profile?.isAdmin && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Admin functionality coming soon...</p>
              </div>
            </div>
          )}
        </Authenticated>
      </main>

      <Toaster />
    </div>
  );
}
