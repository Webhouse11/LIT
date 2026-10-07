import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export db with the specific firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline or connecting.');
    }
    return false;
  }
}
testConnection();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In failed:', err);
    throw err;
  }
}

export async function signOutUser() {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error('Sign-Out failed:', err);
    throw err;
  }
}

export async function signInUserWithEmail(email: string, pass: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (err: any) {
    let friendlyMessage = 'Unable to sign in. Please verify your email and password.';
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
      friendlyMessage = 'Invalid email or password. Please try again.';
    } else if (err?.code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many failed attempts. Please wait a moment before trying again.';
    } else if (err?.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    }
    throw new Error(friendlyMessage);
  }
}

export async function signUpUserWithEmail(email: string, pass: string, displayName: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  } catch (err: any) {
    let friendlyMessage = 'Unable to create account. Please try again.';
    if (err?.code === 'auth/email-already-in-use') {
      friendlyMessage = 'This email address is already registered. Please sign in instead.';
    } else if (err?.code === 'auth/weak-password') {
      friendlyMessage = 'Password is too weak. Please use at least 6 characters.';
    } else if (err?.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    }
    throw new Error(friendlyMessage);
  }
}

export async function sendUserPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (err: any) {
    throw new Error(getFriendlyAuthErrorMessage(err));
  }
}

export async function sendUserEmailVerification(userToVerify?: any): Promise<boolean> {
  try {
    const targetUser = userToVerify || auth.currentUser;
    if (targetUser && typeof targetUser.sendEmailVerification === 'function') {
      await targetUser.sendEmailVerification();
      return true;
    } else if (targetUser) {
      await sendEmailVerification(targetUser);
      return true;
    }
    return false;
  } catch (err: any) {
    console.warn('Email verification notification notice:', err);
    throw new Error(getFriendlyAuthErrorMessage(err));
  }
}

export function getFriendlyAuthErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = typeof err === 'string' ? err : err?.code || err?.message || '';

  if (
    code.includes('user-not-found') ||
    code.includes('wrong-password') ||
    code.includes('invalid-credential') ||
    code.includes('INVALID_LOGIN_CREDENTIALS')
  ) {
    return "That email or password doesn't look right. Please try again.";
  }
  if (code.includes('email-already-in-use')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address (e.g. reader@example.com).';
  }
  if (code.includes('weak-password')) {
    return 'Your password must be at least 8 characters long with letters and numbers.';
  }
  if (code.includes('too-many-requests')) {
    return 'Access is temporarily slowed for security. Please wait a moment and try again.';
  }
  if (code.includes('network-request-failed')) {
    return 'Network connection issue detected. Please check your internet connection.';
  }
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
    return 'Google sign-in was cancelled before completion. Please try again when ready.';
  }
  if (code.includes('requires-recent-login')) {
    return 'For your security, please sign in again before continuing.';
  }
  
  if (typeof err?.message === 'string' && !err.message.startsWith('Firebase:') && !err.message.includes('auth/')) {
    return err.message;
  }

  return 'Unable to complete your request. Please check your information and try again.';
}
