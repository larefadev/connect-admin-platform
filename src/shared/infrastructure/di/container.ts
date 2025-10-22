/**
 * Dependency Injection Container
 * This is where we wire up our dependencies
 */

// Mock Repositories (for other modules not yet migrated)
import { MockUserRepository } from '@/core/users/infrastructure/repositories/MockUserRepository';
import { MockOrderRepository } from '@/core/orders/infrastructure/repositories/MockOrderRepository';

// Real Repositories
import { SupabaseAdminRepository } from '@/core/auth/infrastructure/repositories/SupabaseAdminRepository';

// Use Cases - Users
import { GetResellersUseCase } from '@/core/users/application/use-cases/GetResellers';
import { ApproveResellerUseCase } from '@/core/users/application/use-cases/ApproveReseller';
import { SuspendUserUseCase } from '@/core/users/application/use-cases/SuspendUser';

// Use Cases - Products
// Note: Product use cases not implemented yet, using hooks instead

// Use Cases - Admin Auth (Real Implementation)
import { LoginAdminUseCase } from '@/core/auth/application/use-cases/LoginAdmin';
import { RegisterAdminUseCase } from '@/core/auth/application/use-cases/RegisterAdmin';
import { CheckAuthStatusUseCase } from '@/core/auth/application/use-cases/CheckAuthStatus';

class DIContainer {
  // Mock Repositories (Singletons) - for modules not yet migrated
  private _userRepository = new MockUserRepository();
  private _orderRepository = new MockOrderRepository();

  // Real Repositories
  private _adminRepository = new SupabaseAdminRepository();

  // Repository Getters
  get userRepository() {
    return this._userRepository;
  }

  // Note: Product repository not used - using hooks with direct Supabase calls

  get orderRepository() {
    return this._orderRepository;
  }

  get adminRepository() {
    return this._adminRepository;
  }

  // Use Cases - Users
  get getResellersUseCase() {
    return new GetResellersUseCase(this._userRepository);
  }

  get approveResellerUseCase() {
    return new ApproveResellerUseCase(this._userRepository);
  }

  get suspendUserUseCase() {
    return new SuspendUserUseCase(this._userRepository);
  }

  // Use Cases - Products
  // Note: Product use cases not implemented yet, using hooks instead

  // Use Cases - Admin Auth (Real Implementation)
  get loginAdminUseCase() {
    return new LoginAdminUseCase(this._adminRepository);
  }

  get registerAdminUseCase() {
    return new RegisterAdminUseCase(this._adminRepository);
  }

  get checkAuthStatusUseCase() {
    return new CheckAuthStatusUseCase(this._adminRepository);
  }
}

// Export singleton instance
export const container = new DIContainer();
