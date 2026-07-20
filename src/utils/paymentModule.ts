import { loadRazorpayScript } from './razorpay';
import toast from 'react-hot-toast';

export type PaymentContext = 'checkout' | 'subscription' | 'wallet' | 'booking_confirmation' | 'general';

export interface PaymentOptions {
  amount: number; // In INR (we will multiply by 100 internally)
  context?: PaymentContext;
  description?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess: (response: any) => void;
  onFailure?: (response: any) => void;
}

/**
 * Universal Unified Payment Module for MedsSeva.
 * Can be called from anywhere (Checkout, Subscription, Wallet, etc.)
 */
export const processPayment = async (options: PaymentOptions): Promise<void> => {
  const {
    amount,
    context = 'general',
    description = 'MedsSeva Payment',
    customerName = 'MedsSeva User',
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

  // MOCK: If backend API is ready, you would call it here depending on the context:
  // let orderId = '';
  // if (context === 'wallet') { ... fetch order for wallet }
  // else if (context === 'subscription') { ... fetch order for sub }
  
  const razorpayOptions = {
    key: 'rzp_test_TDQlol2pE6LhM3', // SAFE to keep Key ID here
    amount: amount * 100, // Razorpay uses paise
    currency: 'INR',  
    name: 'MedsSeva',
    description: `${description} (${context})`,
    // order_id: orderId, // Enable once backend creates the order
    handler: function (response: any) {
      // Payment Successful
      onSuccess(response);
    },
    prefill: {
      name: customerName,
      contact: customerPhone,
      email: customerEmail,
    },
    theme: {
      color: '#0f172a', // MedsSeva dark slate theme
    },
  };

  const paymentObject = new window.Razorpay(razorpayOptions);
  
  paymentObject.on('payment.failed', function (response: any) {
    if (onFailure) {
      onFailure(response);
    } else {
      toast.error(`Payment Failed! ${response.error.description || ''}`);
    }
  });

  paymentObject.open();
};
