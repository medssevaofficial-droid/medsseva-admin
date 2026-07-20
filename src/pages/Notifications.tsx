import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { addCampaign } from '../redux/slices/cmsSlice';
import { Campaign } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Bell, 
  Send, 
  Plus, 
  Calendar, 
  Users, 
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const campaigns = useAppSelector(state => state.cms.campaigns);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp' | 'Email' | 'Push'>('WhatsApp');
  const [template, setTemplate] = useState('');
  const [recipients, setRecipients] = useState('');
  const [schedule, setSchedule] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !template || !recipients) return;

    const newCmp: Campaign = {
      id: `cmp-${Date.now()}`,
      title,
      channel,
      recipientsCount: parseInt(recipients) || 100,
      scheduledFor: schedule || new Date().toISOString(),
      status: schedule ? 'Scheduled' : 'Sent',
      messageTemplate: template
    };

    dispatch(addCampaign(newCmp));
    setIsDrawerOpen(false);
    // Reset
    setTitle('');
    setTemplate('');
    setRecipients('');
    setSchedule('');
  };

  const getIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <MessageSquare className="h-4 w-4" />;
      case 'WhatsApp': return <span className="font-bold text-xs">WA</span>;
      case 'Email': return <Mail className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Communication Campaigns</h1>
          <p className="text-sm text-muted-foreground">Launch targeted medical follow-ups via SMS, WhatsApp, and local Push relays.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-primary text-white font-black text-xs rounded-lg flex items-center gap-1.5 hover:bg-primary/90 shadow"
        >
          <Plus className="h-4 w-4" /> Draft Blast
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl">
          <div className="text-muted-foreground text-[10px] font-bold uppercase">Delivered This Month</div>
          <div className="text-xl font-black text-foreground">14,202</div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl">
          <div className="text-muted-foreground text-[10px] font-bold uppercase">Average Open Ratio</div>
          <div className="text-xl font-black text-emerald-600">84.2%</div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl">
          <div className="text-muted-foreground text-[10px] font-bold uppercase">Active Converters</div>
          <div className="text-xl font-black text-primary">1,840</div>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Blasting Registers</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map(cmp => (
            <motion.div 
              layout
              key={cmp.id} 
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{cmp.title}</h4>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1">
                      <span className="bg-muted text-foreground font-black border border-border rounded px-1.5 py-0.5 flex items-center gap-1">
                        {getIcon(cmp.channel)} {cmp.channel}
                      </span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cmp.recipientsCount.toLocaleString()} Receivers</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 border rounded uppercase tracking-wide shrink-0",
                    cmp.status === 'Sent' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    cmp.status === 'Scheduled' ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    {cmp.status}
                  </span>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg border border-border/30 text-xs text-foreground italic font-medium leading-relaxed">
                  "{cmp.messageTemplate}"
                </div>
              </div>

              <div className="border-t border-border pt-3 text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> 
                <span>Execution Target: <strong className="text-foreground">{new Date(cmp.scheduledFor).toLocaleString()}</strong></span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Drawer */}
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
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Send className="h-5 w-5 text-primary" /> Create Campaign
                </h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Campaign Context Title *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Routine Monthly Reminders"
                    className="w-full p-2 border border-input text-sm rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Target Blast Channel *</label>
                  <select
                    className="w-full p-2 border border-input text-sm rounded bg-card"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                  >
                    <option value="WhatsApp">WhatsApp Business</option>
                    <option value="SMS">Transactional SMS Relay</option>
                    <option value="Email">Cloud SMTP Email</option>
                    <option value="Push">Mobile FCM Push Notification</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold">Smart Template Editor *</label>
                    <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
                      <Sparkles className="h-3 w-3" /> Use {"{{name}}"} tag
                    </span>
                  </div>
                  <textarea 
                    required 
                    rows={4}
                    placeholder="Dear {{name}}, your diagnostic review..."
                    className="w-full p-2 border border-input text-sm rounded resize-none font-medium"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Recipients Pool Size *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 500"
                    className="w-full p-2 border border-input text-sm rounded font-bold"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Schedule Execute Offset</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-2 border border-input text-sm rounded"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Leave blank to dispatch instantly.</p>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-xs font-bold border border-border rounded">Cancel</button>
                  <button type="submit" className="px-6 py-2 text-xs bg-primary text-white font-black hover:bg-primary/90 flex items-center gap-1.5 rounded shadow">
                    <Send className="h-3.5 w-3.5" /> Initiate Broadcast
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
