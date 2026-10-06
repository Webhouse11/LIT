import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isAuthor: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfileBio: (bio: string, displayName?: string) => void;
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

  const handleSignInGoogle = async () => {
    try {
      const fbUser = await signInWithGoogle();
      const isAdminUser = fbUser.email === ADMIN_EMAIL;
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'LitVault User',
        photoURL: fbUser.photoURL || undefined,
        role: isAdminUser ? 'admin' : 'reader',
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem('litvault_demo_user', JSON.stringify(profile));
    } catch (err) {
      console.error('Sign-in error:', err);
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
        signOut: handleSignOut,
        switchDemoRole,
        updateProfileBio,
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
