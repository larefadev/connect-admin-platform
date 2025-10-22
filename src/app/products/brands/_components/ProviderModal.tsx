import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, Building2, MapPin, User, Mail, Phone } from 'lucide-react';
import { Provider, CreateProviderData, UpdateProviderData } from '@/core/providers';
import { GooglePlacesAutocomplete, PlaceResult } from '@/ui/components/common/google-places-autocomplete';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: Provider | null;
  onSave: (data: CreateProviderData | UpdateProviderData) => Promise<boolean>;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  direction: string;
  city: string;
  state: string;
  postal_code: string;
  representative: string;
  phone: string;
  email: string;
  inventory_reading: string;
  warranty: string;
}

interface ExtractedAddressInfo {
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export function ProviderModal({
  isOpen,
  onClose,
  provider,
  onSave,
  isLoading = false
}: ProviderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    direction: '',
    city: '',
    state: '',
    postal_code: '',
    representative: '',
    phone: '',
    email: '',
    inventory_reading: '',
    warranty: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!provider;

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        direction: provider.direction || '',
        city: provider.city || '',
        state: provider.state || '',
        postal_code: provider.postal_code || '',
        representative: provider.representative || '',
        phone: provider.phone || '',
        email: provider.email || '',
        inventory_reading: provider.inventory_reading || '',
        warranty: provider.warranty || ''
      });
    } else {
      setFormData({
        name: '',
        direction: '',
        city: '',
        state: '',
        postal_code: '',
        representative: '',
        phone: '',
        email: '',
        inventory_reading: '',
        warranty: ''
      });
    }
    setErrors({});
  }, [provider, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key, 
          value.trim() || null
        ])
      );

      let success = false;
      
      if (isEditing && provider?.id) {
        success = await onSave({
          id: provider.id,
          ...cleanData
        } as UpdateProviderData);
      } else {
        success = await onSave(cleanData as CreateProviderData);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Extraer información de la dirección desde Google Places
  const extractAddressInfo = (place: PlaceResult): ExtractedAddressInfo => {
    const info: ExtractedAddressInfo = {};
    
    if (place.address_components) {
      place.address_components.forEach((component: { long_name: string; short_name: string; types: string[] }) => {
        const types = component.types;
        
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          info.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          info.state = component.long_name;
        } else if (types.includes('postal_code')) {
          info.postal_code = component.long_name;
        } else if (types.includes('country')) {
          info.country = component.long_name;
        }
      });
    }
    
    return info;
  };

  // Manejar cambio de dirección con autocompletado
  const handleAddressChange = (address: string, placeDetails?: PlaceResult) => {
    setFormData(prev => ({ ...prev, direction: address }));
    
    // Si hay detalles del lugar, extraer información adicional
    if (placeDetails) {
      const addressInfo = extractAddressInfo(placeDetails);
      
      setFormData(prev => ({
        ...prev,
        direction: address,
        city: addressInfo.city || prev.city,
        state: addressInfo.state || prev.state,
        postal_code: addressInfo.postal_code || prev.postal_code
      }));
    }
    
    // Limpiar errores relacionados con la dirección
    if (errors.direction) {
      setErrors(prev => ({ ...prev, direction: undefined }));
    }
    if (errors.city && placeDetails) {
      setErrors(prev => ({ ...prev, city: undefined }));
    }
    if (errors.state && placeDetails) {
      setErrors(prev => ({ ...prev, state: undefined }));
    }
    if (errors.postal_code && placeDetails) {
      setErrors(prev => ({ ...prev, postal_code: undefined }));
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {isEditing ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {isEditing ? 'Modificar información del proveedor' : 'Completar la información del nuevo proveedor'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información Básica */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Información Básica
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Proveedor *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ingresa el nombre del proveedor"
                          disabled={isSaving}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-2" />
                          Representante
                        </label>
                        <input
                          type="text"
                          value={formData.representative}
                          onChange={(e) => handleInputChange('representative', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del representante"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Información de Contacto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="correo@proveedor.com"
                          disabled={isSaving}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="h-4 w-4 inline mr-2" />
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(55) 1234-5678"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Dirección
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección Completa
                        </label>
                        <div className="border border-gray-300 rounded-lg">
                          <GooglePlacesAutocomplete
                            value={formData.direction}
                            onChange={handleAddressChange}
                            placeholder="Comienza a escribir la dirección..."
                            disabled={isSaving}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          💡 Tip: Usa el autocompletado para llenar automáticamente ciudad, estado y código postal
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ciudad (se llena automáticamente)"
                            disabled={isSaving}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Estado (se llena automáticamente)"
                            disabled={isSaving}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Código Postal
                          </label>
                          <input
                            type="text"
                            value={formData.postal_code}
                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="12345 (se llena automáticamente)"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Información Adicional
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lectura de Inventario
                        </label>
                        <input
                          type="text"
                          value={formData.inventory_reading}
                          onChange={(e) => handleInputChange('inventory_reading', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Información de inventario"
                          disabled={isSaving}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Garantía
                        </label>
                        <input
                          type="text"
                          value={formData.warranty}
                          onChange={(e) => handleInputChange('warranty', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Información de garantía"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onClose}
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Proveedor')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
