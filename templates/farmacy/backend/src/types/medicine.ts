export interface Lab {
  id: string;
  name: string;
  deletedAt?: Date | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Medicine {
  id: string;
  tradeName: string;
  genericName: string;
  description?: string | null;
  price: number;
  stock: number;
  expiryDate?: Date | null;
  laboratoryId: string;
  categoryId: string;
  laboratory?: Lab;
  category?: Category;
  deletedAt?: Date | null;
}

export interface CreateMedicineDto {
  tradeName: string;
  genericName: string;
  description?: string;
  price: number;
  stock?: number;
  expiryDate?: string;
  laboratoryId: string;
  categoryId: string;
}

export interface UpdateMedicineDto {
  tradeName?: string;
  genericName?: string;
  description?: string;
  price?: number;
  expiryDate?: string;
  laboratoryId?: string;
  categoryId?: string;
}

export interface UpdateStockDto {
  stock?: number;
  increment?: number;
  decrement?: number;
}

export type StockStatus = 'low' | 'out' | 'adequate' | 'well';

export interface MedicineFilters {
  search?: string;
  laboratoryId?: string;
  categoryId?: string;
  stockStatus?: StockStatus;
}