import React, { useEffect, useRef, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, details?: PlaceResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface PlaceResult {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
  geometry?: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
  name?: string;
}

export interface GoogleAutocomplete {
  getPlace(): PlaceResult;
  addListener(event: string, callback: () => void): void;
}

export interface GoogleMaps {
  maps: {
    places: {
      Autocomplete: new (input: HTMLInputElement, options: Record<string, unknown>) => GoogleAutocomplete;
    };
    event: {
      clearInstanceListeners: (autocomplete: GoogleAutocomplete) => void;
    };
  };
}

declare global {
  interface Window {
    google: GoogleMaps;
    initGooglePlaces?: () => void;
  }
}



export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu dirección...",
  disabled = false,
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    const initAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        // Configurar el autocomplete con restricciones para México
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'mx' }, // Restringir a México
          fields: ['address_components', 'formatted_address', 'geometry', 'name'],
          types: ['address'] // Solo direcciones
        }) as GoogleAutocomplete;

        // Escuchar cuando se selecciona un lugar
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.formatted_address) {
            onChange(place.formatted_address, place);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
        setError('Error al inicializar el autocompletado');
        setIsLoading(false);
      }
    };
    
    // Verificar si Google Maps ya está cargado
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Verificar si el script ya está siendo cargado
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        initAutocomplete();
      });
      return;
    }

    // Cargar el script de Google Places
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=es&region=MX`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initAutocomplete();
    };
    
    script.onerror = () => {
      setError('Error al cargar Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Limpiar el autocomplete cuando se desmonte el componente
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (error) {
    return (
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex h-10 w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        />
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={isLoading ? "Cargando..." : placeholder}
        disabled={disabled || isLoading}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      <p className="mt-1 text-xs text-gray-500 hidden sm:block">
        Comienza a escribir tu dirección y selecciona de las opciones
      </p>
    </div>
  );
};
