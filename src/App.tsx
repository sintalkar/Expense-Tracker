import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/authStore';

// Note: Ensure components are loaded or created below
import LoginScreen from './pages/LoginScreen';
import MainLayout from './pages/MainLayout';
import HomeScreen from './pages/HomeScreen';
import ScanScreen from './pages/ScanScreen';
import SyncScreen from './pages/SyncScreen';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const { setAuth, setLoading, isLoading, user } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let appUserData;
        if (userSnap.exists()) {
          appUserData = userSnap.data();
        } else {
          // First login, create doc
          appUserData = {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'User',
            photoUrl: firebaseUser.photoURL || '',
            isAdmin: false,
            isBlocked: false,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
          };
          await setDoc(userRef, appUserData);
        }
        setAuth(firebaseUser, appUserData);
      } else {
        setAuth(null, null);
      }
    });

    return () => unsub();
  }, [setAuth]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginScreen />} />
        
        <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<HomeScreen />} />
          <Route path="scan" element={<ScanScreen />} />
          <Route path="sync" element={<SyncScreen />} />
        </Route>
        
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
