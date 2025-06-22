import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ApplicationCard } from "./ApplicationCard";

export function Dashboard() {
  const applications = useQuery(api.applications.getUserApplications);
  const notifications = useQuery(api.users.getNotifications);

  const unreadNotifications = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600">Track your fellowship applications and stay updated</p>
      </div>

      {/* Notifications */}
      {unreadNotifications > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <span className="text-blue-600 font-semibold text-sm">{unreadNotifications}</span>
            </div>
            <div>
              <h3 className="font-medium text-blue-900">New Notifications</h3>
              <p className="text-sm text-blue-700">You have {unreadNotifications} unread notification{unreadNotifications > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Applications Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {applications?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {applications?.filter(app => app.status === "submitted" || app.status === "under_review").length || 0}
          </div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {applications?.filter(app => app.status === "accepted").length || 0}
          </div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-600 mb-1">
            {applications?.filter(app => app.status === "draft").length || 0}
          </div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
        </div>
        <div className="p-6">
          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start your journey by applying to fellowship programs</p>
              <button
                onClick={() => window.location.hash = "home"}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Programs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
