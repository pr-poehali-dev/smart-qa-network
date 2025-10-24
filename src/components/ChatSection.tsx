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

const ChatSection = ({ user, canSendMessage, onSendMessage, messageLimit, onUpgradeClick }: ChatSectionProps) => {
  const getWelcomeMessage = () => {
    if (user.role === 'admin') {
      return 'Добро пожаловать, Администратор! У вас полный безлимитный доступ. Задавайте любые вопросы!';
    }
    if (user.hasPro) {
      return 'Добро пожаловать, PRO пользователь! У вас безлимитный доступ к AI. Задавайте вопросы без ограничений.';
    }
    if (user.role === 'user') {
      return 'Добро пожаловать! У вас есть 5 бесплатных запросов. Для безлимитного доступа получите PRO подписку в разделе "Подписка".';
    }
    return 'Привет! Я AI-ассистент. Могу ответить на любые вопросы! У вас 5 бесплатных запросов.';
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

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('привет') || lowerMsg.includes('здравствуй')) {
      return 'Здравствуйте! Чем могу помочь?';
    }
    
    if (lowerMsg.match(/\d+\s*[+]\s*\d+/)) {
      try {
        const result = eval(userMessage.replace(/[^0-9+\-*/().\s]/g, ''));
        return `Ответ: ${result}`;
      } catch {
        return 'Не могу вычислить. Попробуйте другой формат.';
      }
    }
    
    if (lowerMsg.includes('как дела') || lowerMsg.includes('что нового')) {
      return 'Всё отлично, спасибо! Чем могу помочь?';
    }
    
    if (lowerMsg.includes('помощь') || lowerMsg.includes('что ты умеешь')) {
      return 'Я могу отвечать на вопросы и выполнять простые вычисления. Например, попробуйте: 2+2, 10*5, 100/4';
    }
    
    if (lowerMsg.includes('спасибо') || lowerMsg.includes('благодарю')) {
      return 'Пожалуйста! Обращайтесь!';
    }
    
    const responses = [
      `Понял ваш вопрос про "${userMessage}". Могу помочь с вычислениями или ответить на общие вопросы.`,
      `Получил запрос: "${userMessage}". Для математических операций используйте формат: 2+2, для других вопросов уточните детали.`,
      `"${userMessage}" - интересный вопрос! Уточните, что именно вас интересует?`
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