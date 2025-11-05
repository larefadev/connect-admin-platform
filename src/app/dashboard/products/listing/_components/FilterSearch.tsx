import React, { useState, useEffect } from "react"
import { Download, Filter, X } from "lucide-react"
import { useCategories,useModels, useMotorizations, useAssemblyPlants } from "@/core/products/application/useCatalog"
import { ProductFilters } from "@/core/products/application/useProducts"
import { brandAutoParts } from "@/app/dashboard/products/helpers/brands"
import { SearchableSelect } from "@/shared/components/ui/SearchableSelect"
import { SearchInput } from "@/shared/components/ui/SearchInput"
import { useDebounce } from "@/hooks/useDebounce"
import { useSearchHistory } from "@/hooks/useSearchHistory"



interface FilterSearchProps {
    searchQuery: string
    setSearchQuery: (value: string) => void
    categoryFilter: string
    setCategoryFilter: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    onFiltersChange: (filters: ProductFilters) => void
    getSearchSuggestions: (searchTerm: string) => Promise<{
        sku: string;
        name: string;
        brand?: string;
        price?: number;
        image?: string;
    }[]>
    onSearch: (searchTerm: string) => void
}



export const FilterSearch = (
    {
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        onFiltersChange,
        getSearchSuggestions: getSuggestionsFromHook,
        onSearch
    }: FilterSearchProps) => {

    const { categories } = useCategories();
    const { models} = useModels();
    const { motorizations, getMotorizations } = useMotorizations();
    const { assemblyPlants } = useAssemblyPlants();
    const [brandFilter, setBrandFilter] = useState('');
    const [brandCodeFilter, setBrandCodeFilter] = useState('');
    const [modelFilter, setModelFilter] = useState('');
    const [motorizationFilter, setMotorizationFilter] = useState('');
    const [assemblyPlantFilter, setAssemblyPlantFilter] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Estados para búsqueda híbrida
    const [searchSuggestions, setSearchSuggestions] = useState<{
        sku: string;
        name: string;
        brand?: string;
        price?: number;
        image?: string;
    }[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [executedSearch, setExecutedSearch] = useState('');
    
    // Hooks de búsqueda
    const debouncedSearchTerm = useDebounce(searchQuery, 300);
    const { searchHistory, addToHistory, clearHistory } = useSearchHistory();

    // Update motorizations when model changes
    useEffect(() => {
        if (modelFilter) {
            const selectedModel = models.find(m => m.model_car === modelFilter);
            if (selectedModel) {
                getMotorizations(selectedModel.id);
            }
        } else {
            getMotorizations();
        }
        setMotorizationFilter('');
    }, [modelFilter, models, getMotorizations]);

    // Aplicar filtros automáticamente para filtros que no sean de búsqueda
    useEffect(() => {
        const filters: ProductFilters = {
            search: executedSearch || undefined, // Usar executedSearch en lugar de searchQuery
            category: categoryFilter || undefined,
            brand: brandFilter || undefined,
            brand_code: brandCodeFilter || undefined,
            model: modelFilter || undefined,
            motorization: motorizationFilter || undefined,
            assembly_plant: assemblyPlantFilter || undefined,
            status: statusFilter || undefined,
            limit: 100
        };

        onFiltersChange(filters);
    }, [
        executedSearch, categoryFilter, brandFilter, brandCodeFilter, 
        modelFilter, motorizationFilter, assemblyPlantFilter, statusFilter
    ]);

    // Effect para obtener sugerencias cuando cambie el término de búsqueda (con debounce)
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearchTerm.trim().length >= 2) {
                setIsSearchLoading(true);
                try {
                    const results = await getSuggestionsFromHook(debouncedSearchTerm);
                    setSearchSuggestions(results);
                } catch (error) {
                    console.error('Error al obtener sugerencias:', error);
                    setSearchSuggestions([]);
                } finally {
                    setIsSearchLoading(false);
                }
            } else {
                setSearchSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm, getSuggestionsFromHook]);

    // Manejar búsqueda (actualizar término para sugerencias)
    const handleSearch = (term: string) => {
        setSearchQuery(term);
        // No llamar onSearch aquí, el useEffect se encargará
    };

    // Ejecutar búsqueda (cuando el usuario presiona Enter o hace clic en buscar)
    const handleExecuteSearch = (term: string) => {
        const trimmedTerm = term.trim();

        // Actualizar la búsqueda ejecutada (esto dispara el filtrado de productos)
        setExecutedSearch(trimmedTerm);

        // Guardar en historial si tiene al menos 2 caracteres
        if (trimmedTerm.length >= 2) {
            addToHistory(trimmedTerm);
        }

        // Llamar a la función onSearch del padre
        onSearch(trimmedTerm);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setExecutedSearch('');
        setCategoryFilter('');
        setBrandFilter('');
        setBrandCodeFilter('');
        setModelFilter('');
        setMotorizationFilter('');
        setAssemblyPlantFilter('');
        setStatusFilter('');
    };

    const hasActiveFilters = searchQuery || categoryFilter || brandFilter || brandCodeFilter || 
                           modelFilter || motorizationFilter || assemblyPlantFilter || statusFilter;


    // Función para limpiar historial
    const clearSearchHistory = () => {
        clearHistory();
    };


    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Main search and basic filters */}
            <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
            <SearchInput
                value={searchQuery}
                onChange={handleSearch}
                onSearch={handleExecuteSearch}
                placeholder="Buscar productos por nombre, SKU o descripción..."
                suggestions={searchSuggestions}
                isLoading={isSearchLoading}
                searchHistory={searchHistory}
                onClearHistory={clearSearchHistory}
                className="w-full"
            />
            {isSearchLoading && (
                <p className="text-xs text-gray-500 mt-1">
                    Buscando sugerencias...
                </p>
            )}
        </div>
                <div className="flex gap-2">
                    <div className="w-64">
                        <SearchableSelect
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            placeholder="Todas las categorías"
                            options={categories?.map((category, index) => ({
                                value: category.name,
                                label: category.name
                            })) || []}
                            allOption={{ value: "", label: "Todas las categorías" }}
                            searchPlaceholder="Buscar categoría..."
                            className="h-10"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {showAdvancedFilters ? 'Ocultar Filtros' : 'Más Filtros'}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Advanced filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {/* Brand Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marca
                            </label>
                            <SearchableSelect
                                value={brandFilter}
                                onValueChange={setBrandFilter}
                                placeholder="Todas las marcas"
                                options={brandAutoParts?.map((brand) => ({
                                    value: brand.name,
                                    label: brand.name
                                })) || []}
                                allOption={{ value: "", label: "Todas las marcas" }}
                                searchPlaceholder="Buscar marca..."
                                maxVisibleOptions={50}
                            />
                        </div>
                        {/* Model Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Modelo
                            </label>
                            <SearchableSelect
                                value={modelFilter}
                                onValueChange={setModelFilter}
                                placeholder="Todos los modelos"
                                options={models?.map((model, index) => ({
                                    value: model.model_car,
                                    label: model.model_car
                                })) || []}
                                allOption={{ value: "", label: "Todos los modelos" }}
                                searchPlaceholder="Buscar modelo..."
                                maxVisibleOptions={50}
                            />
                        </div>

                        {/* Motorization Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motorización
                            </label>
                            <SearchableSelect
                                value={motorizationFilter}
                                onValueChange={setMotorizationFilter}
                                placeholder="Todas las motorizaciones"
                                options={motorizations?.map((motorization, index) => ({
                                    value: motorization.code,
                                    label: motorization.motorization
                                })) || []}
                                allOption={{ value: "", label: "Todas las motorizaciones" }}
                                searchPlaceholder="Buscar motorización..."
                                maxVisibleOptions={50}
                            />
                        </div>

                        {/* Assembly Plant Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Planta de Ensamble
                            </label>
                            <SearchableSelect
                                value={assemblyPlantFilter}
                                onValueChange={setAssemblyPlantFilter}
                                placeholder="Todas las plantas"
                                options={assemblyPlants?.map((plant, index) => ({
                                    value: plant.assembly_plant,
                                    label: plant.assembly_plant
                                })) || []}
                                allOption={{ value: "", label: "Todas las plantas" }}
                                searchPlaceholder="Buscar planta..."
                                maxVisibleOptions={50}
                            />
                        </div>
                    </div>

                    {/* Clear filters button */}
                    {hasActiveFilters && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Limpiar todos los filtros
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}