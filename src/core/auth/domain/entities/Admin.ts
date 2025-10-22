/**
 * Admin Domain Entity
 * Core business entity representing an administrator in the system
 * Following Clean Architecture principles - NO framework dependencies
 */

export interface AdminEntity {
  id: number;
  createdAt: Date;
  name: string;
  lastName: string;
  authId: string;
  username: string;
  profileImage?: string;
  status: boolean;
  adminStatus: boolean;
  email: string;
}

/**
 * Factory method to create an Admin entity
 */
export const createAdminEntity = (data: {
  id: number;
  created_at: Date;
  name: string;
  last_name: string;
  auth_id: string;
  username: string;
  profile_image?: string;
  status: boolean;
  admin_status: boolean;
  email: string;
}): AdminEntity => ({
  id: data.id,
  createdAt: data.created_at,
  name: data.name,
  lastName: data.last_name,
  authId: data.auth_id,
  username: data.username,
  profileImage: data.profile_image,
  status: data.status,
  adminStatus: data.admin_status,
  email: data.email,
});

/**
 * Validate admin entity business rules
 */
export const validateAdminEntity = (admin: Partial<AdminEntity>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!admin.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) {
    errors.push('Email inválido');
  }

  if (!admin.username || admin.username.length < 3 || admin.username.length > 20) {
    errors.push('El nombre de usuario debe tener entre 3 y 20 caracteres');
  }

  if (admin.username && !/^[a-zA-Z0-9_-]+$/.test(admin.username)) {
    errors.push('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
  }

  if (!admin.name || admin.name.trim().length === 0) {
    errors.push('El nombre es requerido');
  }

  if (!admin.lastName || admin.lastName.trim().length === 0) {
    errors.push('El apellido es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
