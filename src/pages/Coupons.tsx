import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { upsertCoupon } from '../redux/slices/cmsSlice';
import { Coupon } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Plus, 
  Ticket, 
  Calendar, 
  Users, 
  ToggleLeft, 
  ToggleRight,
  X,
  Save
} from 'lucide-react';
import { cn } from '../utils/cn';

export const CouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const coupons = useAppSelector(state => state.cms.coupons);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || !expiry) {
      alert('Fill necessary fields');
      return;
    }

    const newCpn: Coupon = {
      id: `cpn-${Date.now()}`,
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: minOrder ? parseFloat(minOrder) : undefined,
      expiryDate: expiry,
      isActive: true,
      usageCount: 0
    };

    dispatch(upsertCoupon(newCpn));
    setIsDrawerOpen(false);
    // Reset
    setCode('');
    setDiscountValue('');
    setMinOrder('');
    setExpiry('');
  };

  const handleToggleStatus = (coupon: Coupon) => {
    dispatch(upsertCoupon({
      ...coupon,
      isActive: !coupon.isActive
    }));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Marketing Coupons & Promo Engine</h1>
          <p className="text-sm text-muted-foreground">Draft, manage, and deploy algorithmic discount triggers to optimize patient onboarding.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-primary text-white hover:bg-primary/90 font-black text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Launch Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <motion.div 
            layout
            key={coupon.id} 
            className={cn(
              "bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all border-dashed border-2",
              coupon.isActive ? "border-primary/40" : "border-border opacity-60"
            )}
          >
            {/* The Classic Ticket Left/Right Notch Visual */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background border-r border-dashed border-border z-10" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background border-l border-dashed border-border z-10" />

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="bg-primary/10 text-primary font-mono font-black tracking-widest border border-primary/30 rounded px-3 py-1 text-sm inline-block">
                    {coupon.code}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
                    <Users className="h-3 w-3" /> Applied by {coupon.usageCount} users
                  </div>
                </div>
                
                <button onClick={() => handleToggleStatus(coupon)} className="hover:scale-110 transition-transform">
                  {coupon.isActive ? (
                    <ToggleRight className="h-8 w-8 text-primary" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="border-t border-dashed border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" /> Rebate Offer
                  </span>
                  <span className="text-foreground">
                    {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT`}
                  </span>
                </div>
                
                {coupon.minOrderValue && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Minimum Order</span>
                    <span className="font-bold text-foreground">₹{coupon.minOrderValue}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Valid Until
                  </span>
                  <span className="font-bold text-rose-600">{coupon.expiryDate}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Drawer for Creation */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border bg-card flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" /> Design Coupon Code
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Promo Code (Uppercase) *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. SUMMERSAVE50"
                    className="w-full p-2 border border-input rounded text-sm uppercase font-mono font-bold"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Discount Methodology *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('Percentage')}
                      className={cn(
                        "py-2 rounded border text-xs font-bold",
                        discountType === 'Percentage' ? "bg-primary text-white border-primary" : "bg-card border-border"
                      )}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('Fixed')}
                      className={cn(
                        "py-2 rounded border text-xs font-bold",
                        discountType === 'Fixed' ? "bg-primary text-white border-primary" : "bg-card border-border"
                      )}
                    >
                      Fixed Currency (₹)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Discount Magnitude *</label>
                  <input 
                    required
                    type="number" 
                    placeholder={discountType === 'Percentage' ? 'e.g. 20' : 'e.g. 150'}
                    className="w-full p-2 border border-input rounded text-sm font-bold"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Min Cart Value</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    className="w-full p-2 border border-input rounded text-sm"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Calendar Expiry *</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-2 border border-input rounded text-sm"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-border text-xs font-bold rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-primary text-white hover:bg-primary/90 font-black text-xs rounded-lg flex items-center gap-1">
                    <Save className="h-3.5 w-3.5" /> Deploy Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
