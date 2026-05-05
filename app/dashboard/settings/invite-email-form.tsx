'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateInviteSettings } from '@/lib/actions/settings';
import { Loader2, Info } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface InviteEmailFormProps {
  inviteMessage: string | null;
  inviteReplyTo: string | null;
}

const MAX_MESSAGE_LENGTH = 500;

export function InviteEmailForm({ inviteMessage, inviteReplyTo }: InviteEmailFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [messageLength, setMessageLength] = useState(inviteMessage?.length ?? 0);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateInviteSettings(new FormData(e.currentTarget));
      if (result.success) toast.success('Invite settings saved');
      else toast.error(result.error || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="invite_subject">Default Invite Subject</Label>
        <Input
          id="invite_subject"
          value="Your ScorePrompt assessment is ready"
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite_reply_to">Default Reply-To Email</Label>
        <Input
          id="invite_reply_to"
          name="invite_reply_to"
          type="email"
          defaultValue={inviteReplyTo ?? ''}
          placeholder="hr@yourcompany.com"
          disabled={isSaving}
          className="max-w-sm"
        />
        <p className="text-xs text-neutral-400">
          Employees who reply to the invite email will reach this address. Leave empty to use the default no-reply address.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sender_name">Sender Name</Label>
        <Input id="sender_name" value="Configured from organization name" disabled />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="invite_message">Default Invite Message</Label>
          <span className={`text-xs ${messageLength > MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-neutral-400'}`}>
            {messageLength} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <Textarea
          id="invite_message"
          name="invite_message"
          defaultValue={inviteMessage ?? ''}
          placeholder="e.g. Hi! As part of our AI adoption initiative, we'd like to measure the team's AI prompting skills. This takes about 15 minutes."
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={isSaving}
          onChange={e => setMessageLength(e.target.value.length)}
        />
        <p className="text-xs text-neutral-400">
          This message appears at the top of the invite email, before the assessment link. Leave empty to use the default message.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Email Preview: these settings apply to future invites only.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSaving || messageLength > MAX_MESSAGE_LENGTH}>
          {isSaving ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled>
          Preview Email
        </Button>
      </div>
    </form>
  );
}
