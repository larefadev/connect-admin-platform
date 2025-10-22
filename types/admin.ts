export interface CreateAdminDTO {
  auth_id?: string;
  email: string;
  password?: string;
  name: string;
  lastName?: string;
  last_name?: string;
  username: string;
  profile_image?: string;
  status?: boolean;
  admin_status?: boolean;
}

export interface UpdateAdminDTO {
  id: string;
  email?: string;
  name?: string;
  lastName?: string;
  username?: string;
  isActive?: boolean;
}

export interface EmailValidationResponse {
  isValid: boolean;
  isUnique: boolean;
  existsInPerson?: boolean;
  existsInAdmins?: boolean;
  message?: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  lastName: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
