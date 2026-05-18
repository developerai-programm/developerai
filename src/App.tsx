import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import SearchView from './components/SearchView';
import PricingView from './components/PricingView';
import { ViewType } from './types';
import { Paintbrush, Layers, FileSearch } from 'lucide-react';
import { AuthComponent } from './components/AuthComponent';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [user, setUser] = useState<any>(null);

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
      case 'image':
      case 'image-edit':
      case 'analyze':
      case 'video':
      case 'music':
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
      case 'pricing':
        return <PricingView />;
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
