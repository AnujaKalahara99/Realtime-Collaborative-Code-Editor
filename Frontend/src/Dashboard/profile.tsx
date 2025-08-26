import { useTheme } from "../ThemeProvider";
import { useProfile } from "../Contexts/ProfileContext";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
  GitBranch,
  Star,
  Users,
  Settings,
} from "lucide-react";

export default function ProfilePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { profileData, loading, error } = useProfile();

  if (loading) {
    return (
      <div
        className={`min-h-screen ${theme.background} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={theme.text}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${theme.background} flex items-center justify-center`}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <div className={`${theme.surface} ${theme.border} border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${theme.hover} ${theme.text} h-9 px-3`}
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className={`text-2xl font-bold ${theme.text}`}></h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/settings")}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border ${theme.border} ${theme.surface} ${theme.hover} ${theme.text} h-9 px-3`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <div
          className={`${theme.surface} ${theme.border} border rounded-xl mb-8 shadow-lg`}
        >
          <div className="pt-6 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex h-32 w-32 shrink-0 overflow-hidden rounded-full">
                {profileData.profilePicture ? (
                  <img
                    className="aspect-square h-full w-full object-cover"
                    src={profileData.profilePicture}
                    alt="Profile"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-full ${theme.surfaceSecondary} text-2xl ${theme.text}`}
                  >
                    {profileData.firstName.charAt(0)}
                    {profileData.lastName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className={`text-3xl font-bold ${theme.text} mb-2`}>
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className={`${theme.textSecondary} text-lg mb-4`}>
                  {profileData.jobTitle}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {profileData.techStacks.map((tech, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${theme.surfaceSecondary} ${theme.text}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <p className={`${theme.textMuted} max-w-2xl`}>
                  {profileData.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div
            className={`${theme.surface} ${theme.border} border rounded-xl shadow-lg`}
          >
            <div
              className={`flex flex-col space-y-1.5 p-6 border-b ${theme.border}`}
            >
              <h3
                className={`text-2xl font-semibold leading-none tracking-tight ${theme.text}`}
              >
                Contact Information
              </h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className={`w-5 h-5 ${theme.textMuted}`} />
                <div>
                  <p className={`${theme.textSecondary} text-sm`}>Email</p>
                  <p className={theme.text}>{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className={`w-5 h-5 ${theme.textMuted}`} />
                <div>
                  <p className={`${theme.textSecondary} text-sm`}>Phone</p>
                  <p className={theme.text}>{profileData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${theme.textMuted}`} />
                <div>
                  <p className={`${theme.textSecondary} text-sm`}>Location</p>
                  <p className={theme.text}>{profileData.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${theme.textMuted}`} />
                <div>
                  <p className={`${theme.textSecondary} text-sm`}>Website</p>
                  <p className={theme.text}>{profileData.website}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Contributions */}
          <div
            className={`${theme.surface} ${theme.border} border rounded-xl shadow-lg`}
          >
            <div
              className={`flex flex-col space-y-1.5 p-6 border-b ${theme.border}`}
            >
              <h3
                className={`text-2xl font-semibold leading-none tracking-tight ${theme.text}`}
              >
                Project Contributions
              </h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className={`w-5 h-5 ${theme.textMuted}`} />
                  <div>
                    <p className={`${theme.textSecondary} text-sm`}>
                      Total Commits
                    </p>
                    <p className={`${theme.text} text-xl font-semibold`}>
                      1,247
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className={`w-5 h-5 ${theme.textMuted}`} />
                  <div>
                    <p className={`${theme.textSecondary} text-sm`}>
                      Stars Earned
                    </p>
                    <p className={`${theme.text} text-xl font-semibold`}>342</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 ${theme.textMuted}`} />
                  <div>
                    <p className={`${theme.textSecondary} text-sm`}>
                      Collaborators
                    </p>
                    <p className={`${theme.text} text-xl font-semibold`}>28</p>
                  </div>
                </div>
              </div>

              <div className={`mt-4 p-4 ${theme.surfaceSecondary} rounded-lg`}>
                <p className={`${theme.textSecondary} text-sm mb-2`}>
                  Recent Projects
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={theme.text}>E-commerce Platform</span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${theme.surfaceSecondary} ${theme.text}`}
                    >
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme.text}>Task Management App</span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${theme.border} ${theme.text}`}
                    >
                      Completed
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme.text}>Open Source Library</span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${theme.surfaceSecondary} ${theme.text}`}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
