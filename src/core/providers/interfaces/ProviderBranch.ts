export interface ProviderBranch {
  id?: number;
  provider_id: bigint;
  branch_name: string;
  contact_person?: string | null;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  postal_code: string;
  is_main_branch: boolean;
  is_active: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProviderBranchData {
  provider_id: bigint;
  branch_name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postal_code: string;
  is_main_branch?: boolean;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateProviderBranchData extends Partial<CreateProviderBranchData> {
  id: number;
}
