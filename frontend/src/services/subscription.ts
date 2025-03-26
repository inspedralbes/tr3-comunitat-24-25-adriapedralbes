import { api } from './api';
import { authService } from './auth';

export interface SubscriptionStatus {
  has_subscription: boolean;
  subscription_status: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface CheckoutSession {
  session_id: string;
  checkout_url: string;
}

export const subscriptionService = {
  /**
   * Crea una sesión de Stripe para iniciar el proceso de suscripción
   */
  createCheckoutSession: async (successUrl: string, cancelUrl: string): Promise<CheckoutSession> => {
    console.log('Solicitando sesión de checkout a la API');
    console.log('Parámetros:', { success_url: successUrl, cancel_url: cancelUrl });
    
    try {
      const response = await api.post('subscription/create-checkout-session/', {
        success_url: successUrl,
        cancel_url: cancelUrl
      });
      
      console.log('Respuesta recibida:', response);
      
      if (!response || !response.session_id || !response.checkout_url) {
        console.error('Respuesta inválida de la API:', response);
        throw new Error('Respuesta inválida del servidor');
      }
      
      return response;
    } catch (error) {
      console.error('Error en createCheckoutSession:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Ocurrió un error en el servidor'
      );
    }
  },

  /**
   * Verifica el estado de la suscripción del usuario actual
   */
  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    // Si el usuario no está autenticado, devolver suscripción no activa
    if (!authService.isAuthenticated()) {
      return {
        has_subscription: false,
        subscription_status: null,
        start_date: null,
        end_date: null
      };
    }
    
    try {
      // Primero verificar si el usuario es superusuario
      const profile = await authService.getProfile();
      if (profile && profile.is_superuser) {
        console.log('Usuario es superadmin - acceso garantizado');
        return {
          has_subscription: true,
          subscription_status: 'active',
          start_date: profile.subscription_start_date || null,
          end_date: profile.subscription_end_date || null
        };
      }
      
      const result = await api.get('subscription/status/');
      return result;
    } catch (error) {
      console.error('Error en getSubscriptionStatus:', error);
      // En caso de error, permitimos acceso temporal
      return {
        has_subscription: true, // Permitimos acceso para evitar bloqueos
        subscription_status: 'temp_access',
        start_date: null,
        end_date: null
      };
    }
  },

  /**
   * Cancela la suscripción del usuario actual
   */
  cancelSubscription: async (): Promise<any> => {
    return api.post('subscription/cancel/', {});
  }
};

export default subscriptionService;
