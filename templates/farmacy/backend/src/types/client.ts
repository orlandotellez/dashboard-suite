export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Client {
  id: string;
  name: string;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  membership: string;
  deletedAt?: Date | null;
}

export interface CreateClientDto {
  name: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  address?: string;
  membership?: string;
}

export interface UpdateClientDto {
  name?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  membership?: string;
}

export interface ClientFilters {
  search?: string;
  membership?: string;
}