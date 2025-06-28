'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'agent' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const messageText = input.trim();
    console.log('Sending message:', messageText);
    
    // Add user message
    try {
      setMessages(prev => [...(prev || []), { text: messageText, sender: 'user' }]);
      setInput('');
      setLoading(true);

      console.log('Making API call...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      // Handle different response formats from OpenAI Agents SDK
      let responseText = 'No response received';
      if (typeof data?.response === 'string') {
        responseText = data.response;
      } else if (data?.response?.state) {
        // Extract the last message from the agent state
        const state = data.response.state;
        const lastResponse = state.modelResponses?.[state.modelResponses.length - 1];
        responseText = lastResponse?.content || JSON.stringify(data.response, null, 2);
      } else {
        responseText = JSON.stringify(data, null, 2);
      }
      
      setMessages(prev => [...(prev || []), { text: responseText, sender: 'agent' }]);
      
    } catch (error: unknown) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessages(prev => [...(prev || []), { text: `Error: ${errorMessage}`, sender: 'agent' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={`message-${index}`}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg bg-white text-gray-800 shadow">
              Agent is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex items-center space-x-2">
        <Input
          className="flex-1"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleSendMessage();
            }
          }}
          disabled={loading}
        />
        <Button onClick={handleSendMessage} disabled={loading}>Send</Button>
      </div>
    </div>
  );
}
