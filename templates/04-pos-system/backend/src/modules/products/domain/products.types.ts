export interface IProductResponse {
  id: string
  barcode?: string
  name: string
  category?: string
  price: number
  cost: number
  tax_rate: number
  stock: number
  low_stock_threshold: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface IProductListResponse {
  products: IProductResponse[]
  total: number
}

export interface IProductQueryParams {
  search?: string
  category?: string
  active?: boolean
  low_stock?: boolean
  page?: number
  limit?: number
}
