import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { CommentSection } from "./CommentSection";
import { BlogEditor } from "./BlogEditor";
import { Authenticated } from "convex/react";
import { toast } from "sonner";

interface BlogPostProps {
  blogId: Id<"blogs">;
  onBack: () => void;
}

export function BlogPost({ blogId, onBack }: BlogPostProps) {
  const blog = useQuery(api.blogs.get, { id: blogId });
  const userProfile = useQuery(api.users.getProfile);
  const deleteBlog = useMutation(api.blogs.delete_);
  const [showEditor, setShowEditor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = userProfile?.profile?.isAdmin || 
    (blog && userProfile?.user && blog.authorId === userProfile.user._id);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      setIsDeleting(true);
      await deleteBlog({ id: blogId });
      toast.success("Blog post deleted successfully");
      onBack();
    } catch (error) {
      toast.error("Failed to delete blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <BlogEditor 
        blog={blog} 
        onClose={() => setShowEditor(false)} 
        onBack={onBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </button>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {blog.imageUrl && (
          <div className="h-64 md:h-96">
            <img 
              src={blog.imageUrl} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>
            
            <div className="flex justify-between items-center">
              <div className="text-gray-600">
                <span>By {blog.author.name}</span>
                {blog.publishedAt && (
                  <span className="ml-2">
                    • {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
                {blog.updatedAt && blog.updatedAt !== blog.publishedAt && (
                  <span className="ml-2 text-sm">
                    (Updated {new Date(blog.updatedAt).toLocaleDateString()})
                  </span>
                )}
              </div>
              
              <Authenticated>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditor(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </Authenticated>
            </div>
          </div>
          
          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection blogId={blogId} />
    </div>
  );
}
