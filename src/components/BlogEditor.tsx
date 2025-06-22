import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface BlogEditorProps {
  blog?: Doc<"blogs"> & { author: { name: string; email?: string } };
  onClose: () => void;
  onBack?: () => void;
}

export function BlogEditor({ blog, onClose, onBack }: BlogEditorProps) {
  const createBlog = useMutation(api.blogs.create);
  const updateBlog = useMutation(api.blogs.update);
  const existingTags = useQuery(api.blogs.getTags, {});
  
  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(blog?.tags || []);
  const [imageUrl, setImageUrl] = useState(blog?.imageUrl || "");
  const [customTag, setCustomTag] = useState("");
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [isPublished, setIsPublished] = useState(blog?.isPublished || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
      setShowCustomTagInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (blog) {
        await updateBlog({
          id: blog._id,
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
          imageUrl: imageUrl.trim() || undefined,
          isPublished,
        });
        toast.success("Blog post updated successfully");
      } else {
        await createBlog({
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
          imageUrl: imageUrl.trim() || undefined,
          isPublished,
        });
        toast.success("Blog post created successfully");
      }
      
      onClose();
      if (onBack) onBack();
    } catch (error) {
      toast.error(blog ? "Failed to update blog post" : "Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {blog ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog post title"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Selector */}
              <div className="space-y-3">
                <select
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setShowCustomTagInput(true);
                    } else if (e.target.value) {
                      handleAddTag(e.target.value);
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a tag...</option>
                  {existingTags?.map((tag) => (
                    <option key={tag} value={tag} disabled={selectedTags.includes(tag)}>
                      {tag}
                    </option>
                  ))}
                  <option value="custom">+ Create custom tag</option>
                </select>

                {/* Custom Tag Input */}
                {showCustomTagInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Enter custom tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomTagInput(false);
                        setCustomTag("");
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write your blog post content here..."
                required
              />
            </div>

            {/* Publish Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                Publish immediately
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (blog ? "Updating..." : "Creating...") 
                  : (blog ? "Update Post" : "Create Post")
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
