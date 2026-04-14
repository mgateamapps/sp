'use client';

import { Button } from '@/components/ui/button';
import { startQuickTest } from '@/lib/actions/quick-test';
import { Zap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function QuickTestButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const result = await startQuickTest();
      if (result && 'error' in result) {
        toast.error(result.error);
        setIsLoading(false);
      }
      // On success, startQuickTest redirects — no need to setIsLoading(false)
    } catch {
      toast.error('Something went wrong');
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sending invite...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 mr-2" />
          Try it yourself
        </>
      )}
    </Button>
  );
}
