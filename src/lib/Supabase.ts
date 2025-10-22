import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseInstance {
    private static instance: SupabaseInstance;
    private supabase: SupabaseClient;

    private constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!, 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                },
               /* global: {
                    headers: {
                        'Cache-Control': 'max-age=300' // 5 minutos de caché por defecto
                    }
                }*/
            }
        );
    }

    public static getInstance(): SupabaseInstance {
        if (!SupabaseInstance.instance) {
            SupabaseInstance.instance = new SupabaseInstance();
        }
        return SupabaseInstance.instance;
    }

    public getSupabase(): SupabaseClient {
        return this.supabase;
    }
}

const supabase = SupabaseInstance.getInstance().getSupabase();
export default supabase;