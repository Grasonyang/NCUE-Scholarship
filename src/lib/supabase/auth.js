import { supabase } from './client';

// User authentication functions
export const authService = {
  /**
   * Signs up a new user.
   * Profile creation and display_name update are now fully handled by a database trigger.
   * This function only needs to pass the user's data to Supabase Auth.
   */
  async signUp(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // 將所有使用者註冊資料存入 raw_user_meta_data
            data: { ...userData },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Sign-up failed:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Signs in a user.
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Signs out the current user.
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Gets the current user and their profile.
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // Ignore "no rows found" error
          console.error("Error fetching profile:", profileError);
        }
        
        return { 
          success: true, 
          user: {
            ...user,
            profile: profile || null,
            role: profile?.role || 'user'
          }
        };
      }
      
      return { success: true, user: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ... (the rest of the authService functions: resetPassword, updatePassword, etc.)
    // 獲取用戶profile
    async getUserProfile(userId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    
      // 重設密碼
      async resetPassword(email) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });
          
          if (error) throw error;
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    
      // 更新密碼
      async updatePassword(password) {
        try {
          const { error } = await supabase.auth.updateUser({
            password
          });
          
          if (error) throw error;
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    
      // 驗證 OTP
      async verifyOtp(email, token, type = 'email') {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type
          });
          
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    
      // 重新發送 OTP
      async resendOtp(email, type = 'signup') {
        try {
          const { error } = await supabase.auth.resend({
            type,
            email
          });
          
          if (error) throw error;
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    
      // 監聽認證狀態變化
      onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
          callback(event, session);
        });
      }
};
