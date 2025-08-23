import { useEffect } from "react";
import { useSession } from "@/stores/useSession";
import { supabase } from "@/integrations/supabase/client";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setSession, refreshProfile, cleanupAuthState } = useSession();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Update session state synchronously
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            refreshProfile();
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          // Clean up state on sign out
          cleanupAuthState();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          refreshProfile();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, refreshProfile, cleanupAuthState]);

  return <>{children}</>;
};