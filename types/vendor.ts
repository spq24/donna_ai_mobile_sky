export interface VendorCategory {
  id: number;
  name: string;
  description?: string;
}

export interface VendorSubcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
}

export interface Vendor {
  id: number;
  name: string;
  phone_number: string;
  address?: string;
  website?: string;
  category_id: number;
  subcategory_id?: number;
  notes?: string;
  preferred: boolean;
  category: VendorCategory;
  subcategory?: VendorSubcategory;
}

export interface VendorSearchResponse {
  data: Vendor[];
  total: number;
  page: number;
  size: number;
}
