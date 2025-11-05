// Interfaces para cotizaciones - utilizadas en el sistema de cotizaciones
export interface ClientQuote {
  id?: string;
  name: string;
  address?: string;
  mobile_phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyQuote {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  store_id?:string | number
}

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  item_discount?: number;
  item_subtotal?: number;
  item_order?: number;
  item_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductQuote {
  id?: string;
  quote_number: string;
  client_id?: string;
  company_id?: string;
  quote_date?: string;
  expiration_date?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  notes?: string;
  terms_conditions?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  // Relaciones
  client?: ClientQuote;
  company?: CompanyQuote;
  items?: QuoteItem[];
}

export interface CreateQuoteRequest {
  client: Omit<ClientQuote, 'id' | 'created_at' | 'updated_at'>;
  company: Omit<CompanyQuote, 'id' | 'created_at' | 'updated_at'>;
  items: Omit<QuoteItem, 'id' | 'quote_id' | 'created_at' | 'updated_at'>[];
  quote_date?: string;
  expiration_date?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface UpdateQuoteRequest {
  id: string;
  client?: Partial<ClientQuote>;
  company?: Partial<CompanyQuote>;
  items?: Partial<QuoteItem>[];
  status?: ProductQuote['status'];
  notes?: string;
  terms_conditions?: string;
}

// Interfaces para el servicio de email de cotizaciones
export interface QuoteEmailClient {
  name: string;
  email: string;
  address?: string;
  mobile_phone?: string;
}

export interface QuoteEmailCompany {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface QuoteEmailItem {
  product_sku: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  item_discount?: number;
  item_notes?: string;
}

export interface QuoteEmailData {
  quote_number?: string;
  quote_date: string;
  expiration_date: string;
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  client: QuoteEmailClient;
  company: QuoteEmailCompany;
  items: QuoteEmailItem[];
  notes?: string;
  terms_conditions?: string;
}

export interface QuoteEmailNotificationPayload {
  quoteData: QuoteEmailData;
}
