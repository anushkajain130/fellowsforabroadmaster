import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";

interface CommentSectionProps {
  blogId: Id<"blogs">;
}

export function CommentSection({ blogId }: CommentSectionProps) {
  const comments = useQuery(api.comments.getByBlog, { blogId });
  const userProfile = useQuery(api.users.getProfile);
  const createComment = useMutation(api.comments.create);
  const updateComment = useMutation(api.comments.update);
  const deleteComment = useMutation(api.comments.delete_);
  
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<Id<"comments"> | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await createComment({ blogId, content: newComment.trim() });
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (commentId: Id<"comments">, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const handleUpdateComment = async (commentId: Id<"comments">) => {
    if (!editContent.trim()) return;

    try {
      await updateComment({ id: commentId, content: editContent.trim() });
      setEditingComment(null);
      setEditContent("");
      toast.success("Comment updated successfully");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment({ id: commentId });
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const canEditComment = (comment: any) => {
    return userProfile?.profile?.isAdmin || 
      (userProfile?.user && comment.authorId === userProfile.user._id);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments?.length || 0})
      </h3>

      {/* Add Comment Form */}
      <Authenticated>
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      </Authenticated>

      <Unauthenticated>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-600 mb-4">Sign in to join the conversation</p>
          <button
            onClick={() => window.location.hash = "signin"}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </Unauthenticated>

      {/* Comments List */}
      <div className="space-y-6">
        {comments?.map((comment) => (
          <div key={comment._id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(comment._creationTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {comment.updatedAt && (
                    <span className="ml-2">(edited)</span>
                  )}
                </p>
              </div>
              
              <Authenticated>
                {canEditComment(comment) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment._id, comment.content)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </Authenticated>
            </div>
            
            {editingComment === comment._id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateComment(comment._id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent("");
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
            )}
          </div>
        ))}
      </div>

      {comments?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}
