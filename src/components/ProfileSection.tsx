import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  role: 'guest' | 'user' | 'admin';
  hasPro: boolean;
  messagesUsed: number;
}

interface ProfileSectionProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const ProfileSection = ({ user, setUser }: ProfileSectionProps) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const ADMIN_CREDENTIALS = {
    username: 'skzry',
    password: 'R.ofical.1'
  };

  const handleLogin = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setShowAdminLogin(true);
      return;
    }
    setUser({
      role,
      hasPro: false,
      messagesUsed: 0
    });
    toast.success('Вы вошли как Пользователь');
  };

  const handleAdminLogin = () => {
    if (adminUsername === ADMIN_CREDENTIALS.username && adminPassword === ADMIN_CREDENTIALS.password) {
      setUser({
        role: 'admin',
        hasPro: false,
        messagesUsed: 0
      });
      toast.success('Вы вошли как Администратор');
      setShowAdminLogin(false);
      setAdminUsername('');
      setAdminPassword('');
    } else {
      toast.error('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setUser({
      role: 'guest',
      hasPro: false,
      messagesUsed: 0
    });
    toast.success('Вы вышли из системы');
  };

  const grantProAccess = () => {
    if (user.role === 'admin') {
      setUser(prev => ({ ...prev, hasPro: true }));
      toast.success('PRO статус выдан пользователю');
    }
  };

  const revokeProAccess = () => {
    if (user.role === 'admin') {
      setUser(prev => ({ ...prev, hasPro: false }));
      toast.success('PRO статус отозван');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-8 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Icon name="User" className="text-white" size={40} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Профиль пользователя</h2>
            <div className="flex gap-2">
              <Badge className={`${
                user.role === 'admin' ? 'bg-red-500' :
                user.role === 'user' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}>
                {user.role === 'admin' ? '👑 Администратор' :
                 user.role === 'user' ? '👤 Пользователь' :
                 '🌐 Гость'}
              </Badge>
              {user.hasPro && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  ⭐ PRO
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Статус аккаунта</span>
              <span className="text-sm font-bold">
                {user.role === 'admin' ? 'Администратор' :
                 user.role === 'user' && user.hasPro ? 'PRO пользователь' :
                 user.role === 'user' ? 'Базовый пользователь' :
                 'Гость'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Использовано сообщений</span>
              <span className="text-sm font-bold">{user.messagesUsed}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Доступ к AI</span>
              <span className="text-sm font-bold">
                {user.role === 'admin' ? '♾️ Безлимитный' :
                 user.hasPro ? '♾️ Безлимитный' :
                 '5 сообщений'}
              </span>
            </div>
          </div>
        </div>

        {user.role === 'guest' && !showAdminLogin && (
          <div className="space-y-3">
            <p className="text-center text-gray-600 mb-4">Войдите для доступа ко всем функциям</p>
            <Button
              onClick={() => handleLogin('user')}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Icon name="LogIn" className="mr-2" size={18} />
              Войти как Пользователь
            </Button>
            <Button
              onClick={() => handleLogin('admin')}
              className="w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              <Icon name="Shield" className="mr-2" size={18} />
              Войти как Администратор
            </Button>
          </div>
        )}

        {user.role === 'guest' && showAdminLogin && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username" className="mb-2 block">Логин администратора</Label>
              <Input
                id="admin-username"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Введите логин"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="mb-2 block">Пароль</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Введите пароль"
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAdminLogin}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              >
                <Icon name="Shield" className="mr-2" size={18} />
                Войти
              </Button>
              <Button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminUsername('');
                  setAdminPassword('');
                }}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        {user.role !== 'guest' && (
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl border-2"
          >
            <Icon name="LogOut" className="mr-2" size={18} />
            Выйти
          </Button>
        )}
      </Card>

      {user.role === 'admin' && (
        <Card className="p-8 bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Icon name="Settings" className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold">Панель администратора</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block font-medium">Управление PRO статусом</Label>
              <div className="flex gap-3">
                <Button
                  onClick={grantProAccess}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Icon name="Check" className="mr-2" size={18} />
                  Выдать PRO
                </Button>
                <Button
                  onClick={revokeProAccess}
                  variant="outline"
                  className="flex-1 rounded-xl border-2"
                >
                  <Icon name="X" className="mr-2" size={18} />
                  Отозвать PRO
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border-2 border-red-200">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="text-red-500 mt-1" size={20} />
                <div>
                  <p className="font-medium mb-1">Привилегии администратора:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Безлимитный доступ к AI</li>
                    <li>• Управление PRO статусом пользователей</li>
                    <li>• Приоритетная обработка запросов</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileSection;