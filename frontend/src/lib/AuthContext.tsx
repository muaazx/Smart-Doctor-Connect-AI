import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  role: 'doctor' | 'patient' | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, role: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Check for doctor profile first
          const docRef = doc(db, 'doctors', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data());
            setRole('doctor');
          } else {
            // Check for patient profile
            const patRef = doc(db, 'patients', user.uid);
            const patSnap = await getDoc(patRef);
            if (patSnap.exists()) {
              setProfile(patSnap.data());
              setRole('patient');
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'profiles');
        }
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
