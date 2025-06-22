import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ApplicationModalProps {
  programId: Id<"programs">;
  onClose: () => void;
}

export function ApplicationModal({ programId, onClose }: ApplicationModalProps) {
  const program = useQuery(api.programs.get, { id: programId });
  const createApplication = useMutation(api.applications.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApplication = async () => {
    try {
      setIsCreating(true);
      const applicationId = await createApplication({ programId });
      toast.success("Application created successfully!");
      onClose();
      // Redirect to application form
      window.location.hash = `application-${applicationId}`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create application");
    } finally {
      setIsCreating(false);
    }
  };

  if (!program) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Program Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">University:</span>
                  <p className="font-medium">{program.university}</p>
                </div>
                <div>
                  <span className="text-gray-500">Country:</span>
                  <p className="font-medium">{program.country}</p>
                </div>
                <div>
                  <span className="text-gray-500">Degree:</span>
                  <p className="font-medium">{program.degree}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium">{program.duration}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{program.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
              <ul className="space-y-1">
                {program.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eligibility Requirements</h3>
              <ul className="space-y-1">
                {program.eligibility.map((requirement, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Requirements</h3>
              <ul className="space-y-1">
                {program.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-600">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Important Information</h4>
              <p className="text-sm text-yellow-700">
                Application Deadline: <strong>{program.applicationDeadline}</strong>
              </p>
              <p className="text-sm text-yellow-700">
                Available Spots: <strong>{program.maxApplicants - program.currentApplicants}</strong> remaining
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateApplication}
              disabled={isCreating || program.currentApplicants >= program.maxApplicants}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Start Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
