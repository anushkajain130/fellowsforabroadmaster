import { Doc, Id } from "../../convex/_generated/dataModel";
import { Authenticated, Unauthenticated } from "convex/react";

interface ProgramCardProps {
  program: Doc<"programs">;
  onApply: () => void;
  onSignInRequired: () => void;
}

export function ProgramCard({ program, onApply, onSignInRequired }: ProgramCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-xl font-bold mb-2">{program.university}</h3>
          <p className="text-blue-100">{program.country}</p>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Degree:</span>
            <span className="font-medium">{program.degree}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium">{program.duration}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deadline:</span>
            <span className="font-medium text-red-600">{program.applicationDeadline}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Applicants:</span>
            <span className="font-medium">
              {program.currentApplicants}/{program.maxApplicants}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Key Benefits:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {program.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Authenticated>
          <button
            onClick={onApply}
            disabled={program.currentApplicants >= program.maxApplicants}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {program.currentApplicants >= program.maxApplicants ? "Applications Full" : "Apply Now"}
          </button>
        </Authenticated>

        <Unauthenticated>
          <button
            onClick={onSignInRequired}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In to Apply
          </button>
        </Unauthenticated>
      </div>
    </div>
  );
}
