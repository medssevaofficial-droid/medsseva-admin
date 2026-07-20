import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { upsertBanner, updateAppConfig, deleteBanner } from '../redux/slices/cmsSlice';
import { Banner } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Plus, 
  Link as LinkIcon, 
  ToggleLeft, 
  ToggleRight, 
  Layers,
  X,
  Save,
  Smartphone,
  Settings,
  AlertTriangle,
  LayoutDashboard,
  Eye,
  Grid,
  Trash
} from 'lucide-react';
import { cn } from '../utils/cn';
import { MobileAppSimulator } from '../components/MobileAppSimulator';

export const CMSPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { banners, appConfig } = useAppSelector(state => state.cms);
  
  const [activeTab, setActiveTab] = useState<'layout' | 'banners' | 'toggles' | 'emergency'>('layout');

  // Local state for adding banner
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerLinkType, setBannerLinkType] = useState<'Test' | 'Package' | 'Category' | 'External'>('Package');
  const [bannerLinkValue, setBannerLinkValue] = useState('');

  // Emergency Alerts state local cache
  const [emergTitle, setEmergTitle] = useState(appConfig.emergencyAlert.title);
  const [emergMsg, setEmergMsg] = useState(appConfig.emergencyAlert.message);
  const [emergType, setEmergType] = useState(appConfig.emergencyAlert.type);
  const [emergActive, setEmergActive] = useState(appConfig.emergencyAlert.isActive);

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImageUrl) return;

    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      title: bannerTitle,
      imageUrl: bannerImageUrl,
      linkType: bannerLinkType,
      linkValue: bannerLinkValue || undefined,
      isActive: true,
      sortOrder: banners.length + 1
    };

    dispatch(upsertBanner(newBanner));
    setIsDrawerOpen(false);
    setBannerTitle('');
    setBannerImageUrl('');
    setBannerLinkValue('');
  };

  const handleToggleBanner = (banner: Banner) => {
    dispatch(upsertBanner({ ...banner, isActive: !banner.isActive }));
  };

  const handleDeleteBanner = (id: string) => {
    dispatch(deleteBanner(id));
  };

  const handleUpdateToggles = (key: keyof typeof appConfig.featureToggles, val: boolean) => {
    dispatch(updateAppConfig({
      featureToggles: {
        ...appConfig.featureToggles,
        [key]: val
      }
    }));
  };

  const saveEmergency = () => {
    dispatch(updateAppConfig({
      emergencyAlert: {
        isActive: emergActive,
        title: emergTitle,
        message: emergMsg,
        type: emergType
      }
    }));
  };

  const toggleSection = (sectionKey: string) => {
    const active = appConfig.layoutSections.includes(sectionKey);
    let newSections: string[];
    if (active) {
      newSections = appConfig.layoutSections.filter(s => s !== sectionKey);
    } else {
      newSections = [...appConfig.layoutSections, sectionKey];
    }
    dispatch(updateAppConfig({ layoutSections: newSections }));
  };

  const reorderCategory = (index: number, direction: 'up' | 'down') => {
    const cats = [...appConfig.categoriesPriority];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cats.length) return;
    
    const temp = cats[index];
    cats[index] = cats[targetIdx];
    cats[targetIdx] = temp;
    
    dispatch(updateAppConfig({ categoriesPriority: cats }));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Smartphone className="h-7 w-7 text-teal-600" /> App Control Center & Dynamic CMS
        </h1>
        <p className="text-sm text-muted-foreground">
          Fully command your customer mobile application layout, priority scans, banner cycles, and feature deployments instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* 🖥️ LEFT PANE: Controls Interface (8 cols) */}
        <div className="xl:col-span-8 space-y-6 bg-card border rounded-2xl p-6 shadow-sm">
          
          {/* Top tabs row */}
          <div className="flex overflow-x-auto gap-2 p-1 bg-muted rounded-xl w-max select-none border">
            <button
              onClick={() => setActiveTab('layout')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all",
                activeTab === 'layout' ? "bg-background shadow text-teal-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" /> Home Layout
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all",
                activeTab === 'banners' ? "bg-background shadow text-teal-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ImageIcon className="h-4 w-4" /> Banners
            </button>
            <button
              onClick={() => setActiveTab('toggles')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all",
                activeTab === 'toggles' ? "bg-background shadow text-teal-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" /> Feature Flags
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all",
                activeTab === 'emergency' ? "bg-background shadow text-rose-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertTriangle className="h-4 w-4" /> Emergency Alert
            </button>
          </div>

          {/* Tab Content Wrapper */}
          <div className="mt-4 pt-4 border-t">
            <AnimatePresence mode="wait">
              {/* 🧬 LAYOUT BUILDER TAB */}
              {activeTab === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-wider">
                      <Layers className="h-4 w-4 text-teal-600" /> 1. Active Home Sections
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Check the slots below to inject or suppress blocks from the mobile homepage viewport.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'hero_banner', label: 'Hero Image Carousel' },
                        { id: 'quick_categories', label: 'Dynamic Quick Categories' },
                        { id: 'seva_check', label: 'SevaCheck Premium Strip' },
                        { id: 'health_campaigns', label: 'Active Health Campaigns' },
                        { id: 'trending_packages', label: 'Trending Analytics Packages' },
                        { id: 'ai_health_tips', label: 'AI Health Insights Tip Strip' }
                      ].map(sec => {
                        const isEnabled = appConfig.layoutSections.includes(sec.id);
                        return (
                          <div 
                            key={sec.id} 
                            onClick={() => toggleSection(sec.id)}
                            className={cn(
                              "p-3.5 border-2 rounded-xl flex justify-between items-center cursor-pointer hover:scale-[1.01] transition-all",
                              isEnabled ? "border-teal-100 bg-teal-50/40" : "border-border bg-muted/30 opacity-60"
                            )}
                          >
                            <span className="text-xs font-black">{sec.label}</span>
                            {isEnabled ? (
                              <div className="h-5 w-9 bg-teal-600 rounded-full p-0.5 flex justify-end"><div className="h-4 w-4 bg-white rounded-full" /></div>
                            ) : (
                              <div className="h-5 w-9 bg-slate-300 rounded-full p-0.5 flex justify-start"><div className="h-4 w-4 bg-white rounded-full" /></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-wider border-t pt-6">
                      <Grid className="h-4 w-4 text-indigo-600" /> 2. Quick Category Priority Sorting
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Arrange category buttons for faster click rates. Changes re-sort the iPhone shell grid instantly.</p>
                    
                    <div className="space-y-2 bg-muted/30 rounded-xl p-3 border">
                      {appConfig.categoriesPriority.map((cat, index) => (
                        <div key={cat} className="flex justify-between items-center p-2.5 bg-card border rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="h-5 w-5 bg-muted rounded flex items-center justify-center text-[10px] font-black text-muted-foreground">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-foreground">{cat}</span>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              disabled={index === 0}
                              onClick={() => reorderCategory(index, 'up')}
                              className="p-1 hover:bg-muted border rounded disabled:opacity-30 text-xs font-black text-slate-600"
                            >
                              ▲
                            </button>
                            <button 
                              disabled={index === appConfig.categoriesPriority.length - 1}
                              onClick={() => reorderCategory(index, 'down')}
                              className="p-1 hover:bg-muted border rounded disabled:opacity-30 text-xs font-black text-slate-600"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 🖼️ BANNERS TAB */}
              {activeTab === 'banners' && (
                <motion.div
                  key="banners"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-black uppercase">Mobile Banner Pool</h3>
                    <button 
                      onClick={() => setIsDrawerOpen(true)}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-teal-700"
                    >
                      <Plus className="h-3.5 w-3.5" /> Create Banner
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {banners.map(banner => (
                      <div key={banner.id} className={cn("border rounded-xl overflow-hidden flex flex-col", banner.isActive ? "" : "opacity-60 border-dashed")}>
                        <div className="h-24 relative bg-slate-100">
                          <img src={banner.imageUrl} alt={banner.title || 'Banner image'} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button 
                              onClick={() => handleToggleBanner(banner)}
                              className="h-6 w-6 rounded bg-white/90 flex items-center justify-center text-slate-700 border border-slate-200 shadow"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="h-6 w-6 rounded bg-rose-500 text-white flex items-center justify-center shadow"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3 bg-card border-t">
                          <h4 className="text-xs font-extrabold truncate">{banner.title}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                            <LinkIcon className="h-3 w-3" /> 
                            <span>{banner.linkType}: {banner.linkValue || 'Root'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ⚙️ FEATURE TOGGLES TAB */}
              {activeTab === 'toggles' && (
                <motion.div
                  key="toggles"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-black uppercase border-b pb-2">App Feature Toggles (A/B Deployments)</h3>
                  
                  {[
                    { key: 'enableOnlineConsultations', label: 'Online Doctor Consultation', desc: 'Show video calling interface and slot selectors.' },
                    { key: 'enableAiSymptomsChat', label: 'MedsSeva Symptoms Chatbot Bubble', desc: 'Inject floating Sparkles AI chat portal at bottom right.' },
                    { key: 'enableReportsWallet', label: 'Central Reports Locker Wallet', desc: 'Provides patient wallet key storage top nav button.' },
                    { key: 'enableUrgentCollection', label: 'Urgent Dispatch Premium Button', desc: 'Allows patient to pay premium ₹200 fee for instant phlebotomy dispatch.' }
                  ].map(flag => {
                    const isEnabled = appConfig.featureToggles[flag.key as keyof typeof appConfig.featureToggles];
                    return (
                      <div key={flag.key} className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                          <div className="text-xs font-black text-foreground">{flag.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{flag.desc}</div>
                        </div>
                        <button onClick={() => handleUpdateToggles(flag.key as any, !isEnabled)}>
                          {isEnabled ? <ToggleRight className="h-8 w-8 text-teal-600" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* 🚨 EMERGENCY TAB */}
              {activeTab === 'emergency' && (
                <motion.div
                  key="emergency"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 text-rose-800 mb-4">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <div className="text-xs font-black">Emergency Broadcasting Protocol</div>
                      <div className="text-[10px] opacity-90 mt-0.5">Publishes a forced global marquee banner directly below the mobile app header bar. Use for lab capacity limiters or regional health warnings.</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border p-3 bg-card rounded-lg">
                      <label className="text-xs font-bold">Broadcast Announcement Active</label>
                      <button onClick={() => setEmergActive(!emergActive)}>
                        {emergActive ? <ToggleRight className="h-8 w-8 text-rose-600" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Banner Title / Severity Flag</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded text-xs font-medium"
                        value={emergTitle}
                        onChange={e => setEmergTitle(e.target.value)}
                        placeholder="e.g., WEATHER ALERT"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Dynamic Narrative Message</label>
                      <textarea 
                        className="w-full p-2 border rounded text-xs min-h-[80px]"
                        value={emergMsg}
                        onChange={e => setEmergMsg(e.target.value)}
                        placeholder="Describe instructions..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Theme Severity Class</label>
                      <select 
                        className="w-full p-2 border rounded text-xs bg-card"
                        value={emergType}
                        onChange={e => setEmergType(e.target.value as any)}
                      >
                        <option value="info">Info Blue</option>
                        <option value="warning">Warning Amber</option>
                        <option value="critical">Critical Rose</option>
                      </select>
                    </div>

                    <button 
                      onClick={saveEmergency}
                      className="w-full py-2.5 bg-[#006D6F] text-white text-xs font-black rounded-lg flex items-center justify-center gap-1 shadow hover:bg-[#004B4D]"
                    >
                      <Save className="h-4 w-4" /> Deploy Broadcast Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 📱 RIGHT PANE: Interactive Phone Frame (4 cols, sticky) */}
        <div className="xl:col-span-4 sticky top-6 bg-gradient-to-b from-slate-50 to-slate-100 border rounded-2xl p-2 flex flex-col items-center shadow-sm">
          <div className="text-center p-2 w-full border-b border-slate-200 bg-white rounded-t-xl">
            <div className="text-[10px] font-black tracking-wider uppercase text-slate-500 flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Simulation Render
            </div>
          </div>
          <MobileAppSimulator />
          <div className="text-[9px] text-slate-400 italic p-2 text-center">
            Concepts automatically render to client app preview in real-time.
          </div>
        </div>
      </div>

      {/* Add Drawer for creating a banner */}
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
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Create Home Banner
                </h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSaveBanner} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Banner Label/Title *</label>
                  <input required type="text" placeholder="e.g. Monsoon Check 20% OFF" className="w-full p-2 border border-input text-sm rounded" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">Absolute Image URL *</label>
                  <input required type="url" placeholder="https://images.unsplash.com/..." className="w-full p-2 border border-input text-sm rounded" value={bannerImageUrl} onChange={e => setBannerImageUrl(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">Target Navigation Map</label>
                  <select className="w-full p-2 border border-input text-sm rounded bg-card" value={bannerLinkType} onChange={e => setBannerLinkType(e.target.value as any)}>
                    <option value="Package">Diagnostic Package</option>
                    <option value="Test">Single Medical Test</option>
                    <option value="Category">Clinical Category</option>
                    <option value="External">External Hyperlink</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold">Navigation Key Value</label>
                  <input type="text" placeholder="e.g. pkg-2" className="w-full p-2 border border-input text-sm rounded" value={bannerLinkValue} onChange={e => setBannerLinkValue(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-6 border-t border-border mt-auto">
                  <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-xs font-bold border border-border rounded">Cancel</button>
                  <button type="submit" className="px-6 py-2 text-xs bg-[#006D6F] text-white font-black flex items-center gap-1 rounded shadow">
                    <Save className="h-4 w-4" /> Push Live
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
