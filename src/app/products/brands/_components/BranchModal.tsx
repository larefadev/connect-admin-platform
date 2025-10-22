import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Save, MapPin, User, Mail, Phone, Building2, Star } from 'lucide-react';
import { ProviderBranch, CreateProviderBranchData, UpdateProviderBranchData } from '@/core/providers';
import { GooglePlacesAutocomplete, PlaceResult } from '@/ui/components/common/google-places-autocomplete';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: ProviderBranch | null;
  providerId: bigint;
  onSave: (data: CreateProviderBranchData | UpdateProviderBranchData) => Promise<boolean>;
  isLoading?: boolean;
}

interface FormData {
  branch_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  is_main_branch: boolean;
  is_active: boolean;
  notes: string;
}

interface ExtractedAddressInfo {
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export function BranchModal({
  isOpen,
  onClose,
  branch,
  providerId,
  onSave,
  isLoading = false
}: BranchModalProps) {
  const [formData, setFormData] = useState<FormData>({
    branch_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    is_main_branch: false,
    is_active: true,
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!branch;

  useEffect(() => {
    if (branch) {
      setFormData({
        branch_name: branch.branch_name || '',
        contact_person: branch.contact_person || '',
        phone: branch.phone || '',
        email: branch.email || '',
        address: branch.address || '',
        city: branch.city || '',
        postal_code: branch.postal_code || '',
        is_main_branch: branch.is_main_branch || false,
        is_active: branch.is_active !== undefined ? branch.is_active : true,
        notes: branch.notes || ''
      });
    } else {
      setFormData({
        branch_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        postal_code: '',
        is_main_branch: false,
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [branch, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = 'El nombre de la sucursal es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'El código postal es requerido';
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
          typeof value === 'string' ? (value.trim() || null) : value
        ])
      );

      let success = false;
      
      if (isEditing && branch?.id) {
        success = await onSave({
          id: branch.id,
          provider_id: providerId,
          ...cleanData
        } as UpdateProviderBranchData);
      } else {
        success = await onSave({
          provider_id: providerId,
          ...cleanData
        } as CreateProviderBranchData);
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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
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
      place.address_components.forEach((component: any) => {
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
    setFormData(prev => ({ ...prev, address }));
    
    // Si hay detalles del lugar, extraer información adicional
    if (placeDetails) {
      const addressInfo = extractAddressInfo(placeDetails);
      
      setFormData(prev => ({
        ...prev,
        address,
        city: addressInfo.city || prev.city,
        postal_code: addressInfo.postal_code || prev.postal_code
      }));
    }
    
    // Limpiar errores relacionados con la dirección
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: undefined }));
    }
    if (errors.city && placeDetails) {
      setErrors(prev => ({ ...prev, city: undefined }));
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
                        {isEditing ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {isEditing ? 'Modificar información de la sucursal' : 'Completar la información de la nueva sucursal'}
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
                          Nombre de la Sucursal *
                        </label>
                        <input
                          type="text"
                          value={formData.branch_name}
                          onChange={(e) => handleInputChange('branch_name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.branch_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Sucursal Centro, Matriz, etc."
                          disabled={isSaving}
                        />
                        {errors.branch_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.branch_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-2" />
                          Persona de Contacto
                        </label>
                        <input
                          type="text"
                          value={formData.contact_person}
                          onChange={(e) => handleInputChange('contact_person', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del contacto"
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Configuración de Sucursal */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_main_branch"
                          checked={formData.is_main_branch}
                          onChange={(e) => handleInputChange('is_main_branch', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isSaving}
                        />
                        <label htmlFor="is_main_branch" className="ml-2 block text-sm text-gray-900 flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          Sucursal Principal
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isSaving}
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Sucursal Activa
                        </label>
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
                          <Phone className="h-4 w-4 inline mr-2" />
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="(55) 1234-5678"
                          disabled={isSaving}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>

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
                          placeholder="sucursal@proveedor.com"
                          disabled={isSaving}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
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
                          Dirección Completa *
                        </label>
                        <div className={`border rounded-lg ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}>
                          <GooglePlacesAutocomplete
                            value={formData.address}
                            onChange={handleAddressChange}
                            placeholder="Comienza a escribir la dirección..."
                            disabled={isSaving}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          💡 Tip: Usa el autocompletado para llenar automáticamente ciudad y código postal
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.city ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Ciudad (se llena automáticamente)"
                            disabled={isSaving}
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            value={formData.postal_code}
                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.postal_code ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="12345 (se llena automáticamente)"
                            disabled={isSaving}
                          />
                          {errors.postal_code && (
                            <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notas Adicionales */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Notas Adicionales
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Información adicional sobre la sucursal..."
                        disabled={isSaving}
                      />
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
                      {isSaving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Sucursal')}
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
