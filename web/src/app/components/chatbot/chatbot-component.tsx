'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChatbot } from '@/lib/services/chatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChatbot } from '@/lib/contexts/chatbotContext';

const ChatbotComponent = () => {
  const { messages, addMessage, clearMessages } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const suggestedQuestions = [
    'Tôi cần tìm số lượng có sẵn của danh sách thiết bị sau',
    'Cho tôi biết ai đang mượn thiết bị này',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    addMessage(inputValue);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const htmlResponse = await sendMessageToChatbot(messageToSend);
      console.log('Chatbot response (HTML):', htmlResponse);
      addMessage(htmlResponse);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || 'Đã xảy ra lỗi khi gửi tin nhắn',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedClick = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử trò chuyện?')) {
      clearMessages();
      toast({
        title: 'Đã xóa lịch sử',
        description: 'Lịch sử trò chuyện đã được xóa',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Chatbot AI</h1>
        <p className='text-muted-foreground mt-1'>Trợ lý AI hỗ trợ quản lý thiết bị</p>
      </div>

      <div className='max-w-7xl mx-auto'>
        <Card className='glass-card flex flex-col'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Trò chuyện</CardTitle>
              {messages.length > 0 && (
                <Button variant='ghost' size='sm' onClick={handleClearHistory}>
                  Xóa lịch sử
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className='flex flex-col'>
            <div className='h-[500px] overflow-y-auto space-y-4 mb-4 pr-2'>
              {messages.length === 0 && (
                <div className='flex flex-col items-center justify-center space-y-6 py-12'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse'></div>
                    <div className='relative bg-primary/10 p-6 rounded-full'>
                      <Bot className='w-12 h-12 text-primary' />
                    </div>
                  </div>

                  <div className='text-center space-y-2'>
                    <h3 className='text-xl font-semibold flex items-center justify-center gap-2'>
                      <Sparkles className='w-5 h-5 text-primary' />
                      Chào bạn, tôi có thể giúp gì cho bạn?
                    </h3>
                    <p className='text-muted-foreground text-sm'>Chọn một câu hỏi gợi ý hoặc nhập câu hỏi của bạn</p>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl'>
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        className='h-auto py-4 px-4 text-left justify-start whitespace-normal glass-button'
                        onClick={() => handleSuggestedClick(question)}
                      >
                        <span className='text-sm'>{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message: string, index: number) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      index % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {index % 2 === 0 ? (
                      <p className='whitespace-pre-wrap'>{message}</p>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: message }}
                        className='prose prose-sm dark:prose-invert max-w-none'
                      />
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-muted rounded-lg px-4 py-3'>
                    <div className='flex space-x-2'>
                      <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'></div>
                      <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]'></div>
                      <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]'></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className='flex gap-2'>
              <Input
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Nhập tin nhắn...'
                disabled={isLoading}
                className='flex-1'
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotComponent;
