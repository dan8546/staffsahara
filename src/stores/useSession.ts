import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'client_admin' | 'approver' | 'ops' | 'recruiter' | 'finance' | 'talent';

interface UserProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  is_staff: boolean;
  status: string;
  tenant_name?: string;
  tenant_slug?: string;
  email?: string;
}

interface SessionState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  tenantId: string | null;
  isStaff: boolean;
  isLoading: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkRole: (allowedRoles: UserRole[]) => boolean;
  cleanupAuthState: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      role: null,
      tenantId: null,
      isStaff: false,
      isLoading: true,

      setSession: (session) => {
        const user = session?.user || null;
        set({ 
          session, 
          user,
          isLoading: false 
        });
        
        // Clear profile if no session
        if (!session) {
          set({ 
            profile: null, 
            role: null, 
            tenantId: null, 
            isStaff: false 
          });
        }
      },

      setProfile: (profile) => {
        set({
          profile,
          role: profile?.role || null,
          tenantId: profile?.tenant_id || null,
          isStaff: profile?.is_staff || false,
          isLoading: false
        });
      },

      signOut: async () => {
        try {
          // Clean up auth state first
          get().cleanupAuthState();
          
          // Attempt global sign out
          try {
            await supabase.auth.signOut({ scope: 'global' });
          } catch (err) {
            console.warn('Global signout failed:', err);
          }
          
          // Force page reload for clean state
          window.location.href = '/login';
        } catch (error) {
          console.error('Sign out error:', error);
          // Force reload even if error
          window.location.href = '/login';
        }
      },

      refreshProfile: async () => {
        try {
          const { data, error } = await supabase.rpc('get_me');
          
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (data && data.length > 0) {
            get().setProfile(data[0]);
          } else {
            // User authenticated but no profile yet
            get().setProfile(null);
          }
        } catch (error) {
          console.error('Refresh profile error:', error);
        }
      },

      checkRole: (allowedRoles) => {
        const { role, isStaff } = get();
        
        // Staff users can access everything
        if (isStaff) return true;
        
        // Check if user has required role
        return role ? allowedRoles.includes(role) : false;
      },

      cleanupAuthState: () => {
        // Clear standard auth tokens
        localStorage.removeItem('supabase.auth.token');
        
        // Remove all Supabase auth keys from localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Remove from sessionStorage if in use
        Object.keys(sessionStorage || {}).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });

        // Reset state
        set({
          user: null,
          session: null,
          profile: null,
          role: null,
          tenantId: null,
          isStaff: false,
          isLoading: false
        });
      }
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        // Only persist essential non-sensitive data
        isStaff: state.isStaff,
        role: state.role,
        tenantId: state.tenantId
      })
    }
  )
);