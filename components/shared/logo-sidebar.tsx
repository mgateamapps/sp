'use client'

import Link from "next/link";
import Image from "next/image";
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { cn } from '@/lib/utils';

function LogoSidebar() {
  const isCollapsed = useSidebarCollapsed();

  return (
    <Link
      href="/dashboard"
      className={cn(
        'sidebar-logo h-[72px] py-3.5 flex items-center border-b border-neutral-100 dark:border-slate-700',
        isCollapsed ? 'px-3 justify-center' : 'px-4'
      )}
    >
      {isCollapsed ? (
        <Image
          src="/assets/images/logo_image.png"
          alt="ScorePrompt"
          width={48}
          height={48}
          priority
        />
      ) : (
        <Image
          src="/assets/images/logo_wide.png"
          alt="ScorePrompt"
          width={150}
          height={35}
          priority
        />
      )}
    </Link>
  )
}

export default LogoSidebar
