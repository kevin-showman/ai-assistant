'use client'
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Reminder } from './_types/Reminder';
import { ReminderList } from './_types/ReminderList';
import { AppState } from './_types/AppState';
import { CalendarIcon } from './_icons/CalendarIcon';
import { ListIcon } from './_icons/ListIcon';
import { FlagIcon } from './_icons/FlagIcon';
import { SearchIcon } from './_icons/SearchIcon';
import { PlusIcon } from './_icons/Plus';
import { InfoIcon } from './_icons/InfoIcon';
import { RemindersContextType } from './_types/RemindersContextType';
import { useReminders } from './_hook/useReminders';
import { RemindersProvider } from './_context/RemindersContext';
import { SidebarCategoryProps } from './_types/SidebarCategoryProps';
import { SidebarCategory } from './components/SidebarCategory';


// Componente para una lista personalizada en la barra lateral (Home, Family)
interface SidebarListItemProps {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  count: number;
}

const SidebarListItem: React.FC<SidebarListItemProps> = ({ id, name, icon: Icon, color, count }) => {
  const { selectList, state } = useReminders();
  const isSelected = state.selectedListId === id;

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
      onClick={() => selectList(id)}
    >
      <div className="flex items-center">
        <Icon className={`h-5 w-5 mr-2 ${color}`} />
        <span className={`text-white ${isSelected ? 'font-semibold' : ''}`}>{name}</span>
      </div>
      <span className="text-gray-400">{count}</span>
    </div>
  );
};

