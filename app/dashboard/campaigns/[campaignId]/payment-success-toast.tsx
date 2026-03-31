'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function PaymentSuccessToast() {
  const router = useRouter();

  useEffect(() => {
    toast.success('Payment successful! You can now send invites.');
    
    // Remove the query param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('payment');
    router.replace(url.pathname);
  }, [router]);

  return null;
}
