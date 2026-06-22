export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface SaleItem {
  id: string;
  saleId: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  date: Date;
  total: number;
  paymentMethod: string;
  userId: string;
  clientId?: string | null;
  items?: SaleItem[];
}

export interface CreateSaleItemDto {
  medicineId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleDto {
  paymentMethod: PaymentMethod;
  clientId?: string;
  items: CreateSaleItemDto[];
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  clientId?: string;
}