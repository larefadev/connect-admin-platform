"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Option[];
  allOption?: Option;
  maxHeight?: number;
  searchPlaceholder?: string;
  maxVisibleOptions?: number;
  className?: string;
}

export const SearchableSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  allOption,
  maxHeight = 200,
  searchPlaceholder = "Buscar...",
  maxVisibleOptions = 100,
  className = ""
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce para el término de búsqueda
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150); // 150ms de debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Filtrar opciones basado en el término de búsqueda con debounce
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [options, debouncedSearchTerm]);

  // Combinar opción "todas" con opciones filtradas y limitar cantidad
  const displayOptions = useMemo(() => {
    let optionsToShow = filteredOptions;
    
    // Limitar el número de opciones mostradas para mejorar el rendimiento
    if (optionsToShow.length > maxVisibleOptions) {
      optionsToShow = optionsToShow.slice(0, maxVisibleOptions);
    }
    
    if (allOption) {
      return [allOption, ...optionsToShow];
    }
    return optionsToShow;
  }, [filteredOptions, allOption, maxVisibleOptions]);

  // Encontrar la opción seleccionada
  const selectedOption = useMemo(() => {
    return displayOptions.find(option => option.value === value);
  }, [displayOptions, value]);

  // Manejar selección
  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  // Manejar teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < displayOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : displayOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
          handleSelect(displayOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        setOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll al elemento destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [highlightedIndex]);

  // Focus en el input de búsqueda cuando se abre
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Limpiar búsqueda cuando se cierra
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  }, [open]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full h-12 justify-between bg-white border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-md px-4", className)}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {/* Input de búsqueda */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                className="pl-8 pr-8 h-8 text-sm"
                onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Lista de opciones */}
          <div
            ref={listRef}
            className="overflow-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {displayOptions.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">
                No se encontraron resultados
              </div>
            ) : (
              displayOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors",
                    index === highlightedIndex && "bg-gray-100",
                    option.value === value && "bg-red-50 text-red-600",
                    "hover:bg-gray-50"
                  )}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-red-600" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Información de resultados */}
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
              {filteredOptions.length} resultado{filteredOptions.length !== 1 ? 's' : ''} encontrado{filteredOptions.length !== 1 ? 's' : ''}
              {filteredOptions.length > maxVisibleOptions && (
                <span className="ml-1 text-orange-600">
                  (mostrando los primeros {maxVisibleOptions})
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
