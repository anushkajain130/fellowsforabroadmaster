import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ProgramCard } from "./ProgramCard";
import { ApplicationModal } from "./ApplicationModal";
import { Id } from "../../convex/_generated/dataModel";
import { SignInForm } from "../SignInForm";

export function LandingPage() {
  const programs = useQuery(api.programs.list, {});
  const countries = useQuery(api.programs.getCountries, {});
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Id<"programs"> | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const filteredPrograms = useQuery(
    api.programs.list,
    selectedCountry ? { country: selectedCountry } : {}
  );

  const handleApplyClick = (programId: Id<"programs">) => {
    setSelectedProgram(programId);
    setShowApplicationModal(true);
  };

  const handleSignInRequired = () => {
    setShowSignIn(true);
  };

  if (showSignIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-8">Please sign in to apply for fellowship programs</p>
          </div>
          <SignInForm />
          <div className="text-center">
            <button
              onClick={() => setShowSignIn(false)}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              ← Back to Programs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Gateway to Global Education
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover and apply for prestigious fellowship programs at top universities worldwide. 
              Transform your academic journey with fully-funded opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Programs
              </button>
              <button 
                onClick={() => setShowSignIn(true)}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Fellowship Programs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Successful Applicants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div id="programs" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Fellowship Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our curated selection of prestigious fellowship opportunities 
              from leading universities around the world.
            </p>
          </div>

          {/* Filter */}
          <div className="mb-8 flex justify-center">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {countries?.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms?.map((program) => (
              <ProgramCard
                key={program._id}
                program={program}
                onApply={() => handleApplyClick(program._id)}
                onSignInRequired={handleSignInRequired}
              />
            ))}
          </div>

          {filteredPrograms?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No programs found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to your dream fellowship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse & Select</h3>
              <p className="text-gray-600">
                Explore our comprehensive database of fellowship programs and find the perfect match for your goals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply Online</h3>
              <p className="text-gray-600">
                Complete your application with our user-friendly platform. Upload documents and submit essays seamlessly.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Accepted</h3>
              <p className="text-gray-600">
                Track your application status and receive notifications. Start your journey to academic excellence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedProgram && (
        <ApplicationModal
          programId={selectedProgram}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedProgram(null);
          }}
        />
      )}
    </div>
  );
}
