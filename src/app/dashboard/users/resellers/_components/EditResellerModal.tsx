import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, Mail, Save } from 'lucide-react';
import Image from 'next/image';
import { Person } from '@/core/sellers/interface/Person';

interface EditResellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reseller: Person | null;
  onSave: (reseller: Person, updatedData: Partial<Person>) => Promise<boolean>;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  last_name: string;
  username: string;
  email: string;
  status: boolean;
}

export function EditResellerModal({
  isOpen,
  onClose,
  reseller,
  onSave,
  isLoading: _ = false
}: EditResellerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    last_name: '',
    username: '',
    email: '',
    status: true
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (reseller) {
      setFormData({
        name: reseller.name || '',
        last_name: reseller.last_name || '',
        username: reseller.username || '',
        email: reseller.email || '',
        status: reseller.status
      });
      setErrors({});
    }
  }, [reseller]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reseller || !validateForm()) return;

    setIsSaving(true);
    try {
      const updatedData: Partial<Person> = {
        name: formData.name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        status: formData.status
      };

      const success = await onSave(reseller, updatedData);
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

  if (!reseller) return null;

  const displayName = reseller.name && reseller.last_name 
    ? `${reseller.name} ${reseller.last_name}`.trim()
    : reseller.name || reseller.username;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {reseller.profile_image ? (
                      <Image 
                        className="h-12 w-12 rounded-full object-cover" 
                        src={reseller.profile_image} 
                        alt={`${displayName} profile`}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-700">
                          {reseller.name ? reseller.name.charAt(0).toUpperCase() : reseller.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Editar Revendedor
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Modificar información de {displayName}
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
                  {/* Información Personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el nombre"
                        disabled={isSaving}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.last_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el apellido"
                        disabled={isSaving}
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Username y Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el username"
                        disabled={isSaving}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
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
                        placeholder="Ingresa el email"
                        disabled={isSaving}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>


                  {/* Estado */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isSaving}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Usuario activo
                      </span>
                    </label>
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
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
