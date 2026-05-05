'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadLogo, updateOrganization } from '@/lib/actions/settings';
import { Building2, ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface OrganizationFormProps {
  name: string;
  logoUrl: string | null;
}

export function OrganizationForm({ name, logoUrl }: OrganizationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLogo, setCurrentLogo] = useState(logoUrl);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadLogo(fd);
      if (result.success && result.url) {
        setCurrentLogo(result.url);
        toast.success('Logo updated');
        window.location.reload();
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateOrganization(new FormData(e.currentTarget));
      if (result.success) toast.success('Organization saved');
      else toast.error(result.error || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-start gap-5">
        <div
          onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden shrink-0 group relative"
        >
          {isUploadingLogo ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : currentLogo ? (
            <>
              <Image src={currentLogo} alt="Logo" width={80} height={80} className="w-full h-full object-contain p-1" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <Building2 className="w-7 h-7 text-neutral-400 group-hover:text-primary transition-colors" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleLogoChange}
        />
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">Company Logo</p>
          <p className="text-xs text-neutral-500 mt-0.5">Shown on assessment invite emails</p>
          <p className="text-xs text-neutral-400 mt-0.5">JPEG, PNG or WebP · max 5MB</p>
          {currentLogo && (
            <button
              type="button"
              onClick={() => setCurrentLogo(null)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
              Remove logo
            </button>
          )}
        </div>
      </div>

      {/* Company name */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            required
            disabled={isSaving}
            className="max-w-sm"
          />
        </div>
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
