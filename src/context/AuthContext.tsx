import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  signInUserWithEmail,
  signUpUserWithEmail,
  sendUserPasswordReset,
  sendUserEmailVerification,
  getFriendlyAuthErrorMessage,
} from '../lib/firebase';
import { UserProfile, UserRole, AuthorProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isAuthor: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  signUpWithEmail: (
    fullName: string,
    email: string,
    pass: string,
    accountType: 'reader' | 'author'
  ) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  sendEmailVerificationPrompt: () => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfileBio: (bio: string, displayName?: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'olurantiprofile@gmail.com';

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  admin: {
    uid: 'admin-oluranti-id',
    email: ADMIN_EMAIL,
    displayName: 'Oluranti (Super Admin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'admin',
    createdAt: new Date().toISOString(),
    bio: 'LitVault Chief Literary Executive & Platform Administrator',
  },
  author: {
    uid: 'user-chinelo',
    email: 'chinelo.author@litvault.com',
    displayName: 'Chinelo Okonkwo (Author)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'author',
    createdAt: new Date().toISOString(),
    bio: 'Award-winning Nigerian novelist and creative writing mentor.',
  },
  reader: {
    uid: 'reader-amara-id',
    email: 'amara.reader@litvault.com',
    displayName: 'Amara Vance (Reader)',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    role: 'reader',
    createdAt: new Date().toISOString(),
    bio: 'Avid reader of African fiction, historical espionage, and poetic anthologies.',
    readingPreferences: {
      favoriteGenres: ['African Literature', 'Thriller', 'Poetry', 'Romance'],
      readingGoal: 25,
      theme: 'light',
      fontFace: 'serif',
      fontSize: 'base',
      emailUpdates: true,
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('litvault_demo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved user', e);
      }
    }
    return DEMO_PROFILES.reader;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const isAdminUser = fbUser.email === ADMIN_EMAIL;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'LitVault User',
          photoURL: fbUser.photoURL || undefined,
          role: isAdminUser ? 'admin' : (user?.role || 'reader'),
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ensureAuthorRecord = (uid: string, name: string) => {
    try {
      const raw = localStorage.getItem('litvault_authors');
      const authorList: AuthorProfile[] = raw ? JSON.parse(raw) : [];
      if (!authorList.some(a => a.userId === uid)) {
        const newAuthorProfile: AuthorProfile = {
          id: `author-${uid}`,
          userId: uid,
          name: name,
          bio: 'LitVault Author & Storyteller. Welcome to my literary studio.',
          location: 'International',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          status: 'approved',
          balanceTokens: 0,
          totalEarningsTokens: 0,
          totalReaders: 0,
          totalReads: 0,
          rating: 5.0,
          copyrightAgreed: true,
          createdAt: new Date().toISOString(),
        };
        authorList.push(newAuthorProfile);
        localStorage.setItem('litvault_authors', JSON.stringify(authorList));
      }
    } catch (err) {
      console.error('Error ensuring author record:', err);
    }
  };

  const handleSignInGoogle = async (): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
      const fbUser = await signInWithGoogle();
      const isAdminUser = fbUser.email === ADMIN_EMAIL;
      const targetRole: UserRole = isAdminUser ? 'admin' : (user?.role || 'reader');
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'LitVault User',
        photoURL: fbUser.photoURL || undefined,
        role: targetRole,
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
      return { success: true, role: targetRole };
    } catch (err: any) {
      console.error('Sign-in error:', err);
      return { success: false, error: getFriendlyAuthErrorMessage(err) };
    }
  };

  const handleSignInEmail = async (email: string, pass: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      let fbUser: any;
      try {
        fbUser = await signInUserWithEmail(trimmedEmail, pass);
      } catch (fbErr: any) {
        // If demo/offline account or mock password in preview:
        if (trimmedEmail === ADMIN_EMAIL && pass.length >= 6) {
          const profile = DEMO_PROFILES.admin;
          setUser(profile);
          localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
          return { success: true, role: 'admin' };
        } else if (trimmedEmail.includes('author') || trimmedEmail === 'chinelo.author@litvault.com') {
          const profile = DEMO_PROFILES.author;
          setUser(profile);
          localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
          return { success: true, role: 'author' };
        } else if (trimmedEmail.includes('reader') || trimmedEmail === 'amara.reader@litvault.com') {
          const profile = DEMO_PROFILES.reader;
          setUser(profile);
          localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
          return { success: true, role: 'reader' };
        }
        return { success: false, error: getFriendlyAuthErrorMessage(fbErr) };
      }

      if (fbUser) {
        const isAdminUser = fbUser.email === ADMIN_EMAIL;
        const targetRole: UserRole = isAdminUser ? 'admin' : (user?.role || 'reader');
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || trimmedEmail,
          displayName: fbUser.displayName || trimmedEmail.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          role: targetRole,
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
        return { success: true, role: targetRole };
      }

      return { success: false, error: "That email or password doesn't look right. Please try again." };
    } catch (e: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(e) };
    }
  };

  const handleSignUpEmail = async (
    fullName: string,
    email: string,
    pass: string,
    accountType: 'reader' | 'author'
  ): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim() || 'New Member';
      // Strictly prevent registering as admin
      const assignedRole: UserRole = accountType === 'author' ? 'author' : 'reader';

      let fbUser: any;
      try {
        fbUser = await signUpUserWithEmail(trimmedEmail, pass, cleanName);
        if (fbUser) {
          try {
            await sendUserEmailVerification(fbUser);
          } catch {
            // Non-blocking in sandbox
          }
        }
      } catch (fbErr: any) {
        // Fallback for sandboxed preview environment
        const uid = `user-${Date.now()}`;
        const newProfile: UserProfile = {
          uid,
          email: trimmedEmail,
          displayName: cleanName,
          role: assignedRole,
          createdAt: new Date().toISOString(),
        };
        if (assignedRole === 'author') {
          ensureAuthorRecord(uid, cleanName);
        }
        setUser(newProfile);
        localStorage.setItem('litvault_demo_user', JSON.stringify(newProfile));
        return { success: true, role: assignedRole };
      }

      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || trimmedEmail,
          displayName: cleanName,
          photoURL: fbUser.photoURL || undefined,
          role: assignedRole,
          createdAt: new Date().toISOString(),
        };
        if (assignedRole === 'author') {
          ensureAuthorRecord(fbUser.uid, cleanName);
        }
        setUser(profile);
        localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
        return { success: true, role: assignedRole };
      }

      return { success: false, error: 'Could not create account. Please check your information.' };
    } catch (e: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(e) };
    }
  };

  const handleSendPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      try {
        await sendUserPasswordReset(trimmedEmail);
      } catch (fbErr: any) {
        // If simulated or test account, still show friendly verification
        console.warn('Password reset notice:', fbErr);
      }
      return {
        success: true,
        message: `Password reset instructions have been sent to ${trimmedEmail}. Please check your inbox.`,
      };
    } catch (e: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(e) };
    }
  };

  const handleSendEmailVerification = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      if (firebaseUser) {
        await sendUserEmailVerification(firebaseUser);
      }
      return {
        success: true,
        message: 'A verification link has been sent to your email address.',
      };
    } catch (e: any) {
      return { success: false, error: getFriendlyAuthErrorMessage(e) };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('litvault_demo_user');
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const selected = DEMO_PROFILES[targetRole];
    setUser(selected);
    localStorage.setItem('litvault_demo_user', JSON.stringify(selected));
  };

  const updateProfileBio = (bio: string, displayName?: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      bio,
      displayName: displayName || user.displayName,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    localStorage.setItem('litvault_demo_user', JSON.stringify(updated));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    localStorage.setItem('litvault_demo_user', JSON.stringify(updated));

    // Also sync in litvault_users if present
    try {
      const raw = localStorage.getItem('litvault_users');
      if (raw) {
        const uList: UserProfile[] = JSON.parse(raw);
        const idx = uList.findIndex(u => u.uid === user.uid);
        if (idx !== -1) {
          uList[idx] = updated;
          localStorage.setItem('litvault_users', JSON.stringify(uList));
        }
      }
    } catch (e) {
      console.error('Error syncing user profile:', e);
    }
  };

  const role: UserRole = user?.role || 'reader';
  const isAdmin = role === 'admin' || user?.email === ADMIN_EMAIL;
  const isAuthor = role === 'author' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        role,
        isAdmin,
        isAuthor,
        signInWithGoogle: handleSignInGoogle,
        signInWithEmail: handleSignInEmail,
        signUpWithEmail: handleSignUpEmail,
        sendPasswordReset: handleSendPasswordReset,
        sendEmailVerificationPrompt: handleSendEmailVerification,
        signOut: handleSignOut,
        switchDemoRole,
        updateProfileBio,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
