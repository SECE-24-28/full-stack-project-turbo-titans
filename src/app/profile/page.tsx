"use client";

import { useState, useEffect } from "react";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $email: String) {
    updateProfile(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

export default function ProfilePage() {
  const { data, loading: queryLoading } = useQuery(ME_QUERY);
  
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (data?.me) {
      setProfileForm({ name: data.me.name, email: data.me.email });
    }
  }, [data]);

  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile", { description: error.message });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ variables: { name: profileForm.name, email: profileForm.email } });
  };

  if (queryLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.me) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account Settings</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Information Section */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </h3>
            <p className="text-sm text-muted-foreground">Update your account details here.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-border/50">
                <Button type="submit" disabled={updatingProfile} className="w-full sm:w-auto">
                  {updatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => window.location.href = '/change-password'}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
