"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Laptop, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gql, useMutation } from "@apollo/client";
import { toast } from "sonner";

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION, {
    onCompleted: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    changePassword({
      variables: { currentPassword, newPassword }
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Gradient & Info (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-primary to-purple-800 p-12 text-white lg:flex relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Laptop className="h-6 w-6 text-white" />
            </div>
            Lap Mart
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Secure your account.
          </h1>
          <p className="max-w-md text-lg text-white/80">
            Regularly changing your password helps protect your personal information, orders, and listings from unauthorized access.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} Lap Mart. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link 
              href="/profile" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">Change password</h2>
            <p className="text-sm text-muted-foreground">
              Please enter your current password to set a new one.
            </p>
          </div>

          {isSuccess ? (
            <div className="rounded-2xl border border-green-200 bg-green-50/50 p-8 text-center dark:border-green-900/50 dark:bg-green-900/10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-4 shadow-inner">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">Password Changed!</h3>
              <p className="text-sm text-green-700/80 dark:text-green-500/80 mb-6">
                Your password has been successfully updated. You can now use your new password to sign in.
              </p>
              <Link href="/profile" className={buttonVariants({ className: "w-full rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20" })}>
                Return to Profile
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="current-password">
                    Current password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-password">
                    New password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md hover:shadow-primary/30"
              >
                {loading ? "Updating..." : "Update Password"}
                {!loading && <Lock className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
