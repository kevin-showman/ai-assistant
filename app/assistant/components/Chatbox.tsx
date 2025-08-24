'use client'
import React, { useState } from 'react';
import { AzureEntity } from '../_types/AzureEntity';
import { Message } from '../_types/Message';
import { useReminders } from '../_hook/useReminders';

const getEntities = (category: string, entities: AzureEntity[]) => {
  return entities
    .filter((e) => e.category === category)
    .map((e) => e.text);
};

const WRITING = 'Typing...';

const GREETING = 'Hi, I’m your personal reminder assistant. How can I help you?';
const AZURE_ERROR_02 = "Error sending message to Azure:";
const AZURE_ERROR_03 = "There was a problem connecting to the model. Please try again.";

const KEY = process.env.NEXT_PUBLIC_KEY;
const APIM = process.env.NEXT_PUBLIC_APIM;
const PROJECT_NAME = "youtask";
const DEPLOYMENT = "youtaskv3";
const TEXT_ELEMENT = "TextElement_V8";
const GREETINGS_02 = "¡Hi! How can help you?";

const ChatBox: React.FC = () => {
    const { state, addReminder, addList } = useReminders();
    const [newReminderText, setNewReminderText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: GREETING, sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageToSend: string = inputMessage) => {
    if (!messageToSend.trim()) return;

    const userMessage: Message = { id: Date.now(), text: messageToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const request = 'https://chatbot-language-ai.cognitiveservices.azure.com/'+process.env.NEXT_PUBLIC_LUIS;
    try {
      const res = await fetch(request, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": KEY ?? "",
          "Apim-Request-Id": APIM ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "Conversation",
          analysisInput: {
            conversationItem: {
              id: "1",
              text: messageToSend,
              modality: "text",
              language: "en",
              participantId: "user"
            }
          },
          parameters: {
            projectName: PROJECT_NAME,
            verbose: true,
            deploymentName: DEPLOYMENT,
            stringIndexType: TEXT_ELEMENT
          }
        })
      });

      const data = await res.json();
      const topIntent = data?.result?.prediction?.topIntent as string;
      const entities = data?.result?.prediction?.entities as AzureEntity[];

      let respuesta = "";
      let taskName = "";
      let relationships = "";
      let role = "";
      let fecha = "";

      console.log(state, "state");

      switch (topIntent) {
        case "say_hi":
          respuesta = GREETINGS_02;
          break;
        case "add_task": {
          taskName = getEntities("task_name", entities).join(", ") ?? "a task";
          relationships = getEntities("relantionship", entities).join(", ") ?? "no relationships";
          role = getEntities("role", entities).join(", ") ?? "personal";
          fecha = getEntities("fecha", entities).join(", ") ?? "undefined date";
          const responseRelationships = relationships === "no relationships" ? "" : ` and the relationships: ${relationships}`;

          respuesta = `Sure. I'll add the task "${taskName}" under the role "${role}", date "${fecha}"${responseRelationships}.`;
          break;
        }
        default:
          respuesta = `I detect the intent: ${topIntent},
but I'm not sure what you want to do. Can you explain a little more?`;
      }

      const botMessage: Message = { id: Date.now() + 1, text: respuesta, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

      setNewReminderText(taskName);
      addReminder(newReminderText, "family");

    } catch (ex) {
      console.error(AZURE_ERROR_02, ex);
      const errorMessage: Message = { id: Date.now() + 1, text: AZURE_ERROR_03, sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 bg-gray-900 p-8 h-screen overflow-y-auto rounded-r-xl flex flex-col">
      <h1 className="text-white text-4xl font-bold mb-6">Chat AI</h1>

      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800 rounded-lg">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="p-3 rounded-lg bg-gray-700 text-gray-200">
              {WRITING}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-700 text-white rounded-full py-3 px-6 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage()}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors duration-200 disabled:bg-gray-500"
          disabled={isLoading || !inputMessage.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
