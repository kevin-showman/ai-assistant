'use client'
import React from 'react';
import { RemindersProvider } from './_context/RemindersContext';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';

// Componente principal de la aplicación
export default function App() {
  return (
    <RemindersProvider>
      <div className="min-h-screen bg-gray-900 flex font-inter">
        {/* Contenedor principal con bordes redondeados */}
        <div className="flex w-full max-w-6xl mx-auto my-8 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
      
    </RemindersProvider>
  );
}
