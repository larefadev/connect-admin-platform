/**
 * Barrel export for Products module
 */

// Entities
export * from './interface/Product';
// Use Cases
// Note: Only useProducts hook exists currently

// Hooks
export { useProducts } from './application/useProducts';
export type { ProductStats } from './interface/Product';
