import supabase from "@/lib/Supabase"
import { ProductCategory } from "../interface/Product";
import { useCallback, useState , useEffect } from "react";



export interface Model {
  id: number;
  model_car: string;
}

export interface Motorization {
  motorization: string;
  code: string;
}

export interface AssemblyPlant {
  assembly_plant: string;
  code: string;
}

export const useCategories = () =>{
    const [categories, setCategories] = useState<ProductCategory[]>([]);

    const getCategories = useCallback(async () => {
        const { data, error } = await supabase
            .from('product_category')
            .select('*');
        if (error) throw error;
        setCategories(data);
    }, []);

    useEffect(() => {
        getCategories();
    }, []);

    return { categories, getCategories };
}

export const useModels = () => {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getModels = useCallback(async (brandId?: number) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase.from('model_car_test').select('*')
            if (brandId) {
                query = query.eq('brand_id', brandId);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            setModels(data || []);
        } catch (err) {
            console.error('Error loading models:', err);
            setError(err instanceof Error ? err.message : 'Error loading models');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getModels();
    }, []);

    return { models, loading, error, getModels };
}

export const useMotorizations = () => {
    const [motorizations, setMotorizations] = useState<Motorization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMotorizations = useCallback(async (modelId?: number) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase.from('motorization_car_test').select('*')
            if (modelId) {
                query = query.eq('model_id', modelId);
            }
            const { data, error } = await query;
            if (error) throw error;
            setMotorizations(data || []);
        } catch (err) {
            console.error('Error loading motorizations:', err);
            setError(err instanceof Error ? err.message : 'Error loading motorizations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getMotorizations();
    }, []);

    return { motorizations, loading, error, getMotorizations };
}

export const useAssemblyPlants = () => {
    const [assemblyPlants, setAssemblyPlants] = useState<AssemblyPlant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAssemblyPlants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.from('assembly_plant_test').select('*')
            if (error) throw error;
            setAssemblyPlants(data || []);
        } catch (err) {
            console.error('Error loading assembly plants:', err);
            setError(err instanceof Error ? err.message : 'Error loading assembly plants');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getAssemblyPlants();
    }, []);

    return { assemblyPlants, loading, error, getAssemblyPlants };
}



