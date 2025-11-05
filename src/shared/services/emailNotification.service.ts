import { BaseService } from "@/lib/api";
import { B2BEmailNotificationPayload, B2BEmailOrderData, EmailNotificationPayload } from "@/core/orders/domain/entities/b2b-order";
import { Order } from "@/core/orders";
import { QuoteEmailData, QuoteEmailNotificationPayload } from "../interfaces/quote";


class EmailNotificationService extends BaseService {
    private readonly apiBaseURL: string;

    constructor() {
        const baseURL = "https://connect-orders-notifications-production.up.railway.app";
        super(baseURL + "/api");
        this.apiBaseURL = baseURL + "/api";
    }

    public async sendEmailNotification(orderData: Order, ownerEmail: string) {
        try {
            const payload: EmailNotificationPayload = {
                orderData,
                ownerEmail
            };
            
            const response = await this.post(`/email/order`, payload);
            return response;
        } catch (error) {
            // Manejo mejorado de errores para no bloquear el flujo principal
            console.error('Error en sendEmailNotification:', error);
            
            // Si es un error de red o servicio no disponible, no lanzar error
            if (error && typeof error === 'object' && 'response' in error) {
                const httpError = error as { response?: { status: number } };
                if (!httpError.response || httpError.response.status >= 500) {
                    // Error de servidor o red - no bloquear
                    return { success: false, message: 'Servicio de notificaciones temporalmente no disponible' };
                }
            }
            
            // Para otros errores, también devolver respuesta en lugar de lanzar
            return { success: false, message: 'Error al enviar notificación por email' };
        }
    }

    public async sendB2BEmailNotification(orderData: B2BEmailOrderData, ownerEmail: string) {
        try {
            const payload: B2BEmailNotificationPayload = {
                orderData,
                ownerEmail
            };
            const response = await this.post(`/email/b2b`, payload);
            return response;
        } catch (error) {       
            // Si es un error 404, podría ser que el servicio no esté disponible
            if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 404) {
                return { success: false, message: 'Servicio de notificaciones no disponible' };
            }
            
            throw error;
        }
    }

    public async sendQuoteEmailNotification(quoteData: QuoteEmailData): Promise<{ success: boolean; message?: string }> {
        try {
            const payload: QuoteEmailNotificationPayload = {
                quoteData
            };

            const response = await this.post(`/email/quote`, payload);
            return response as { success: boolean; message?: string };
        } catch (error) {
            // Si es un error 404, podría ser que el servicio no esté disponible
            if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 404) {
                return { success: false, message: 'Servicio de notificaciones no disponible' };
            }

            throw error;
        }
    }

    /**
     * Nuevo método para enviar cotizaciones con PDF generado en el frontend
     */
    public async sendQuoteEmailWithPDF(
        pdfBlob: Blob,
        clientEmail: string,
        companyEmail: string,
        subject: string,
        quoteData: {
            quoteNumber: string;
            clientName: string;
            companyName: string;
            companyPhone?: string;
            total: string;
            subtotal: string;
            taxes: string;
        }
    ): Promise<{ success: boolean; message?: string }> {
        try {
            const formData = new FormData();
            formData.append('pdf', pdfBlob, 'cotizacion.pdf');
            formData.append('clientEmail', clientEmail);
            formData.append('companyEmail', companyEmail);
            formData.append('subject', subject);
            formData.append('filename', 'cotizacion.pdf');
            formData.append('quoteData', JSON.stringify(quoteData));

            const response = await fetch(this.apiBaseURL + '/email/quote', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: data.message || 'Email enviado exitosamente' };
            } else {
                return { success: false, message: data.message || 'Error al enviar email' };
            }
        } catch (error) {
            console.error('Error al enviar email con PDF:', error);
            return { success: false, message: 'Error al enviar email de cotización' };
        }
    }
}

const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;