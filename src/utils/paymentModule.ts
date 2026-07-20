import { loadRazorpayScript } from './razorpay';
import toast from 'react-hot-toast';
import api from '../services/api';

export type PaymentContext = 'checkout' | 'subscription' | 'wallet' | 'booking_confirmation' | 'general';

export interface PaymentOptions {
  bookingId: string;
  context?: PaymentContext;
  description?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess: (response: any) => void;
  onFailure?: (response: any) => void;
}

export const processPayment = async (options: PaymentOptions): Promise<void> => {
  const {
    bookingId,
    context = 'general',
    description = 'MedSeva Payment',
    customerName = 'MedSeva User',
    customerPhone = '',
    customerEmail = '',
    onSuccess,
    onFailure,
  } = options;

  const isScriptLoaded = await loadRazorpayScript();

  if (!isScriptLoaded) {
    toast.error('Razorpay SDK failed to load. Please check your internet connection.');
    if (onFailure) onFailure(new Error('SDK Failed to load'));
    return;
  }

  let orderData: { orderId: string; amount: number; currency: string; paymentId: string };

  try {
    const response = await api.post('/finance/payments/create-order', { bookingId });
    orderData = response.data;
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to create payment order.');
    if (onFailure) onFailure(err);
    return;
  }

  const razorpayOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: orderData.amount * 100,
    currency: orderData.currency,
    name: 'MedSeva',
    description: `${description} (${context})`,
    order_id: orderData.orderId,
    handler: async function (response: any) {
      try {
        await api.post('/finance/payments/verify', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          bookingId,
        });
        onSuccess(response);
      } catch (verifyErr: any) {
        toast.error('Payment verification failed. Contact support.');
        if (onFailure) onFailure(verifyErr);
      }
    },
    prefill: {
      name: customerName,
      contact: customerPhone,
      email: customerEmail,
    },
    theme: {
      color: '#0f172a',
    },
  };

  const paymentObject = new window.Razorpay(razorpayOptions);

  paymentObject.on('payment.failed', function (response: any) {
    if (onFailure) {
      onFailure(response);
    } else {
      toast.error(`Payment Failed: ${response.error.description || ''}`);
    }
  });

  paymentObject.open();
};