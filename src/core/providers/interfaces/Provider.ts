export interface Provider {
  id?: bigint;
  name?: string | null;
  direction?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  representative?: string | null;
  phone?: string | null;
  email?: string | null;
  inventory_reading?: string | null;
  warranty?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProviderData {
  name: string;
  direction?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  representative?: string;
  phone?: string;
  email?: string;
  inventory_reading?: string;
  warranty?: string;
}

export interface UpdateProviderData extends Partial<CreateProviderData> {
  id: bigint;
}
