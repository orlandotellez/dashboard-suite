export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  deletedAt?: Date | null;
}

export interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface UserFilters {
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}