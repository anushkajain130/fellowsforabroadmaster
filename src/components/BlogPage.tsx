import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { BlogCard } from "./BlogCard";
import { BlogEditor } from "./BlogEditor";
import { Authenticated, Unauthenticated } from "convex/react";

export function BlogPage() {
  const tags = useQuery(api.blogs.getTags, {});
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);

  const blogs = useQuery(
    api.blogs.list,
    { 
      tag: selectedTag || undefined,
      search: searchTerm || undefined
    }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-600">Insights, stories, and updates from the fellowship community</p>
        </div>
        
        <Authenticated>
          <button
            onClick={() => setShowEditor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write New Post
          </button>
        </Authenticated>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search blogs by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Tags</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag("")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTag === "" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Posts ({blogs?.length || 0})
          </button>
          {tags?.map((tag) => {
            const tagCount = blogs?.filter(blog => blog.tags.includes(tag)).length || 0;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag} ({tagCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs?.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>

      {blogs?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedTag 
              ? "No posts match your search criteria. Try adjusting your filters." 
              : "No blog posts have been published yet."
            }
          </p>
        </div>
      )}

      {/* Blog Editor Modal */}
      {showEditor && (
        <BlogEditor onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}
