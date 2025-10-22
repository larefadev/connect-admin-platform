import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, Reseller, UserFilters, UserRole, UserStatus } from '../../domain/entities/User';
import { PaginatedResponse, PaginationParams } from '@/shared/domain/types/common.types';

/**
 * Mock implementation of User Repository
 * This will be replaced with real API calls
 */
export class MockUserRepository implements IUserRepository {
  private mockResellers: Reseller[] = [
    {
      id: '1',
      email: 'john@reseller.com',
      name: 'John Doe',
      role: UserRole.RESELLER,
      status: UserStatus.ACTIVE,
      phone: '+1234567890',
      businessName: 'TechStore Inc',
      taxId: 'TAX123456',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      totalSales: 125000,
      commission: 12.5,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      approvedAt: '2024-01-16T10:00:00Z',
    },
    {
      id: '2',
      email: 'jane@shop.com',
      name: 'Jane Smith',
      role: UserRole.RESELLER,
      status: UserStatus.ACTIVE,
      phone: '+0987654321',
      businessName: 'Fashion Hub',
      totalSales: 89500,
      commission: 10.0,
      city: 'Los Angeles',
      country: 'USA',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      approvedAt: '2024-01-11T10:00:00Z',
    },
    {
      id: '3',
      email: 'bob@electronics.com',
      name: 'Bob Johnson',
      role: UserRole.RESELLER,
      status: UserStatus.PENDING,
      phone: '+1122334455',
      businessName: 'ElectroWorld',
      totalSales: 0,
      commission: 15.0,
      city: 'Chicago',
      country: 'USA',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
    },
  ];

  async findAll(params: PaginationParams, filters?: UserFilters): Promise<PaginatedResponse<User>> {
    let filtered = [...this.mockResellers] as User[];

    if (filters?.status) {
      filtered = filtered.filter(u => u.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const data = filtered.slice(start, end);

    return {
      data,
      total: filtered.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(filtered.length / params.limit),
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.mockResellers.find(u => u.id === id) || null;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: String(this.mockResellers.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockResellers.push(newUser as Reseller);
    return newUser;
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const index = this.mockResellers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    this.mockResellers[index] = {
      ...this.mockResellers[index],
      ...user,
      updatedAt: new Date().toISOString(),
    } as Reseller;
    return this.mockResellers[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.mockResellers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.mockResellers.splice(index, 1);
  }

  async findResellers(params: PaginationParams, filters?: UserFilters): Promise<PaginatedResponse<Reseller>> {
    let filtered = [...this.mockResellers];

    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.businessName.toLowerCase().includes(search)
      );
    }

    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const data = filtered.slice(start, end);

    return {
      data,
      total: filtered.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(filtered.length / params.limit),
    };
  }

  async approveReseller(id: string, approvedBy: string): Promise<Reseller> {
    const index = this.mockResellers.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reseller not found');

    this.mockResellers[index] = {
      ...this.mockResellers[index],
      status: UserStatus.ACTIVE,
      approvedAt: new Date().toISOString(),
      approvedBy,
      updatedAt: new Date().toISOString(),
    };

    return this.mockResellers[index];
  }

  async suspendUser(id: string, _reason: string): Promise<User> {
    const index = this.mockResellers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    this.mockResellers[index] = {
      ...this.mockResellers[index],
      status: UserStatus.SUSPENDED,
      updatedAt: new Date().toISOString(),
    };

    return this.mockResellers[index];
  }
}
