/**
 * Barrel export for Users module
 */

// Entities
export * from './domain/entities/User';

// Repositories
export * from './domain/repositories/IUserRepository';

// Use Cases
export * from './application/use-cases/GetResellers';
export * from './application/use-cases/ApproveReseller';
export * from './application/use-cases/SuspendUser';

// Hooks
export { useCustomers } from './useCustomers';
export type { CustomerStats } from './useCustomers';
