'use client'
import React from 'react';
import { RemindersProvider } from './_context/RemindersContext';
import { Sidebar } from './components/Sidebar';
import ChatBox from './components/Chatbox';
// import GPTTaskInterpreter from './components/GPTTaskInterpreter';

export default function App() {
  return (
    <RemindersProvider>
      <div className="min-h-screen bg-gray-900 font-inter">
        {/* Layout responsive */}
        <div className="flex flex-col md:flex-row w-full h-full bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Sidebar con ancho fijo en pantallas medianas y grandes */}
          <div className="w-full md:w-64 lg:w-72 xl:w-80 bg-gray-700">
            <Sidebar />
          </div>

          {/* ChatBox ocupa el resto del espacio */}
          <div className="flex-1">
            <ChatBox />
          </div>

          {/* <GPTTaskInterpreter /> */}
        </div>
      </div>
    </RemindersProvider>
  );
}