// Componente de la barra lateral
const Sidebar: React.FC = () => {
  const { state, addList } = useReminders();
  const categories = state.lists.filter(list => ['today', 'scheduled', 'all', 'flagged'].includes(list.id));
  const myLists = state.lists.filter(list => !['today', 'scheduled', 'all', 'flagged'].includes(list.id));

  const handleAddList = () => {
    const newListName = prompt("Enter new list name:");
    if (newListName) {
      addList(newListName, ListIcon, 'text-gray-400'); // Icono y color por defecto, se podría mejorar
    }
  };

  return (
    <aside className="w-80 bg-gray-800 p-4 h-screen overflow-y-auto flex flex-col rounded-l-xl">
      {/* Barra de búsqueda */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-gray-700 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {categories.map(cat => (
          <SidebarCategory
            key={cat.id}
            id={cat.id}
            name={cat.name === 'FlagIcon' ? 'Flagged' : cat.name} // Ajuste para el nombre del icono
            icon={cat.icon}
            color={cat.color}
            count={cat.count}
          />
        ))}
      </div>

      {/* Mis Listas */}
      <div className="mb-8 flex-grow">
        <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">My Lists</h3>
        {myLists.map(list => (
          <SidebarListItem
            key={list.id}
            id={list.id}
            name={list.name}
            icon={list.icon}
            color={list.color}
            count={list.count}
          />
        ))}
      </div>

      {/* Botón Añadir Lista */}
      <button
        className="text-blue-500 flex items-center self-start py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        onClick={handleAddList}
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Add List
      </button>
    </aside>
  );
};

// Componente para un elemento de recordatorio
interface ReminderItemProps {
  reminder: Reminder;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder }) => {
  const { toggleReminderComplete } = useReminders();

  const handleCheckboxChange = () => {
    toggleReminderComplete(reminder.id);
  };

  return (
    <div className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 cursor-pointer">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-500 rounded-full border-gray-600 bg-gray-700 focus:ring-blue-500 mr-3"
        checked={reminder.isCompleted}
        onChange={handleCheckboxChange}
      />
      <span className={`flex-1 text-white text-lg ${reminder.isCompleted ? 'line-through text-gray-500' : ''}`}>
        {reminder.text}
      </span>
      {reminder.isFlagged && (
        <FlagIcon className="h-5 w-5 text-orange-500 ml-2" />
      )}
      <button className="ml-2 text-gray-400 hover:text-white">
        <InfoIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

// Componente del contenido principal
const MainContent: React.FC = () => {
  const { state, addReminder } = useReminders();
  const [newReminderText, setNewReminderText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Obtener la lista seleccionada
  const selectedList = state.lists.find(list => list.id === state.selectedListId);
  const listName = selectedList ? selectedList.name : 'All';

  // Filtrar recordatorios según la lista seleccionada
  const filteredReminders = state.reminders.filter(reminder => {
    if (state.selectedListId === 'all') return true;
    if (state.selectedListId === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return reminder.dueDate === today;
    }
    if (state.selectedListId === 'scheduled') {
      const today = new Date().toISOString().split('T')[0];
      return reminder.dueDate && reminder.dueDate > today;
    }
    if (state.selectedListId === 'flagged') {
      return reminder.isFlagged;
    }
    return reminder.listId === state.selectedListId;
  });

  const completedReminders = filteredReminders.filter(r => r.isCompleted);
  const incompleteReminders = filteredReminders.filter(r => !r.isCompleted);

  const handleAddReminder = () => {
    if (newReminderText.trim() && state.selectedListId) {
      // Si la lista seleccionada es una categoría especial, añadirla a una lista por defecto o la primera lista personalizada
      const targetListId = ['all', 'today', 'scheduled', 'flagged'].includes(state.selectedListId)
        ? state.lists.find(l => !['all', 'today', 'scheduled', 'flagged'].includes(l.id))?.id || 'home' // Fallback a 'home' o la primera lista real
        : state.selectedListId;
      addReminder(newReminderText, targetListId);
      setNewReminderText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddReminder();
    }
  };

  return (
    <main className="flex-1 bg-gray-900 p-8 h-screen overflow-y-auto rounded-r-xl">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-4xl font-bold">{listName}</h1>
        <button className="text-blue-500 text-lg font-semibold flex items-center">
          <PlusIcon className="h-6 w-6 mr-1" />
          New Reminder
        </button>
      </div>

      {/* Sección de completados */}
      {completedReminders.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-sm">{completedReminders.length} Completed</span>
            <button
              className="text-blue-500 text-sm hover:underline"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Hide' : 'Show'}
            </button>
          </div>
          {showCompleted && (
            <div className="bg-gray-800 rounded-lg p-2">
              {completedReminders.map(reminder => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sección de recordatorios incompletos */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        {/* Input para añadir nuevo recordatorio */}
        <div className="flex items-center mb-4">
          <PlusIcon className="h-5 w-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="New Reminder"
            className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-500"
            value={newReminderText}
            onChange={(e) => setNewReminderText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="text-blue-500 text-sm py-1 px-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
            Add Date
          </button>
        </div>
        {incompleteReminders.map(reminder => (
          <ReminderItem key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </main>
  );
};

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
      {/* Tailwind CSS CDN para que funcione en el entorno de vista previa */}
    
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          /* Estilos para el checkbox para que se vea más como el de Apple */
          input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            background-color: #4a5568; /* bg-gray-700 */
            margin: 0;
            font: inherit;
            color: currentColor;
            width: 1.15em;
            height: 1.15em;
            border: 0.15em solid #4a5568; /* border-gray-600 */
            border-radius: 50%; /* Make it circular */
            transform: translateY(-0.075em);
            display: grid;
            place-content: center;
            cursor: pointer;
          }

          input[type="checkbox"]::before {
            content: "";
            width: 0.65em;
            height: 0.65em;
            clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 60%);
            transform: scale(0);
            transform-origin: bottom left;
            transition: transform 120ms ease-in-out;
            background-color: #fff; /* Checkmark color */
          }

          input[type="checkbox"]:checked {
            background-color: #3b82f6; /* bg-blue-500 */
            border-color: #3b82f6; /* border-blue-500 */
          }

          input[type="checkbox"]:checked::before {
            transform: scale(1);
          }
        `}
      </style>
    </RemindersProvider>
  );
}
