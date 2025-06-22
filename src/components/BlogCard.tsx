import { Doc } from "../../convex/_generated/dataModel";

interface BlogCardProps {
  blog: Doc<"blogs"> & { 
    author: { name: string; email?: string } 
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  const handleReadMore = () => {
    window.location.hash = `blog-${blog._id}`;
  };

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {blog.imageUrl && (
        <div className="h-48 bg-gray-200">
          <img 
            src={blog.imageUrl} 
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span>By {blog.author.name}</span>
            {blog.publishedAt && (
              <span className="ml-2">
                • {new Date(blog.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <button
            onClick={handleReadMore}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Read More →
          </button>
        </div>
      </div>
    </article>
  );
}
