"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    checkAuthAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-white dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-primary/30">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Logo className="h-14 w-14" />
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Opening TSLA...</span>
        </div>
      </div>
    </div>
  );
}
