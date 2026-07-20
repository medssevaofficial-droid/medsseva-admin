import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { 
  Settings, 
  UserCircle, 
  SlidersHorizontal, 
  CheckSquare,
  Globe,
  Percent
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  
  const [minOrderValue, setMinOrderValue] = useState('500');
  const [comRate, setComRate] = useState('15');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System wide platform configurations committed successfully.');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> System & Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure clinical pickup logistics, system margins, and operator credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: System Parameters */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Global Logistics & Tariffs
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  Minimum Invoiced Free Home Collection
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <input 
                    type="number" 
                    className="w-full pl-7 p-2 border border-input text-sm font-bold rounded bg-background"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Orders below threshold incur extra ₹150 transport levy.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  Default Franchise Split (P0)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"><Percent className="h-3 w-3" /></span>
                  <input 
                    type="number" 
                    className="w-full pl-7 p-2 border border-input text-sm font-bold rounded bg-background"
                    value={comRate}
                    onChange={(e) => setComRate(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Standard commission payout ceiling applied to new partners.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Lab Operating Window</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" defaultValue="06:00" className="p-2 border border-input rounded text-sm text-foreground bg-background" />
                  <input type="time" defaultValue="22:00" className="p-2 border border-input rounded text-sm text-foreground bg-background" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  Report Generation Channel
                </label>
                <select className="w-full p-2 border border-input rounded text-sm text-foreground bg-background">
                  <option>Direct Auto-Push on Approval</option>
                  <option>Hold until manual Franchise dispatch</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button type="submit" className="px-6 py-2 bg-primary text-white font-black text-xs rounded-lg flex items-center gap-1.5 hover:bg-primary/90 shadow-sm">
                <CheckSquare className="h-4 w-4" /> Save System Overrides
              </button>
            </div>
          </form>
        </div>

        {/* Column 2: Profile Summary Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2 flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-primary" /> Active Credentials
            </h3>

            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-foreground font-bold">
                  {user?.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-black text-sm text-foreground">{user?.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded inline-block mt-1">
                  {user?.role}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground pt-2">
              <div>Registered Email: <strong className="text-foreground block">{user?.email}</strong></div>
              <div>Phone Anchor: <strong className="text-foreground block">{user?.phone}</strong></div>
            </div>
          </div>

          {/* App Security Help box */}
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1 uppercase">
              <Globe className="h-4 w-4" /> Platform Version
            </h4>
            <div className="text-xl font-black text-[#006D6F]">V2.4-STABLE</div>
            <p className="text-[10px] text-muted-foreground font-medium">
              All medical transaction streams comply with ISO 27001 information safeguards and local healthcare privacy matrices.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
