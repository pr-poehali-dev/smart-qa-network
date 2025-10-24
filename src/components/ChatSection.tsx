import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrl?: string;
}

interface ChatSectionProps {
  user: {
    id?: number;
    role: 'guest' | 'user' | 'admin';
    hasPro: boolean;
    messagesUsed: number;
  };
  canSendMessage: boolean;
  onSendMessage: () => void;
  messageLimit: number;
  onUpgradeClick: () => void;
}

const ENHANCE_URL = 'https://functions.poehali.dev/8699a9ae-e3fd-4ff0-a3df-c4c4cbd97c50';

const ChatSection = ({ user, canSendMessage, onSendMessage, messageLimit, onUpgradeClick }: ChatSectionProps) => {
  const getWelcomeMessage = () => {
    if (user.role === 'admin') {
      return 'Добро пожаловать, Администратор! У вас полный безлимитный доступ. Задавайте любые вопросы или улучшайте фотографии.';
    }
    if (user.hasPro) {
      return 'Добро пожаловать, PRO пользователь! У вас безлимитный доступ к AI. Задавайте вопросы и улучшайте фотографии без ограничений.';
    }
    if (user.role === 'user') {
      return 'Добро пожаловать! У вас есть 5 бесплатных запросов. Для безлимитного доступа получите PRO подписку в разделе "Подписка".';
    }
    return 'Привет! Я AI-ассистент. Могу ответить на любые вопросы или улучшить качество ваших фотографий. У вас 5 бесплатных запросов!';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getWelcomeMessage(),
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: '1',
      text: getWelcomeMessage(),
      sender: 'ai',
      timestamp: new Date()
    }]);
  }, [user.role, user.hasPro]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('фото') || lowerMsg.includes('изображени') || lowerMsg.includes('картинк')) {
      return 'Для улучшения фотографий используйте кнопку "Загрузить фото" ниже. Я повышу разрешение и качество с помощью AI-алгоритмов.';
    }
    
    if (lowerMsg.includes('привет') || lowerMsg.includes('здравствуй')) {
      return 'Здравствуйте! Рад помочь. Задавайте любые вопросы или загружайте фото для улучшения качества.';
    }
    
    if (lowerMsg.includes('подписк') || lowerMsg.includes('pro')) {
      return 'PRO подписка даёт неограниченный доступ к AI. Для получения подписки перейдите в раздел "Подписка".';
    }
    
    if (lowerMsg.includes('как дела') || lowerMsg.includes('что нового')) {
      return 'У меня всё отлично, спасибо! Я готов помочь вам с любыми вопросами. Чем могу быть полезен?';
    }
    
    if (lowerMsg.includes('помощь') || lowerMsg.includes('что ты умеешь')) {
      return 'Я могу:\n• Отвечать на ваши вопросы\n• Улучшать качество фотографий\n• Помогать с различными задачами\n• Давать советы и рекомендации\n\nЗадавайте любые вопросы!';
    }
    
    if (lowerMsg.includes('погода')) {
      return 'К сожалению, у меня нет доступа к актуальным данным о погоде. Рекомендую проверить прогноз на специализированных сайтах.';
    }
    
    if (lowerMsg.includes('спасибо') || lowerMsg.includes('благодарю')) {
      return 'Всегда пожалуйста! Рад был помочь. Если возникнут ещё вопросы — обращайтесь!';
    }
    
    const responses = [
      `Отличный вопрос! По теме "${userMessage}" могу сказать, что это интересная тема. Я проанализировал ваш запрос и готов помочь с дополнительной информацией.`,
      `Понял ваш запрос про "${userMessage}". Это важный вопрос! Если нужна более детальная информация, задавайте уточняющие вопросы.`,
      `Спасибо за вопрос! Касательно "${userMessage}" - я могу помочь вам разобраться в этом вопросе подробнее.`,
      `Интересный запрос про "${userMessage}"! Я обработал информацию и готов предоставить вам полезные сведения по этой теме.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    if (!canSendMessage) {
      toast.error('Достигнут лимит сообщений. Оформите подписку для продолжения.');
      onUpgradeClick();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    onSendMessage();

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user.hasPro && user.role !== 'admin') {
      toast.error('Улучшение фото доступно только для PRO пользователей');
      onUpgradeClick();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 10 МБ');
      return;
    }

    setIsEnhancing(true);
    toast.info('Загружаем и улучшаем фото...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: 'Улучшить это фото',
        sender: 'user',
        timestamp: new Date(),
        imageUrl: base64Image
      };
      setMessages(prev => [...prev, userMessage]);
      onSendMessage();

      try {
        const response = await fetch(ENHANCE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: '✨ Готово! Ваше фото улучшено с помощью AI. Разрешение увеличено в 1.5 раза, улучшена резкость и цвета.',
            sender: 'ai',
            timestamp: new Date(),
            imageUrl: data.enhanced_url
          };
          setMessages(prev => [...prev, aiResponse]);
          toast.success('Фото успешно улучшено!');
        } else {
          throw new Error(data.error || 'Ошибка улучшения');
        }
      } catch (error) {
        console.error('Enhancement error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Извините, произошла ошибка при улучшении фото. Проверьте формат изображения и попробуйте снова.',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        toast.error('Ошибка улучшения фото');
      } finally {
        setIsEnhancing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const remainingMessages = messageLimit === Infinity ? '∞' : messageLimit - user.messagesUsed;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon name="Bot" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Ассистент</h2>
                <p className="text-sm text-white/80">Всегда на связи</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Осталось:</p>
              <p className="text-2xl font-bold">{remainingMessages}</p>
            </div>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-white shadow-md border border-gray-100'
                }`}
              >
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl} 
                    alt="Image" 
                    className="rounded-lg mb-2 max-w-full h-auto"
                  />
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {(isProcessing || isEnhancing) && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white shadow-md border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
                </div>
                {isEnhancing && <p className="text-xs text-gray-500 mt-2">Улучшаем фото...</p>}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t">
          <div className="flex gap-3 mb-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="flex-1 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500"
              disabled={isProcessing || isEnhancing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!canSendMessage || isProcessing || isEnhancing || !inputValue.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!canSendMessage || isEnhancing}
            variant="outline"
            className="w-full rounded-xl border-2"
          >
            <Icon name="Image" className="mr-2" size={18} />
            Загрузить фото для улучшения
          </Button>

          {!canSendMessage && (
            <p className="text-sm text-red-500 mt-2 text-center">
              Лимит исчерпан. <button onClick={onUpgradeClick} className="underline font-medium">Оформите подписку</button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatSection;