'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, updatePassword } from '@/lib/actions/settings';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProfileFormProps {
  fullName: string;
  email: string;
}

export function ProfileForm({ fullName, email }: ProfileFormProps) {
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingName(true);
    try {
      const result = await updateProfile(new FormData(e.currentTarget));
      if (result.success) toast.success('Name saved');
      else toast.error(result.error || 'Failed to save');
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingPassword(true);
    try {
      const result = await updatePassword(new FormData(e.currentTarget));
      if (result.success) {
        toast.success('Password updated');
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Name & Email */}
      <form onSubmit={handleSaveName} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={fullName}
              required
              disabled={isSavingName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
            />
            <p className="text-xs text-neutral-400">Email cannot be changed</p>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSavingName}>
          {isSavingName ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : 'Save name'}
        </Button>
      </form>

      {/* Password */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Change password</p>
        <form onSubmit={handleSavePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  name="new_password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  disabled={isSavingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  required
                  disabled={isSavingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={isSavingPassword}>
            {isSavingPassword ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Updating...</> : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
