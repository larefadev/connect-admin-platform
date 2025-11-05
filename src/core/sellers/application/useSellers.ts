import supabase from "@/lib/Supabase";
import { Person } from "../interface/Person";
import { useState, useCallback, useEffect } from "react";

export const useSeller = () => {
    const [sellers, setSellers] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSellers = useCallback(async () => {
        setLoading(true);
        setError(null);        
        try {
            // Primero obtener todos los person
            const {data: personsData, error: personsError} = await supabase
                .from('person')
                .select('*');
            
            if (personsError) {
                throw personsError;
            }

            if (!personsData || personsData.length === 0) {
                setSellers([]);
                return;
            }

            // Para cada person, obtener su store y store_profile
            const transformedData = await Promise.all(
                personsData.map(async (person: Person) => {
                    // Buscar store asociado a esta persona
                    const { data: storeData, error: storeError } = await supabase
                        .from('store')
                        .select('profile_id')
                        .eq('lord_id', person.id)
                        .maybeSingle();

                    if (storeError || !storeData) {
                        return {
                            ...person,
                            StoreProfile: undefined
                        };
                    }

                    // Obtener store_profile completo
                    const { data: storeProfileData, error: profileError } = await supabase
                        .from('store_profile')
                        .select('*')
                        .eq('id', storeData.profile_id)
                        .maybeSingle();

                    if (profileError || !storeProfileData) {
                        return {
                            ...person,
                            StoreProfile: undefined
                        };
                    }

                    // Si hay address, obtener adress y city
                    let adressData = null;
                    if (storeProfileData.address) {
                        const { data: addressInfo, error: addressError } = await supabase
                            .from('adress')
                            .select('*')
                            .eq('id', storeProfileData.address)
                            .maybeSingle();

                        if (!addressError && addressInfo) {
                            // Si hay city_id, obtener el nombre de la ciudad
                            let cityData = null;
                            if (addressInfo.city_id) {
                                const { data: cityInfo, error: cityError } = await supabase
                                    .from('city')
                                    .select('name')
                                    .eq('id', addressInfo.city_id)
                                    .maybeSingle();

                                if (!cityError && cityInfo) {
                                    cityData = cityInfo;
                                }
                            }

                            adressData = {
                                ...addressInfo,
                                city: cityData
                            };
                        }
                    }

                    return {
                        ...person,
                        StoreProfile: {
                            ...storeProfileData,
                            adress: adressData || undefined
                        }
                    };
                })
            );

            setSellers(transformedData);
            
        } catch (err) {
            setError('Error al obtener vendedores');
            console.error('Error en getSellers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSellerStatus = useCallback(async (sellerId: bigint | undefined, newStatus: boolean) => {
        if (!sellerId) return false;
        
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('person')
                .update({ status: newStatus })
                .eq('id', sellerId);
            
            if (error) throw error;
            
            // Actualizar el estado local
            setSellers(prev => prev.map(seller => 
                seller.id === sellerId 
                    ? { ...seller, status: newStatus }
                    : seller
            ));
            
            return true;
        } catch (err) {
            setError('Error al actualizar el estado del vendedor');
            console.error('Error en updateSellerStatus:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteSeller = useCallback(async (sellerId: bigint | undefined) => {
        if (!sellerId) return false;
        
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('person')
                .delete()
                .eq('id', sellerId);
            
            if (error) throw error;
            
            // Actualizar el estado local
            setSellers(prev => prev.filter(seller => seller.id !== sellerId));
            
            return true;
        } catch (err) {
            setError('Error al eliminar el vendedor');
            console.error('Error en deleteSeller:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSellerById = useCallback(async (sellerId: bigint) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('person')
                .select('*')
                .eq('id', sellerId)
                .single();
            
            if (error) throw error;
            
            return data as Person;
        } catch (err) {
            setError('Error al obtener el vendedor');
            console.error('Error en getSellerById:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSeller = useCallback(async (reseller: Person, updates: Partial<Person>) => {
        if (!reseller.id) return false;
        
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('person')
                .update(updates)
                .eq('id', reseller.id);
            
            if (error) throw error;
            
            // Actualizar el estado local
            setSellers(prev => prev.map(seller => 
                seller.id === reseller.id 
                    ? { ...seller, ...updates }
                    : seller
            ));
            
            return true;
        } catch (err) {
            setError('Error al actualizar el vendedor');
            console.error('Error en updateSeller:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getSellers();
    },[getSellers]);
    
    return {
        sellers,
        loading,
        error,
        getSellers,
        getSellerById,
        updateSellerStatus,
        deleteSeller,
        updateSeller
    };
};