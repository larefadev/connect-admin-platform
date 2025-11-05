

// Definir interfaz para PersonType
interface PersonType {
    id: bigint;
    name: string;
    description?: string;
    created_at?: string; // Supabase returns dates as ISO strings
    updated_at?: string; // Supabase returns dates as ISO strings
}



export interface City {
    id: bigint;
    name: string;
    created_at?: string;
}

export interface Address {
    id: bigint;
    city_id?: bigint;
    zone?: string;
    street?: string;
    created_at?: string;
    city?: City;
}

export interface StoreProfile {
    id: string;
    name: string;
    description?: string;
    phone?: string;
    banner_image?: string;
    logo_image?: string;
    web_url?: string;
    whatsapp_url?: string;
    type_store?: bigint;
    address?: bigint;
    email?: bigint;
    corporate_email?: string;
    rfc?: string;
    business_type?: string;
    specialization?: string;
    specialization_type?: string;
    person_type?: string;
    street?: string;
    neighborhood?: string;
    municipality?: string;
    state?: string;
    postal_code?: string;
    address_reference?: string;
    city?: string;
    created_at?: string;
    updated_at?: string;
    // Relaciones opcionales
    adress?: Address;
}


export interface Person {
    id?: bigint;
    status: boolean; // true/false from database
    created_at?: string; // Supabase returns dates as ISO strings
    name?: string | null;
    last_name?: string | null;
    auth_id?: string; // uuid
    person_type?: bigint | null;
    adress_id?: bigint | null;
    username: string;
    profile_image?: string | null;
    email?: string;
    // Relaciones opcionales
    PersonType?: PersonType; // Person_Catalog
    StoreProfile?: StoreProfile; // StoreProfile
}

export interface PersonStatus {
  id: number;
  status: boolean;
  username: string;
  name: string | null;
  last_name: string | null;
  email: string;
}

