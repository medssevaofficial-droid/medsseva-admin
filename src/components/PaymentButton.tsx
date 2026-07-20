import React, { useState } from 'react';
import { processPayment } from '../utils/paymentModule';
import { useToast } from './Toast';

interface PaymentButtonProps {
  bookingId: string;
  label?: string;
  onSuccess?: (response: any) => void;
  onFailure?: (response: any) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ bookingId, label, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    await processPayment({
      bookingId,
      context: 'general',
      description: 'MedSeva Payment',
      onSuccess: (response) => {
        if (onSuccess) onSuccess(response);
        else success('Payment successful. ID: ' + response.razorpay_payment_id);
        setLoading(false);
      },
      onFailure: (response) => {
        if (onFailure) onFailure(response);
        setLoading(false);
      },
    });
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg shadow hover:bg-slate-800 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Processing...' : (label || 'Pay with Razorpay')}
    </button>
  );
};