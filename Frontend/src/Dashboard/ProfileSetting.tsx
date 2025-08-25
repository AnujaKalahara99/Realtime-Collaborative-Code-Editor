import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { useProfile } from "../contexts/ProfileContext";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Save,
  Palette,
  Upload,
  X,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function SettingsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { profileData, updateProfile } = useProfile();

  // Form state
  const [firstName, setFirstName] = useState(profileData.firstName);
  const [lastName, setLastName] = useState(profileData.lastName);
  const [email, setEmail] = useState(profileData.email);
  const [bio, setBio] = useState(profileData.bio);
  const [location, setLocation] = useState(profileData.location);
  const [jobTitle, setJobTitle] = useState(profileData.jobTitle);
  const [phone, setPhone] = useState(profileData.phone);
  const [website, setWebsite] = useState(profileData.website);
  const [techStacks, setTechStacks] = useState(profileData.techStacks);
  const [profilePicture, setProfilePicture] = useState(
    profileData.profilePicture
  );
  const [newTechStack, setNewTechStack] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleSaveProfile = () => {
    updateProfile({
      firstName,
      lastName,
      email,
      bio,
      location,
      jobTitle,
      phone,
      website,
      techStacks,
      profilePicture,
    });

    navigate("/profile");
  };

  const handleAddTechStack = () => {
    if (newTechStack.trim() && !techStacks.includes(newTechStack.trim())) {
      setTechStacks([...techStacks, newTechStack.trim()]);
      setNewTechStack("");
    }
  };

  const handleRemoveTechStack = (stackToRemove: string) => {
    setTechStacks(techStacks.filter((stack) => stack !== stackToRemove));
  };

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <div className={`${theme.surface} ${theme.border} border-b`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${theme.hover} ${theme.text}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className={`px-4 py-2 rounded-md border transition-colors ${theme.border} ${theme.surface} ${theme.text} ${theme.hover}`}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>Settings</h1>
            <p className={`${theme.textMuted} mt-2`}>
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Information */}
          <div
            className={`rounded-lg border p-6 ${theme.surface} ${theme.border}`}
          >
            <div className="mb-6">
              <h2
                className={`flex items-center gap-2 text-xl font-semibold ${theme.text}`}
              >
                <User className="w-5 h-5" />
                Profile Information
              </h2>
            </div>
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme.text}`}>
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${theme.surfaceSecondary} ${theme.text}`}
                      >
                        {firstName.charAt(0)}
                        {lastName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicture"
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors ${theme.border} ${theme.surface} ${theme.text} ${theme.hover}`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Picture
                    </label>
                    {profilePicture && (
                      <button
                        onClick={() => setProfilePicture("")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${theme.border} text-red-600 hover:bg-red-50`}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className={`block text-sm font-medium ${theme.text}`}
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className={`block text-sm font-medium ${theme.text}`}
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${theme.text}`}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jobTitle"
                  className={`block text-sm font-medium ${theme.text}`}
                >
                  Job Title
                </label>
                <input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className={`block text-sm font-medium ${theme.text}`}
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className={`block text-sm font-medium ${theme.text}`}
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className={`block text-sm font-medium ${theme.text}`}
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="website"
                  className={`block text-sm font-medium ${theme.text}`}
                >
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Tech Stacks Section */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme.text}`}>
                  Tech Stacks
                </label>
                <div className="space-y-3">
                  {/* Current Tech Stacks */}
                  <div className="flex flex-wrap gap-2">
                    {techStacks.map((stack, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${theme.surfaceSecondary} ${theme.text}`}
                      >
                        {stack}
                        <button
                          onClick={() => handleRemoveTechStack(stack)}
                          className={`ml-1 p-0.5 rounded-full hover:bg-red-100 transition-colors`}
                          title={`Remove ${stack}`}
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add New Tech Stack */}
                  <div className="flex gap-2">
                    <input
                      value={newTechStack}
                      onChange={(e) => setNewTechStack(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddTechStack()
                      }
                      placeholder="Add a technology (e.g., React, Python, Docker)"
                      className={`flex-1 px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={handleAddTechStack}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${theme.border} ${theme.surface} ${theme.text} ${theme.hover}`}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${theme.statusBar} ${theme.statusText} hover:opacity-90`}
              >
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            </div>
          </div>

          {/* Appearance Settings */}
          <div
            className={`rounded-lg border p-6 ${theme.surface} ${theme.border}`}
          >
            <div className="mb-6">
              <h2
                className={`flex items-center gap-2 text-xl font-semibold ${theme.text}`}
              >
                <Palette className="w-5 h-5" />
                Appearance
              </h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme.text}`}>
                  Language
                </label>
                <select
                  defaultValue="en"
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme.text}`}>
                  Timezone
                </label>
                <select
                  defaultValue="pst"
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="pst">Pacific Standard Time</option>
                  <option value="est">Eastern Standard Time</option>
                  <option value="cst">Central Standard Time</option>
                  <option value="mst">Mountain Standard Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div
            className={`rounded-lg border p-6 ${theme.surface} ${theme.border}`}
          >
            <div className="mb-6">
              <h2
                className={`flex items-center gap-2 text-xl font-semibold ${theme.text}`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${theme.text}`}>
                    Email Notifications
                  </label>
                  <p className={`${theme.textMuted} text-sm`}>
                    Receive notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${theme.text}`}>
                    Push Notifications
                  </label>
                  <p className={`${theme.textMuted} text-sm`}>
                    Receive push notifications in your browser
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${theme.text}`}>
                  Notification Frequency
                </label>
                <select
                  defaultValue="daily"
                  className={`w-full px-3 py-2 rounded-md border transition-colors ${theme.surface} ${theme.border} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div
            className={`rounded-lg border p-6 ${theme.surface} ${theme.border}`}
          >
            <div className="mb-6">
              <h2
                className={`flex items-center gap-2 text-xl font-semibold ${theme.text}`}
              >
                <Shield className="w-5 h-5" />
                Security
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${theme.text}`}>
                    Two-Factor Authentication
                  </label>
                  <p className={`${theme.textMuted} text-sm`}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="space-y-4">
                <button
                  className={`w-full px-4 py-2 rounded-md border transition-colors ${theme.border} ${theme.surface} ${theme.text} ${theme.hover}`}
                >
                  Change Password
                </button>
                <button
                  className={`w-full px-4 py-2 rounded-md border transition-colors ${theme.border} ${theme.surface} ${theme.text} ${theme.hover}`}
                >
                  Download Account Data
                </button>
                <button className="w-full px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
