import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '../firebase/auth';
import { getUserProfile, createUserProfile } from '../firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          let userProfile = await getUserProfile(firebaseUser.uid);
          if (!userProfile) {
            const fallbackName = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User';
            await createUserProfile(firebaseUser.uid, {
              displayName: firebaseUser.displayName || fallbackName,
              email: firebaseUser.email,
            });
            userProfile = await getUserProfile(firebaseUser.uid);
          }
          setProfile(userProfile);
        } catch (e) {
          console.warn('Firestore profile load failed, using local fallback:', e);
          setProfile({
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            riskScore: 24,
            isLocalFallback: true
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
