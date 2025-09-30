import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "../database/superbase";
import React from "react";
export interface ProfileData {
  id?: string;
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
  updateProfile: (data: Partial<ProfileData>) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const defaultProfileData: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  bio: "",
  location: "",
  jobTitle: "",
  phone: "",
  website: "",
  techStacks: [],
  profilePicture: "",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] =
    useState<ProfileData>(defaultProfileData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch profile data from database
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        //console.error("Error loading profile:", error);
        setError("Failed to load profile data");
        return;
      }

      if (data) {
        // Map database fields to our ProfileData interface
        const mappedProfile: ProfileData = {
          id: data.id,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || user.email || "",
          bio: data.bio || "",
          location: data.location || "",
          jobTitle: data.job_title || "",
          phone: data.phone || "",
          website: data.website || "",
          techStacks: data.tech_stacks || [],
          profilePicture: data.avatar_url || "",
        };

        setProfileData(mappedProfile);
      }
    } catch (err) {
      //console.error("Error in loadProfile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<ProfileData>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No authenticated user found");
        return false;
      }

      // Map our ProfileData fields to database fields
      const dbData: any = {};

      if (data.firstName !== undefined) dbData.first_name = data.firstName;
      if (data.lastName !== undefined) dbData.last_name = data.lastName;
      if (data.email !== undefined) dbData.email = data.email;
      if (data.bio !== undefined) dbData.bio = data.bio;
      if (data.location !== undefined) dbData.location = data.location;
      if (data.jobTitle !== undefined) dbData.job_title = data.jobTitle;
      if (data.phone !== undefined) dbData.phone = data.phone;
      if (data.website !== undefined) dbData.website = data.website;
      if (data.techStacks !== undefined) dbData.tech_stacks = data.techStacks;
      if (data.profilePicture !== undefined)
        dbData.avatar_url = data.profilePicture;

      // Update in database
      const { error } = await supabase
        .from("profiles")
        .update(dbData)
        .eq("id", user.id);

      if (error) {
        //console.error("Error updating profile:", error);
        setError("Failed to update profile");
        return false;
      }

      // Update local state
      setProfileData((prev) => ({ ...prev, ...data }));
      return true;
    } catch (err) {
      console.error("Error in updateProfile:", err);
      setError("Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        updateProfile,
        loading,
        error,
        refreshProfile,
      }}
    >
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
