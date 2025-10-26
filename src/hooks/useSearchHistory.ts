import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'admin_search_history';
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Cargar historial desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Error al cargar historial de búsqueda:', error);
    }
  }, []);

  // Agregar término al historial
  const addToHistory = useCallback((term: string) => {
    if (!term || term.trim().length < 2) return;

    const trimmedTerm = term.trim();

    setSearchHistory((prev) => {
      // Eliminar duplicados (mover al inicio si ya existe)
      const filtered = prev.filter((item) => 
        item.toLowerCase() !== trimmedTerm.toLowerCase()
      );

      // Agregar al inicio y limitar a MAX_HISTORY_ITEMS
      const newHistory = [trimmedTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // Guardar en localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error al guardar historial de búsqueda:', error);
      }

      return newHistory;
    });
  }, []);

  // Limpiar historial completo
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error al limpiar historial de búsqueda:', error);
    }
  }, []);

  // Eliminar un término específico del historial
  const removeFromHistory = useCallback((term: string) => {
    setSearchHistory((prev) => {
      const newHistory = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error al actualizar historial de búsqueda:', error);
      }
      return newHistory;
    });
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};
