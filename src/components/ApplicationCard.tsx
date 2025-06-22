import { Doc } from "../../convex/_generated/dataModel";

interface ApplicationCardProps {
  application: Doc<"applications"> & { program?: Doc<"programs"> | null };
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      case "under_review": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "waitlisted": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.program?.title || "Program Not Found"}
          </h3>
          <p className="text-gray-600">
            {application.program?.university} • {application.program?.country}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
          {getStatusText(application.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Degree:</span>
          <p className="font-medium">{application.program?.degree}</p>
        </div>
        <div>
          <span className="text-gray-500">Duration:</span>
          <p className="font-medium">{application.program?.duration}</p>
        </div>
        <div>
          <span className="text-gray-500">Deadline:</span>
          <p className="font-medium text-red-600">{application.program?.applicationDeadline}</p>
        </div>
        <div>
          <span className="text-gray-500">Applied:</span>
          <p className="font-medium">
            {application.submittedAt 
              ? new Date(application.submittedAt).toLocaleDateString()
              : "Not submitted"
            }
          </p>
        </div>
      </div>

      {application.reviewerNotes && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-gray-900 mb-1">Reviewer Notes:</h4>
          <p className="text-sm text-gray-600">{application.reviewerNotes}</p>
        </div>
      )}

      <div className="flex gap-3">
        {application.status === "draft" && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Continue Application
          </button>
        )}
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
