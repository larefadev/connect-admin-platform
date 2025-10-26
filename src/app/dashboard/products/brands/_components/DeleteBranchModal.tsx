import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, X, Star } from 'lucide-react';
import { ProviderBranch } from '@/core/providers';

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: ProviderBranch | null;
  onConfirm: (branchId: number) => Promise<boolean>;
  isLoading?: boolean;
}

export function DeleteBranchModal({
  isOpen,
  onClose,
  branch,
  onConfirm,
  isLoading = false
}: DeleteBranchModalProps) {
  if (!branch) return null;

  const handleConfirm = async () => {
    if (branch.id) {
      const success = await onConfirm(branch.id);
      if (success) {
        onClose();
      }
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Eliminar Sucursal
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar la sucursal{' '}
                          <span className="font-medium text-gray-900">
                            {branch.branch_name}
                          </span>
                          ? Esta acción no se puede deshacer y se perderán todos los datos asociados.
                        </p>
                        
                        {branch.is_main_branch && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-600 mr-2" />
                              <p className="text-sm text-yellow-800 font-medium">
                                ¡Atención! Esta es la sucursal principal
                              </p>
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">
                              Al eliminarla, ninguna sucursal será marcada como principal.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nombre:</span>
                      <span className="font-medium text-gray-900 flex items-center">
                        {branch.branch_name}
                        {branch.is_main_branch && (
                          <Star className="h-3 w-3 text-yellow-500 ml-1" />
                        )}
                      </span>
                    </div>
                    {branch.city && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ciudad:</span>
                        <span className="font-medium text-gray-900">{branch.city}</span>
                      </div>
                    )}
                    {branch.contact_person && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Contacto:</span>
                        <span className="font-medium text-gray-900">{branch.contact_person}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Teléfono:</span>
                        <span className="font-medium text-gray-900">{branch.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estado:</span>
                      <span className={`font-medium ${branch.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {branch.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
