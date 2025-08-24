'use client'
import React from "react";
import { useReminders } from "../_hook/useReminders";
import { ListIcon } from "../_icons/ListIcon";
import { SidebarCategory } from "./SidebarCategory";
import { PlusIcon } from "../_icons/Plus";
import { SearchIcon } from "../_icons/SearchIcon";
import { SidebarListItem } from "./SidebarItem";
// Componente de la barra lateral
export const Sidebar: React.FC = () => {
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
