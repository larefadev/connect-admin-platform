/**
 * Barrel export for Products module
 */

// Entities
export * from './domain/entities/Product';

// Repositories
export * from './domain/repositories/IProductRepository';

// Use Cases
// Note: Only useProducts hook exists currently

// Hooks
export { useProducts } from './application/use-cases/useProducts';
export type { ProductStats } from './application/use-cases/useProducts';
