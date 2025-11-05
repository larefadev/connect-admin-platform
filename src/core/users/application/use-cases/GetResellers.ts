import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Reseller, UserFilters } from '../../domain/entities/User';
import { PaginatedResponse, PaginationParams } from '@/shared/types/common.types';

/**
 * Use Case: Get Resellers
 * Retrieves a paginated list of resellers with optional filtering
 */
export class GetResellersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    params: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginatedResponse<Reseller>> {
    return await this.userRepository.findResellers(params, filters);
  }
}
