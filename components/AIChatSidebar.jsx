'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useEditorStore } from '../store/editorStore';

// This will be replaced with the actual webhook URL from n8n
const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

async function sendPrompt(prompt) {
  if (!WEBHOOK_URL) {
    throw new Error('Webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL');
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Expected response format: { html: "...", css: "...", data: {...} }
  return data;
}

export default function AIChatSidebar() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const applyAIResponse = useEditorStore((state) => state.applyAIResponse);

  const mutation = useMutation({
    mutationFn: sendPrompt,
    onSuccess: (data) => {
      // Apply AI response to editor store
      applyAIResponse(data);
      
      // Add success message to chat
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: input },
        { type: 'assistant', content: 'Template actualizado exitosamente! ✨' },
      ]);
      setInput('');
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: input },
        { type: 'error', content: `Error: ${error.message}` },
      ]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;

    if (!WEBHOOK_URL) {
      setMessages((prev) => [
        ...prev,
        { type: 'user', content: input },
        { type: 'error', content: 'Webhook URL no configurada. Por favor configura NEXT_PUBLIC_N8N_WEBHOOK_URL' },
      ]);
      setInput('');
      return;
    }

    mutation.mutate(input);
  };

  return (
    <div className="ai-chat-sidebar">
      <div className="ai-chat-header">
        <h3>AI Assistant</h3>
        <p className="ai-chat-subtitle">Describe tu template y lo generaré por ti</p>
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 && (
          <div className="ai-chat-empty">
            <p>Envía un mensaje para comenzar...</p>
            <p className="ai-chat-example">
              Ejemplo: "Crea un CV moderno con secciones para experiencia, educación y habilidades"
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-chat-message ai-chat-message-${msg.type}`}>
            {msg.type === 'user' && <span className="ai-chat-role">Tú:</span>}
            {msg.type === 'assistant' && <span className="ai-chat-role">AI:</span>}
            {msg.type === 'error' && <span className="ai-chat-role">Error:</span>}
            <span className="ai-chat-content">{msg.content}</span>
          </div>
        ))}
        {mutation.isPending && (
          <div className="ai-chat-message ai-chat-message-assistant">
            <span className="ai-chat-role">AI:</span>
            <span className="ai-chat-content">Generando template...</span>
          </div>
        )}
      </div>

      <form className="ai-chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe el template que quieres crear..."
          disabled={mutation.isPending}
          className="ai-chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || mutation.isPending}
          className="ai-chat-send-btn"
        >
          {mutation.isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

