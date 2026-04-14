'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface BuyCreditsButtonProps {
  packId: string;
  label: string;
}

export default function BuyCreditsButton({ packId, label }: BuyCreditsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleBuy() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credit_pack', packId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      setIsLoading(false);
    }
  }

  return (
    <Button
      className="w-full mt-auto"
      onClick={handleBuy}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
