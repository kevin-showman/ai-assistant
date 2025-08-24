'use client'
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { RemindersContextType } from "../_types/RemindersContextType";
import { AppState } from "../_types/AppState";
import { ReminderList } from "../_types/ReminderList";
import { CalendarIcon } from "../_icons/CalendarIcon";
import { ListIcon } from "../_icons/ListIcon";
import { FlagIcon } from "../_icons/FlagIcon";
import { Reminder } from "../_types/Reminder";

export const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

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

    const initialReminders: Reminder[] = [];

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
