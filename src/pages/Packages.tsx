import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { upsertPackage } from '../redux/slices/testSlice';
import { usePackagesQuery } from '@/hooks/useAdminQueries';
import { MedicalPackage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Layers, Edit2, Search, Activity, Check, X,
  Percent, Info, Save, ChevronDown, ChevronUp, Trash2,
  ClipboardList, HelpCircle,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../components/Toast';
import { packageService } from '../services/api';

interface PrepGuideline {
  id?: string;
  title: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

type DrawerTab = 'basic' | 'prep' | 'faq';

export const PackagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const tests = useAppSelector(state => state.tests.tests);
  const packages = useAppSelector(state => state.tests.packages);
  const { isLoading: pkgLoading } = usePackagesQuery();
  const [pageLoading, setPageLoading] = useState(pkgLoading);
  const { error, success } = useToast();

  useEffect(() => {
    if (!pkgLoading) setPageLoading(false);
  }, [pkgLoading]);

  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MedicalPackage | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>('basic');
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [prepGuidelines, setPrepGuidelines] = useState<PrepGuideline[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(search.toLowerCase()) ||
    pkg.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName(''); setCode(''); setDescription('');
    setPrice(''); setDiscountedPrice('');
    setSelectedTestIds([]); setPrepGuidelines([]); setFaqs([]);
    setActiveTab('basic');
  };

  const openCreateDrawer = () => {
    setEditingPackage(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = async (pkg: MedicalPackage) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setCode(pkg.code);
    setDescription(pkg.description || '');
    setPrice(pkg.price.toString());
    setDiscountedPrice(pkg.discountedPrice?.toString() || '');
    setSelectedTestIds(pkg.testIds);
    setActiveTab('basic');
    setPrepGuidelines([]);
    setFaqs([]);
    setIsDrawerOpen(true);
    try {
      const full = await packageService.getPackageById(pkg.id);
      if (full.preparationGuidelines) setPrepGuidelines(full.preparationGuidelines);
      if (full.faqs) setFaqs(full.faqs);
    } catch {}
  };

  const handleToggleTest = (testId: string) => {
    setSelectedTestIds(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const calculateIndividualTotal = () =>
    selectedTestIds.reduce((sum, id) => {
      const t = tests.find(test => test.id === id);
      return sum + (t?.discountedPrice || t?.price || 0);
    }, 0);

  const addGuideline = () => {
    setPrepGuidelines(prev => [...prev, {
      title: '', description: '', displayOrder: prev.length + 1, isActive: true,
    }]);
  };

  const updateGuideline = (index: number, field: keyof PrepGuideline, value: any) => {
    setPrepGuidelines(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  const removeGuideline = (index: number) => {
    setPrepGuidelines(prev => prev.filter((_, i) => i !== index).map((g, i) => ({ ...g, displayOrder: i + 1 })));
  };

  const moveGuideline = (index: number, direction: 'up' | 'down') => {
    setPrepGuidelines(prev => {
      const arr = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= arr.length) return arr;
      [arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
      return arr.map((g, i) => ({ ...g, displayOrder: i + 1 }));
    });
  };

  const addFaq = () => {
    setFaqs(prev => [...prev, {
      question: '', answer: '', displayOrder: prev.length + 1, isActive: true,
    }]);
  };

  const updateFaq = (index: number, field: keyof FAQ, value: any) => {
    setFaqs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, displayOrder: i + 1 })));
  };

  const moveFaq = (index: number, direction: 'up' | 'down') => {
    setFaqs(prev => {
      const arr = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= arr.length) return arr;
      [arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
      return arr.map((f, i) => ({ ...f, displayOrder: i + 1 }));
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !price || selectedTestIds.length === 0) {
      error('Please fill in the required fields and select at least one test.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        code, name, description,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
        testsIncluded: selectedTestIds,
        preparationGuidelines: prepGuidelines,
        faqs,
      };

      let saved: any;
      if (editingPackage?.id) {
        saved = await packageService.updatePackage(editingPackage.id, payload);
      } else {
        saved = await packageService.createPackage(payload);
      }

      const newPkg: MedicalPackage = {
        id: saved.id || editingPackage?.id || `pkg-${Date.now()}`,
        code,
        name,
        description,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : undefined,
        testIds: selectedTestIds,
        status: editingPackage?.status || 'active',
      };
      dispatch(upsertPackage(newPkg));
      success(editingPackage ? 'Package updated successfully.' : 'Package created successfully.');
      setIsDrawerOpen(false);
    } catch (err) {
      error('Failed to save package. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getBundledTestNames = (pkg: MedicalPackage) =>
    pkg.testIds.map(tid => tests.find(t => t.id === tid)?.name).filter(Boolean).join(', ');

  if (pageLoading) {
    return (
      <div className="space-y-6 pb-10 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-96" />
          </div>
          <div className="h-9 bg-muted rounded-lg w-36" />
        </div>
        <div className="h-9 bg-muted rounded-lg w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 space-y-4 flex-1">
                <div className="h-5 bg-muted rounded w-40" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-20 bg-muted/50 rounded-lg w-full" />
              </div>
              <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Wellness Package Builder</h1>
          <p className="text-sm text-muted-foreground">Bundle diagnostics into complete health packages with preparation guidelines and FAQs.</p>
        </div>
        <button
          onClick={openCreateDrawer}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Construct Package
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter packages..."
          className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map(pkg => {
          const savings = pkg.discountedPrice ? pkg.price - pkg.discountedPrice : 0;
          const pct = savings > 0 ? Math.round((savings / pkg.price) * 100) : 0;
          return (
            <motion.div layout key={pkg.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden hover:border-primary/30 transition-all group flex flex-col">
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="bg-muted text-muted-foreground font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-border">{pkg.code}</span>
                    <h3 className="font-bold text-base text-foreground mt-1.5 group-hover:text-primary transition-colors">{pkg.name}</h3>
                  </div>
                  {pct > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                      <Percent className="h-2.5 w-2.5" /> {pct}% OFF
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {pkg.description || 'Comprehensive medical screenings bundled for complete health evaluation.'}
                </p>
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Bundled Tests ({pkg.testIds.length})
                  </div>
                  <div className="text-xs text-foreground bg-muted/50 p-3 rounded-lg max-h-20 overflow-y-auto font-medium leading-relaxed scrollbar-thin border border-border/30">
                    {getBundledTestNames(pkg) || 'No tests allocated.'}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                <div>
                  {pkg.discountedPrice ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-black text-primary">₹{pkg.discountedPrice}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{pkg.price}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-black text-foreground">₹{pkg.price}</span>
                  )}
                </div>
                <button
                  onClick={() => openEditDrawer(pkg)}
                  className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary bg-card shadow-sm transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-background border-l border-border z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border bg-card flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-primary tracking-widest uppercase">Package Builder</div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingPackage ? 'Edit Package' : 'Create Package'}
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              <div className="flex border-b border-border bg-card">
                {([
                  { key: 'basic', label: 'Basic Info', icon: Activity },
                  { key: 'prep', label: 'Preparation', icon: ClipboardList },
                  { key: 'faq', label: 'FAQs', icon: HelpCircle },
                ] as { key: DrawerTab; label: string; icon: any }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold transition-colors border-b-2',
                      activeTab === tab.key
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                {activeTab === 'basic' && (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-bold text-foreground">Package Name *</label>
                        <input
                          required type="text" placeholder="e.g. Full Body Health Checkup"
                          className="w-full p-2.5 bg-card border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          value={name} onChange={e => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Billing Code *</label>
                        <input
                          required type="text" placeholder="e.g. PKG-FBHC"
                          className="w-full p-2.5 bg-card border border-input rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase"
                          value={code} onChange={e => setCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Description</label>
                        <input
                          type="text" placeholder="Short description..."
                          className="w-full p-2.5 bg-card border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          value={description} onChange={e => setDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 border border-border bg-card rounded-xl p-4">
                      <label className="text-xs font-black text-primary uppercase flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" /> Select Tests ({selectedTestIds.length} selected)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                        {tests.map(test => {
                          const picked = selectedTestIds.includes(test.id);
                          return (
                            <button
                              type="button" key={test.id}
                              onClick={() => handleToggleTest(test.id)}
                              className={cn(
                                'p-2.5 text-left border rounded-lg text-xs transition-all flex justify-between items-center',
                                picked ? 'bg-primary/5 border-primary font-bold text-primary' : 'border-border hover:border-primary/40 bg-background text-foreground'
                              )}
                            >
                              <span className="truncate max-w-[160px]">{test.name}</span>
                              {picked ? <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> : <span className="text-[10px] text-muted-foreground shrink-0">₹{test.discountedPrice || test.price}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted/50 border border-border rounded-xl p-4">
                      <div className="flex justify-between items-center pb-2 border-b border-border text-xs text-muted-foreground">
                        <span>Individual test total:</span>
                        <span className="font-bold text-foreground">₹{calculateIndividualTotal()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Base Price *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                            <input required type="number" placeholder="1200"
                              className="w-full pl-7 p-2.5 bg-card border border-input rounded-lg text-sm font-bold outline-none"
                              value={price} onChange={e => setPrice(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-emerald-700">Offer Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm">₹</span>
                            <input type="number" placeholder="999"
                              className="w-full pl-7 p-2.5 bg-card border border-emerald-200 text-emerald-700 rounded-lg text-sm font-bold outline-none"
                              value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      {price && parseFloat(price) > calculateIndividualTotal() && calculateIndividualTotal() > 0 && (
                        <div className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] p-2.5 rounded-lg flex gap-2">
                          <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>Package price is higher than buying tests individually (₹{calculateIndividualTotal()}).</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'prep' && (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">Preparation Guidelines</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Step-by-step instructions shown to patients before collection.</p>
                      </div>
                      <button
                        type="button" onClick={addGuideline}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Step
                      </button>
                    </div>

                    {prepGuidelines.length === 0 && (
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No preparation guidelines yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "Add Step" to create the first guideline.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {prepGuidelines.map((g, index) => (
                        <div key={index} className="border border-border rounded-xl p-4 bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">Step {index + 1}</span>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveGuideline(index, 'up')} disabled={index === 0}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => moveGuideline(index, 'down')} disabled={index === prepGuidelines.length - 1}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => updateGuideline(index, 'isActive', !g.isActive)}
                                className={cn('px-2 py-0.5 rounded text-[10px] font-bold border transition-colors',
                                  g.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-muted border-border text-muted-foreground')}>
                                {g.isActive ? 'Active' : 'Disabled'}
                              </button>
                              <button type="button" onClick={() => removeGuideline(index)}
                                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text" placeholder="Step title (e.g. Fasting Required)"
                              className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium"
                              value={g.title} onChange={e => updateGuideline(index, 'title', e.target.value)}
                            />
                            <textarea
                              placeholder="Detailed description of this preparation step..."
                              rows={2}
                              className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                              value={g.description} onChange={e => updateGuideline(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">Frequently Asked Questions</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Common patient questions shown in the FAQ section of this package.</p>
                      </div>
                      <button
                        type="button" onClick={addFaq}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add FAQ
                      </button>
                    </div>

                    {faqs.length === 0 && (
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "Add FAQ" to create the first question.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {faqs.map((f, index) => (
                        <div key={index} className="border border-border rounded-xl p-4 bg-card space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">FAQ {index + 1}</span>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveFaq(index, 'up')} disabled={index === 0}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => moveFaq(index, 'down')} disabled={index === faqs.length - 1}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => updateFaq(index, 'isActive', !f.isActive)}
                                className={cn('px-2 py-0.5 rounded text-[10px] font-bold border transition-colors',
                                  f.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-muted border-border text-muted-foreground')}>
                                {f.isActive ? 'Active' : 'Disabled'}
                              </button>
                              <button type="button" onClick={() => removeFaq(index)}
                                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text" placeholder="Question (e.g. Is fasting required?)"
                              className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium"
                              value={f.question} onChange={e => updateFaq(index, 'question', e.target.value)}
                            />
                            <textarea
                              placeholder="Answer..."
                              rows={3}
                              className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                              value={f.answer} onChange={e => updateFaq(index, 'answer', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 p-6 border-t border-border bg-card">
                  <button type="button" onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs flex items-center gap-1 shadow-sm disabled:opacity-60">
                    {isSaving ? <span className="animate-spin">↻</span> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Package'}
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