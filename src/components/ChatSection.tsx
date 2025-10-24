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

const AI_SEARCH_URL = 'https://functions.poehali.dev/99560980-ab21-4c21-a5f0-1f3fec744ec7';

const ChatSection = ({ user, canSendMessage, onSendMessage, messageLimit, onUpgradeClick }: ChatSectionProps) => {
  const getWelcomeMessage = () => {
    if (user.role === 'admin') {
      return 'Добро пожаловать, Администратор! У вас полный безлимитный доступ.\n\nЯ помогу:\n• Написать доклады и тексты\n• Объяснить любые теории\n• Решить задачи\n• Дать определения\n• Вычислить примеры';
    }
    if (user.hasPro) {
      return 'Добро пожаловать, PRO пользователь! Безлимитный доступ к AI.\n\nЯ помогу:\n• Написать доклады и тексты\n• Объяснить теории\n• Решить задачи\n• Дать определения';
    }
    if (user.role === 'user') {
      return 'Добро пожаловать! У вас 5 бесплатных запросов.\n\nЯ помогу написать доклады, объяснить теории, решить задачи и дать определения.\n\nДля безлимита → раздел "Подписка"';
    }
    return 'Привет! Я AI-ассистент (5 бесплатных запросов).\n\nЯ могу:\n✓ Писать доклады и тексты\n✓ Объяснять теории\n✓ Решать задачи\n✓ Давать определения\n✓ Вычислять примеры';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const getQuickResponse = (userMessage: string): string | null => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Приветствия
    if (lowerMsg.includes('привет') || lowerMsg.includes('здравствуй')) {
      return 'Здравствуйте! Задавайте любые вопросы - я найду ответы в интернете!';
    }
    
    // Математические вычисления
    if (lowerMsg.match(/\d+\s*[\+\-\*\/]\s*\d+/)) {
      try {
        const result = eval(userMessage.replace(/[^0-9+\-*/().\s]/g, ''));
        return `Ответ: ${result}`;
      } catch {
        return 'Не могу вычислить. Попробуйте другой формат.';
      }
    }
    
    // Просьбы написать что-то
    if (lowerMsg.includes('напиши') || lowerMsg.includes('составь') || lowerMsg.includes('создай')) {
      if (lowerMsg.includes('доклад') || lowerMsg.includes('сочинение') || lowerMsg.includes('эссе')) {
        return `Я могу помочь с написанием! Вот структура для вашего доклада:\n\n1. Введение - краткое описание темы\n2. Основная часть - раскрытие ключевых аспектов\n3. Заключение - выводы и итоги\n\nУточните тему подробнее, и я помогу с конкретным содержанием.`;
      }
      if (lowerMsg.includes('текст') || lowerMsg.includes('письмо')) {
        return 'Конечно! Уточните, какой текст нужен: официальное письмо, статья, объявление или что-то другое? Опишите подробнее задачу.';
      }
    }
    
    // Определения и термины
    if (lowerMsg.includes('что такое') || lowerMsg.includes('определение') || lowerMsg.includes('что значит')) {
      const keywords = {
        'фотосинтез': 'Фотосинтез - процесс преобразования растениями световой энергии в химическую. При этом из углекислого газа и воды образуются органические вещества (глюкоза) и кислород.',
        'демокра': 'Демократия - форма правления, при которой власть принадлежит народу. Решения принимаются большинством через выборы и референдумы.',
        'гравитац': 'Гравитация - универсальная сила притяжения между всеми объектами, имеющими массу. Чем больше масса объекта, тем сильнее его гравитационное поле.',
        'эволюц': 'Эволюция - процесс исторического развития живых организмов. Виды изменяются со временем через естественный отбор и наследственность.',
        'энерги': 'Энергия - способность системы совершать работу. Существует в разных формах: кинетическая, потенциальная, тепловая, электрическая.',
      };
      
      for (const [key, value] of Object.entries(keywords)) {
        if (lowerMsg.includes(key)) {
          return value;
        }
      }
      
      return 'Уточните термин подробнее, и я дам развёрнутое определение с примерами.';
    }
    
    // Объяснение теорий
    if (lowerMsg.includes('объясни') || lowerMsg.includes('расскажи') || lowerMsg.includes('как работает')) {
      if (lowerMsg.includes('относительност') || lowerMsg.includes('эйнштейн')) {
        return 'Теория относительности Эйнштейна:\n\n• Специальная - время и пространство относительны, скорость света постоянна\n• Общая - гравитация искривляет пространство-время\n\nЭто объясняет поведение объектов на больших скоростях и в сильных гравитационных полях.';
      }
      if (lowerMsg.includes('квантов') || lowerMsg.includes('квант')) {
        return 'Квантовая физика изучает поведение частиц на микроуровне. Ключевые принципы:\n\n• Квантование энергии\n• Корпускулярно-волновой дуализм\n• Принцип неопределённости Гейзенберга\n\nЧастицы могут находиться в суперпозиции до момента наблюдения.';
      }
    }
    
    // Решение задач
    if (lowerMsg.includes('реши') || lowerMsg.includes('задач') || lowerMsg.includes('найди')) {
      if (lowerMsg.match(/\d+/) && (lowerMsg.includes('процент') || lowerMsg.includes('%'))) {
        return 'Для процентов используйте формулу: (число × процент) ÷ 100\n\nНапример: 20% от 500 = (500 × 20) ÷ 100 = 100\n\nУкажите конкретные числа, и я решу.';
      }
      return 'Опишите задачу подробнее: математическая, физическая, химическая? Укажите условие и что нужно найти.';
    }
    
    // Помощь и возможности
    if (lowerMsg.includes('помощь') || lowerMsg.includes('что ты умеешь')) {
      return 'Я умею:\n\n✓ Писать доклады, эссе, тексты\n✓ Объяснять теории и концепции\n✓ Давать определения терминам\n✓ Решать задачи (математика, физика)\n✓ Вычислять математические выражения\n✓ Отвечать на общие вопросы\n\nЗадавайте любые вопросы!';
    }
    
    // Благодарности
    if (lowerMsg.includes('спасибо') || lowerMsg.includes('благодарю')) {
      return 'Пожалуйста! Рад был помочь!';
    }
    
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!canSendMessage) {
      toast.error('Достигнут лимит сообщений. Оформите подписку для продолжения.');
      onUpgradeClick();
      return;
    }

    const userQuery = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userQuery,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    onSendMessage();

    // Проверяем быстрые ответы
    const quickResponse = getQuickResponse(userQuery);
    
    if (quickResponse) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: quickResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsProcessing(false);
      }, 500);
      return;
    }

    // Ищем в интернете
    try {
      const response = await fetch(AI_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });

      const data = await response.json();

      let answerText = '';
      if (data.answer) {
        answerText = data.answer;
        if (data.source) {
          answerText += `\n\n📚 Источник: ${data.source}`;
        }
      } else {
        answerText = 'К сожалению, не удалось найти точную информацию. Попробуйте переформулировать вопрос.';
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: answerText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Произошла ошибка при поиске. Проверьте подключение к интернету.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
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
          
          {isProcessing && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white shadow-md border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
                </div>
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
              disabled={isProcessing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!canSendMessage || isProcessing || !inputValue.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>

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