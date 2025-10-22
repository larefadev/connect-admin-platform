/**
 * Barrel export for Orders module
 */

// Entities
export * from './domain/entities/Order';

// Repositories
export * from './domain/repositories/IOrderRepository';

// Hooks
export { useOrders } from './application/useOrders';
export type { OrderStats } from './application/useOrders';
