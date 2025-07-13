'use client'
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Contexto para el manejo del estado de los recordatorios y listas
interface Reminder {
  id: string;
  text: string;
  isCompleted: boolean;
  dueDate?: string;
  notes?: string;
  listId: string;
  isFlagged: boolean;
}

interface ReminderList {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // Para los iconos SVG
  color: string;
  count: number; // Para el contador de recordatorios
}

interface AppState {
  lists: ReminderList[];
  reminders: Reminder[];
  selectedListId: string | null;
}

interface RemindersContextType {
  state: AppState;
  addReminder: (text: string, listId: string, notes?: string, dueDate?: string) => void;
  toggleReminderComplete: (reminderId: string) => void;
  addList: (name: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string) => void;
  selectList: (listId: string) => void;
  updateReminderCount: (listId: string, count: number) => void;
  // Puedes añadir más acciones aquí (eliminar, editar, etc.)
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

// Componentes de iconos SVG (simulando lucide-react o similar)
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const FlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// Proveedor de contexto
export const RemindersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Datos iniciales para las listas y recordatorios
    const initialLists: ReminderList[] = [
      { id: 'today', name: 'Today', icon: CalendarIcon, color: 'text-blue-500', count: 0 },
      { id: 'scheduled', name: 'Scheduled', icon: CalendarIcon, color: 'text-red-500', count: 0 },
      { id: 'all', name: 'All', icon: ListIcon, color: 'text-gray-400', count: 0 },
      { id: 'flagged', name: 'FlagIcon', icon: FlagIcon, color: 'text-orange-500', count: 0 },
      { id: 'home', name: 'Home', icon: ListIcon, color: 'text-blue-400', count: 0 },
      { id: 'family', name: 'Family', icon: ListIcon, color: 'text-green-400', count: 0 },
    ];

    const initialReminders: Reminder[] = [
      { id: '1', text: 'Comprar leche', isCompleted: false, listId: 'home', isFlagged: false },
      { id: '2', text: 'Llamar a mamá', isCompleted: true, listId: 'family', isFlagged: false },
      { id: '3', text: 'Estudiar Next.js', isCompleted: false, listId: 'home', isFlagged: true },
      { id: '4', text: 'Pagar facturas', isCompleted: false, listId: 'today', isFlagged: false, dueDate: new Date().toISOString().split('T')[0] },
      { id: '5', text: 'Reunión de equipo', isCompleted: false, listId: 'scheduled', isFlagged: false, dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] }, // 2 días después
    ];

    // Calcular los contadores iniciales
    const calculatedLists = initialLists.map(list => {
      if (list.id === 'all') {
        return { ...list, count: initialReminders.length };
      }
      if (list.id === 'today') {
        const today = new Date().toISOString().split('T')[0];
        return { ...list, count: initialReminders.filter(r => r.dueDate === today && !r.isCompleted).length };
      }
      if (list.id === 'scheduled') {
        const today = new Date().toISOString().split('T')[0];
        return { ...list, count: initialReminders.filter(r => r.dueDate && r.dueDate > today && !r.isCompleted).length };
      }
      if (list.id === 'flagged') {
        return { ...list, count: initialReminders.filter(r => r.isFlagged && !r.isCompleted).length };
      }
      return { ...list, count: initialReminders.filter(r => r.listId === list.id && !r.isCompleted).length };
    });

    return {
      lists: calculatedLists,
      reminders: initialReminders,
      selectedListId: 'all', // Lista seleccionada por defecto
    };
  });

  // Función para actualizar los contadores de las listas
  const updateReminderCounts = (currentReminders: Reminder[]) => {
    setState(prevState => {
      const updatedLists = prevState.lists.map(list => {
        let count = 0;
        if (list.id === 'all') {
          count = currentReminders.filter(r => !r.isCompleted).length;
        } else if (list.id === 'today') {
          const today = new Date().toISOString().split('T')[0];
          count = currentReminders.filter(r => r.dueDate === today && !r.isCompleted).length;
        } else if (list.id === 'scheduled') {
          const today = new Date().toISOString().split('T')[0];
          count = currentReminders.filter(r => r.dueDate && r.dueDate > today && !r.isCompleted).length;
        } else if (list.id === 'flagged') {
          count = currentReminders.filter(r => r.isFlagged && !r.isCompleted).length;
        } else {
          count = currentReminders.filter(r => r.listId === list.id && !r.isCompleted).length;
        }
        return { ...list, count };
      });
      return { ...prevState, lists: updatedLists };
    });
  };

  // Efecto para recalcular los contadores cuando los recordatorios cambian
  useEffect(() => {
    updateReminderCounts(state.reminders);
  }, [state.reminders]);


  const addReminder = (text: string, listId: string, notes?: string, dueDate?: string) => {
    const newReminder: Reminder = {
      id: String(Date.now()), // ID simple basado en el tiempo
      text,
      isCompleted: false,
      listId,
      notes,
      dueDate,
      isFlagged: false,
    };
    setState(prevState => ({
      ...prevState,
      reminders: [...prevState.reminders, newReminder],
    }));
  };

  const toggleReminderComplete = (reminderId: string) => {
    setState(prevState => ({
      ...prevState,
      reminders: prevState.reminders.map(r =>
        r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
      ),
    }));
  };

  const addList = (name: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string) => {
    const newList: ReminderList = {
      id: String(Date.now()),
      name,
      icon,
      color,
      count: 0, // Nueva lista empieza con 0 recordatorios
    };
    setState(prevState => ({
      ...prevState,
      lists: [...prevState.lists, newList],
    }));
  };

  const selectList = (listId: string) => {
    setState(prevState => ({
      ...prevState,
      selectedListId: listId,
    }));
  };

  const updateReminderCount = (listId: string, count: number) => {
    setState(prevState => ({
      ...prevState,
      lists: prevState.lists.map(list =>
        list.id === listId ? { ...list, count } : list
      ),
    }));
  };

  return (
    <RemindersContext.Provider value={{
      state,
      addReminder,
      toggleReminderComplete,
      addList,
      selectList,
      updateReminderCount
    }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};

// Componente para una categoría de la barra lateral (Today, Scheduled, All, Flagged)
interface SidebarCategoryProps {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  count: number;
}

const SidebarCategory: React.FC<SidebarCategoryProps> = ({ id, name, icon: Icon, color, count }) => {
  const { selectList, state } = useReminders();
  const isSelected = state.selectedListId === id;

  return (
    <div
      className={`flex flex-col justify-between p-4 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
      onClick={() => selectList(id)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className={`p-2 rounded-full ${isSelected ? 'bg-white bg-opacity-20' : `bg-gray-600`}`}>
          <Icon className={`h-6 w-6 ${color} ${isSelected ? 'text-white' : ''}`} />
        </div>
        <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>{count}</span>
      </div>
      <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>{name}</span>
    </div>
  );
};

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
  const { state, addList, selectList } = useReminders();
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
      <script src="https://cdn.tailwindcss.com"></script>
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
