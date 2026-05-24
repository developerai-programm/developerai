import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import SearchView from './components/SearchView';
import PricingView from './components/PricingView';
import ProfileView from './components/ProfileView';
import Browser from './components/Browser';
import MusicCreatorView from './components/MusicCreatorView';
import { ViewType } from './types';
import { Paintbrush, Layers, FileSearch } from 'lucide-react';
import { AuthComponent } from './components/AuthComponent';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Handle redirect result for environments with popup block
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          const userRef = doc(db, 'users', user.uid);
          try {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastLogin: serverTimestamp(),
              createdAt: serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.error('Firestore sync error:', e);
          }
        }
      })
      .catch((error) => {
        console.error('Redirect Error:', error);
      });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0c0d]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'chat':
        return <ChatView type="chat" />;
      case 'code':
        return <ChatView type="code" />;
      case 'code-edit':
        return <ChatView type="code-edit" />;
      case 'file-analyze':
        return <ChatView type="file-analyze" />;
      case 'translate':
        return <ChatView type="translate" />;
      case 'music':
        return <MusicCreatorView />;
      case 'image':
      case 'image-edit':
      case 'analyze':
      case 'video':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
             <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
                <span className="text-4xl text-gray-300">🏗️</span>
             </div>
             <h2 className="text-2xl font-bold mb-2 text-gray-900">Tez orada qo'shiladi</h2>
             <p className="max-w-md text-gray-500">Ushbu xizmat hozirda ishlab chiqish jarayonida. Tez orada ushbu bo'lim ishga tushiriladi.</p>
          </div>
        );
      case 'search':
        return <SearchView />;
      case 'browser':
        return <Browser />;
      case 'pricing':
        return <PricingView />;
      case 'profile':
      case 'billing':
        return <ProfileView user={user} onViewChange={setActiveView} />;
      default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 font-display p-6 text-center">
           <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
              <span className="text-4xl text-gray-300">🏗️</span>
           </div>
           <h2 className="text-2xl font-bold mb-2 text-gray-900">Tez orada qo'shiladi</h2>
           <p className="max-w-md">Ushbu bo'lim ustida ish olib borilmoqda.</p>
        </div>
      );
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView}
      user={user}
    >
      {renderView()}
    </Layout>
  );
}

export default App;
