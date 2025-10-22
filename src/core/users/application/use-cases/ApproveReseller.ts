import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Reseller } from '../../domain/entities/User';

/**
 * Use Case: Approve Reseller
 * Approves a pending reseller application
 */
export class ApproveResellerUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(resellerId: string, approvedBy: string): Promise<Reseller> {
    // Business logic: validate reseller exists and is pending
    const reseller = await this.userRepository.findById(resellerId);

    if (!reseller) {
      throw new Error('Reseller not found');
    }

    if (reseller.status !== 'pending') {
      throw new Error('Reseller is not in pending status');
    }

    return await this.userRepository.approveReseller(resellerId, approvedBy);
  }
}
