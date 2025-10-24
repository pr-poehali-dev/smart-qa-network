import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  id?: number;
  email?: string;
  role: 'guest' | 'user' | 'admin';
  hasPro: boolean;
  messagesUsed: number;
}

interface ProfileSectionProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

interface RegisteredUser {
  id: number;
  email: string;
  role: string;
  hasPro: boolean;
  messagesUsed: number;
}

const AUTH_URL = 'https://functions.poehali.dev/e86b9e53-4951-4f44-99b8-78a21319450c';
const USERS_URL = 'https://functions.poehali.dev/0293e17e-9089-4ed6-a275-863015cf2bec';

const ProfileSection = ({ user, setUser }: ProfileSectionProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    if (user.role === 'admin') {
      fetchAllUsers();
    }
  }, [user.role]);

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${USERS_URL}?list_all=true`);
      const data = await response.json();
      setAllUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          hasPro: data.user.hasPro,
          messagesUsed: data.user.messagesUsed
        });
        toast.success(authMode === 'login' ? 'Вход выполнен' : 'Регистрация завершена');
        setEmail('');
        setPassword('');
        
        if (data.user.role === 'admin') {
          fetchAllUsers();
        }
      } else {
        toast.error(data.error || 'Ошибка аутентификации');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
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

  const handleProToggle = async (userId: number, grant: boolean) => {
    try {
      const response = await fetch(USERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: grant ? 'grant_pro' : 'revoke_pro',
          user_id: userId
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(grant ? 'PRO выдан' : 'PRO отозван');
        fetchAllUsers();
      } else {
        toast.error('Ошибка обновления статуса');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    }
  };

  if (user.role === 'guest') {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 bg-white shadow-xl rounded-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Icon name="User" className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Добро пожаловать</h2>
            <p className="text-gray-600">Войдите или зарегистрируйтесь</p>
          </div>

          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 block">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <Button
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 py-6"
            >
              {isLoading ? 'Загрузка...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </div>

          {authMode === 'login' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Администратор: admin@ai-platform.com / R.ofical.1
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-8 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Icon name="User" className="text-white" size={40} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{user.email}</h2>
            <div className="flex gap-2">
              <Badge className={`${
                user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {user.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
              </Badge>
              {user.hasPro && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  ⭐ PRO
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Статус</span>
              <span className="text-sm font-bold">
                {user.role === 'admin' ? 'Админ' : user.hasPro ? 'PRO' : 'Базовый'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Сообщений</span>
              <span className="text-sm font-bold">{user.messagesUsed}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Доступ</span>
              <span className="text-sm font-bold">
                {user.role === 'admin' || user.hasPro ? '♾️' : '5'}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full rounded-xl border-2"
        >
          <Icon name="LogOut" className="mr-2" size={18} />
          Выйти
        </Button>
      </Card>

      {user.role === 'admin' && (
        <Card className="p-8 bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Icon name="Settings" className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold">Управление пользователями</h3>
          </div>

          <div className="space-y-3">
            {allUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Нет зарегистрированных пользователей</p>
            ) : (
              allUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-white rounded-xl border">
                  <div>
                    <p className="font-medium">{u.email}</p>
                    <p className="text-sm text-gray-500">Сообщений: {u.messagesUsed}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {u.hasPro && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">PRO</Badge>
                    )}
                    <Button
                      onClick={() => handleProToggle(u.id, !u.hasPro)}
                      size="sm"
                      className={`rounded-lg ${
                        u.hasPro
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {u.hasPro ? 'Отозвать PRO' : 'Выдать PRO'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileSection;
