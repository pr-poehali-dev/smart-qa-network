import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  role: 'guest' | 'user' | 'admin';
  hasPro: boolean;
  messagesUsed: number;
}

interface SubscriptionSectionProps {
  user: User;
}

const SubscriptionSection = ({ user }: SubscriptionSectionProps) => {
  const handleContactForPayment = () => {
    window.open('https://t.me/skzry', '_blank');
    toast.success('Открываем Telegram для связи!');
  };

  const features = [
    { icon: 'Infinity', text: 'Безлимитные запросы к AI' },
    { icon: 'Zap', text: 'Приоритетная обработка' },
    { icon: 'Search', text: 'Поиск ответов в интернете' },
    { icon: 'Clock', text: 'Быстрые ответы без очереди' },
    { icon: 'Shield', text: 'Приоритетная поддержка' },
    { icon: 'Sparkles', text: 'Доступ к новым функциям' }
  ];

  if (user.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 bg-gradient-to-br from-red-50 via-white to-pink-50 shadow-xl rounded-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mx-auto mb-6">
            <Icon name="Crown" className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Вы - Администратор</h2>
          <p className="text-lg text-gray-600 mb-6">
            У вас уже есть полный безлимитный доступ ко всем функциям платформы
          </p>
          <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-lg px-6 py-2">
            ♾️ Безлимитный доступ
          </Badge>
        </Card>
      </div>
    );
  }

  if (user.hasPro) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 bg-gradient-to-br from-yellow-50 via-white to-orange-50 shadow-xl rounded-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">PRO подписка активна</h2>
          <p className="text-lg text-gray-600 mb-6">
            Вы можете пользоваться всеми возможностями платформы без ограничений
          </p>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-lg px-6 py-2">
            ⭐ PRO активен
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Получите PRO доступ
        </h1>
        <p className="text-xl text-gray-600">
          Разблокируйте все возможности AI платформы
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl rounded-2xl border-4 border-purple-300 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-yellow-500 text-black">Популярный</Badge>
          </div>

          <div className="mb-6">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">PRO</Badge>
            <h3 className="text-2xl font-bold mb-2">Премиум</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">∞</span>
              <span className="text-white/80">безлимит</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Icon name={feature.icon as any} className="text-white" size={20} />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleContactForPayment}
            className="w-full rounded-xl bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg py-6"
          >
            <Icon name="MessageCircle" className="mr-2" size={20} />
            Связаться для оплаты
          </Button>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="HelpCircle" className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Как получить PRO?</h3>
            <p className="text-gray-600 mb-4">
              Нажмите кнопку "Связаться для оплаты", и наш менеджер свяжется с вами для оформления подписки. 
              После оплаты вы получите мгновенный доступ ко всем функциям.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm">
                <Icon name="Headphones" className="mr-1" size={14} />
                Поддержка 24/7
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Icon name="Lock" className="mr-1" size={14} />
                Безопасная оплата
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Icon name="RefreshCw" className="mr-1" size={14} />
                Отмена в любое время
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionSection;