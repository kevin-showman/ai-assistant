'use client'
import React from 'react';
import { RemindersProvider } from './_context/RemindersContext';
import { Sidebar } from './components/Sidebar';
import ChatBox from './components/Chatbox';

// Componente principal de la aplicación
export default function App() {
  return (
    <RemindersProvider>
      <div className="min-h-screen bg-gray-900 flex font-inter">
        {/* Contenedor principal con bordes redondeados */}
        <div className="flex w-full max-w-6xl mx-auto my-8 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <Sidebar />
          <ChatBox />
        </div>
      </div>
      
    </RemindersProvider>
  );
}
