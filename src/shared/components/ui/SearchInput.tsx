"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, Clock, TrendingUp, ShoppingCart, FileText } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  sku: string;
  name: string;
  brand?: string;
  price?: number;
  image?: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  searchHistory?: string[];
  onClearHistory?: () => void;
  className?: string;
  showSuggestions?: boolean;
  onAddToCart?: (suggestion: SearchSuggestion) => void;
  onAddToQuote?: (suggestion: SearchSuggestion) => void;
}

export const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar productos por nombre, SKU o descripción...",
  suggestions = [],
  isLoading = false,
  searchHistory = [],
  onClearHistory,
  className,
  showSuggestions = true,
  onAddToCart,
  onAddToQuote,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    const totalItems = suggestions.length + (searchHistory.length > 0 ? searchHistory.length : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < searchHistory.length) {
            // Seleccionó del historial
            const historyItem = searchHistory[selectedIndex];
            onChange(historyItem);
            onSearch?.(historyItem);
          } else {
            // Seleccionó de las sugerencias
            const suggestionIndex = selectedIndex - searchHistory.length;
            const suggestion = suggestions[suggestionIndex];
            if (suggestion) {
              onChange(suggestion.name);
              onSearch?.(suggestion.name);
            }
          }
          setIsFocused(false);
        } else {
          onSearch?.(value);
          setIsFocused(false);
        }
        break;
      case "Escape":
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Limpiar búsqueda
  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
    setSelectedIndex(-1);
  };

  // Seleccionar sugerencia
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.name);
    onSearch?.(suggestion.name);
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  // Seleccionar del historial
  const handleSelectHistory = (term: string) => {
    onChange(term);
    onSearch?.(term);
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  // Resaltar término de búsqueda
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const showDropdown = isFocused && showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || value.length > 0);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-10 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-l-lg rounded-r-none"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={() => onSearch?.(value)}
        className="absolute right-0 top-0 h-12 px-4 bg-gray-800 text-white rounded-r-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
        aria-label="Buscar"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Dropdown con sugerencias */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Historial de búsqueda */}
          {searchHistory.length > 0 && value.length === 0 && (
            <div className="border-b border-gray-100">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                  <Clock className="w-4 h-4" />
                  <span>Búsquedas recientes</span>
                </div>
                {onClearHistory && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              {searchHistory.map((term, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleSelectHistory(term)}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2",
                    selectedIndex === index && "bg-gray-100"
                  )}
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Sugerencias de productos */}
          {suggestions.length > 0 && (
            <div>
              {value.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                    <TrendingUp className="w-4 h-4" />
                    <span>Productos sugeridos ({suggestions.length})</span>
                  </div>
                </div>
              )}
              {suggestions.slice(0, 8).map((suggestion, index) => {
                const globalIndex = searchHistory.length + index;
                return (
                  <div
                    key={suggestion.sku}
                    className={cn(
                      "w-full px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0",
                      selectedIndex === globalIndex && "bg-gray-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {suggestion.image && !imageErrors.has(suggestion.image) ? (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={suggestion.image}
                            alt={suggestion.name}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors((prev) => new Set(prev).add(suggestion.image!));
                            }}
                          />
                        </div>
                      ) : suggestion.image && imageErrors.has(suggestion.image) ? (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full text-left"
                        >
                          <div className="text-sm font-medium text-gray-900 truncate hover:text-red-600 transition-colors">
                            {highlightText(suggestion.name, value)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {suggestion.brand && (
                              <span className="text-xs text-gray-500">{suggestion.brand}</span>
                            )}
                            <span className="text-xs text-gray-400">SKU: {suggestion.sku}</span>
                          </div>
                        </button>
                      </div>
                      
                      {/* Precio y botones de acción */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        {suggestion.price !== undefined && (
                          <div className="text-sm font-semibold text-red-600 whitespace-nowrap">
                            ${suggestion.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                        {(onAddToCart || onAddToQuote) && (
                          <div className="flex gap-1">
                            {onAddToCart && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 h-7 px-2 border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(suggestion);
                                }}
                                title="Agregar al carrito"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {onAddToQuote && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 h-7 px-2 border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToQuote(suggestion);
                                }}
                                title="Agregar a cotización"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sin resultados */}
          {value.length > 0 && suggestions.length === 0 && !isLoading && (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm font-medium">No se encontraron productos</p>
              <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
