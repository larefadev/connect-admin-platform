import { QuoteEmailData } from '@/types/quote';
import { QuoteItem } from '@/stores/publicQuoteStore';
import { StoreProfile } from '@/types/store';

interface QuoteEmailMapperParams {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  storeProfile: StoreProfile | null;
  items: QuoteItem[];
  notes?: string;
}

/**
 * Mapea los datos de cotización pública al formato requerido por la API de email
 */
export const mapPublicQuoteToEmailData = ({
  quoteNumber,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
  storeProfile,
  items,
  notes
}: QuoteEmailMapperParams): QuoteEmailData => {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días

  // Construir dirección completa de la tienda
  const buildStoreAddress = () => {
    if (!storeProfile) return "";
    
    const addressParts = [
      storeProfile.street,
      storeProfile.neighborhood,
      storeProfile.municipality,
      storeProfile.state,
      storeProfile.postal_code
    ].filter(Boolean);
    
    return addressParts.join(", ");
  };

  return {
    quote_number: quoteNumber,
    quote_date: currentDate.toISOString().split('T')[0],
    expiration_date: expirationDate.toISOString().split('T')[0],
    status: 'sent',
    client: {
      name: clientName,
      email: clientEmail,
      address: clientAddress,
      mobile_phone: clientPhone
    },
    company: {
      name: storeProfile?.name || "Tienda",
      email: storeProfile?.corporate_email || "",
      phone: storeProfile?.phone || "",
      address: buildStoreAddress()
    },
    items: items.map(item => ({
      product_sku: item.productSku,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      item_discount: item.itemDiscount || 0,
      item_notes: item.itemNotes
    })),
    notes: notes,
    terms_conditions: "Esta cotización es válida por 30 días desde la fecha de emisión."
  };
};
