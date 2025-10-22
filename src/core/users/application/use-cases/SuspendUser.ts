import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

/**
 * Use Case: Suspend User
 * Suspends a user account
 */
export class SuspendUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, reason: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.status === 'suspended') {
      throw new Error('User is already suspended');
    }

    return await this.userRepository.suspendUser(userId, reason);
  }
}
