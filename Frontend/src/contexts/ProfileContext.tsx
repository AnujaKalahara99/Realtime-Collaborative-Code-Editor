import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  jobTitle: string;
  phone: string;
  website: string;
  techStacks: string[];
  profilePicture: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
}

const defaultProfileData: ProfileData = {
  firstName: "Anuja",
  lastName: "Mannage",
  email: "anuja.mannage@example.com",
  bio: "Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with modern technologies and contributing to open source projects.",
  location: "Colombo",
  jobTitle: "Senior Software Engineer",
  phone: "+94781234567",
  website: "https://anujamannage.dev",
  techStacks: ["React", "TypeScript", "Node.js", "Python"],
  profilePicture: "",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] =
    useState<ProfileData>(defaultProfileData);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
