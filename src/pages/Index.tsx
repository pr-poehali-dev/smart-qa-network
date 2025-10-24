import { useState, useEffect } from 'react';
import ChatSection from '@/components/ChatSection';
import ProfileSection from '@/components/ProfileSection';
import SubscriptionSection from '@/components/SubscriptionSection';
import Icon from '@/components/ui/icon';

type UserRole = 'guest' | 'user' | 'admin';

interface User {
  role: UserRole;
  hasPro: boolean;
  messagesUsed: number;
}

const Index = () => {
  const [currentSection, setCurrentSection] = useState<'chat' | 'profile' | 'subscription'>('chat');
  const [user, setUser] = useState<User>({
    role: 'guest',
    hasPro: false,
    messagesUsed: 0
  });

  const getMessageLimit = () => {
    if (user.role === 'admin') return Infinity;
    if (user.role === 'guest') return 5;
    if (user.hasPro) return Infinity;
    return 5;
  };

  const canSendMessage = () => {
    const limit = getMessageLimit();
    return user.messagesUsed < limit;
  };

  const incrementMessageCount = () => {
    setUser(prev => ({
      ...prev,
      messagesUsed: prev.messagesUsed + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon name="Sparkles" className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Platform
              </h1>
            </div>
            
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSection('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentSection === 'chat'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name="MessageSquare" className="inline mr-2" size={18} />
                Чат
              </button>
              <button
                onClick={() => setCurrentSection('subscription')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentSection === 'subscription'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name="Crown" className="inline mr-2" size={18} />
                Подписка
              </button>
              <button
                onClick={() => setCurrentSection('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentSection === 'profile'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name="User" className="inline mr-2" size={18} />
                Профиль
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentSection === 'chat' && (
          <ChatSection
            user={user}
            canSendMessage={canSendMessage()}
            onSendMessage={incrementMessageCount}
            messageLimit={getMessageLimit()}
            onUpgradeClick={() => setCurrentSection('subscription')}
          />
        )}
        
        {currentSection === 'profile' && (
          <ProfileSection user={user} setUser={setUser} />
        )}
        
        {currentSection === 'subscription' && (
          <SubscriptionSection user={user} />
        )}
      </main>
    </div>
  );
};

export default Index;
