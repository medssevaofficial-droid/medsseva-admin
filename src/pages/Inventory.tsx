import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { recordTransaction } from '../redux/slices/inventorySlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Boxes, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Calendar, 
  ShieldAlert,
  X,
  Check,
  PackageSearch,
  ClipboardList
} from 'lucide-react';
import { cn } from '../utils/cn';

export const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reagents, consumables, transactions } = useAppSelector(state => state.inventory);
  const { user } = useAppSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState<'reagents' | 'consumables'>('reagents');
  const [isOpen, setIsOpen] = useState(false);

  // Manual Stock Modals fields
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'Inward' | 'Outward'>('Inward');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const lowStockReagents = reagents.filter(r => r.status === 'Low Stock' || r.status === 'Out of Stock');
  const lowStockConsumables = consumables.filter(c => c.status === 'Low Stock' || c.status === 'Out of Stock');
  const totalLowItems = lowStockReagents.length + lowStockConsumables.length;

  const handleSubmitOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || quantity <= 0) return;

    let itemName = '';
    const foundReg = reagents.find(r => r.id === itemId);
    const foundCon = consumables.find(c => c.id === itemId);
    if (foundReg) itemName = foundReg.name;
    else if (foundCon) itemName = foundCon.name;

    dispatch(recordTransaction({
      itemId,
      itemName,
      type,
      quantity,
      performedBy: user?.name || 'Manual Administrator',
      reference,
      notes: notes || undefined
    }));

    // Clear & Reset
    setIsOpen(false);
    setItemId('');
    setQuantity(1);
    setReference('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="h-7 w-7 text-teal-600" /> Reagents & Consumables Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Tightly coupled logistics manager mapping clinical diagnostics runs to laboratory asset pools automatically.
          </p>
        </div>

        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-[#006D6F] hover:bg-[#004B4D] text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-md"
        >
          <Plus className="h-4 w-4" /> Record Stock Audit
        </button>
      </div>

      {/* Alert Warning strip for investor preview */}
      {totalLowItems > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start text-amber-800">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 animate-bounce" />
          <div>
            <div className="text-sm font-extrabold tracking-tight uppercase">Low Laboratory Capacity Alert</div>
            <p className="text-xs font-medium opacity-90 mt-0.5">
              There are {totalLowItems} critical chemical packs/vials nearing depletion limiters. Perform outward PO releases to prevent TAT lag.
            </p>
          </div>
        </div>
      )}

      {/* Grid stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-teal-50 rounded-bl-[50px] flex items-center justify-center">
            <Boxes className="h-6 w-6 text-teal-600 mr-[-10px] mt-[-10px]" />
          </div>
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Registered Reagents</h3>
          <div className="text-3xl font-black text-foreground mt-2">{reagents.length} <span className="text-xs text-muted-foreground font-bold">Chemical Skus</span></div>
          <div className="text-[10px] font-bold text-teal-600 bg-teal-50 w-max px-2 py-0.5 rounded mt-3">Tightly Coupled with CBC / HbA1c Runs</div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-50 rounded-bl-[50px] flex items-center justify-center">
            <PackageSearch className="h-6 w-6 text-indigo-600 mr-[-10px] mt-[-10px]" />
          </div>
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Active Consumables</h3>
          <div className="text-3xl font-black text-foreground mt-2">{consumables.length} <span className="text-xs text-muted-foreground font-bold">Pack Items</span></div>
          <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-max px-2 py-0.5 rounded mt-3">Vials, Needle Gauges & Microswabs</div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-50 rounded-bl-[50px] flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-[-10px] mt-[-10px]" />
          </div>
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Restock Thresholds</h3>
          <div className="text-3xl font-black text-amber-600 mt-2">{totalLowItems} <span className="text-xs text-muted-foreground font-bold">Breached</span></div>
          <div className="text-[10px] font-bold text-amber-600 bg-amber-50 w-max px-2 py-0.5 rounded mt-3">Auto-reorder triggers pending</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* 📃 LEFT CONTENT: Item Matrix Tables */}
        <div className="xl:col-span-8 bg-card border rounded-2xl overflow-hidden shadow-sm">
          {/* Section tabs */}
          <div className="flex border-b bg-muted/30 select-none">
            <button 
              onClick={() => setActiveTab('reagents')}
              className={cn(
                "px-6 py-4 text-xs font-black border-b-2 tracking-wider uppercase transition-all flex items-center gap-2",
                activeTab === 'reagents' ? "border-[#006D6F] text-[#006D6F] bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Boxes className="h-4 w-4" /> 1. Reagents Matrix
            </button>
            <button 
              onClick={() => setActiveTab('consumables')}
              className={cn(
                "px-6 py-4 text-xs font-black border-b-2 tracking-wider uppercase transition-all flex items-center gap-2",
                activeTab === 'consumables' ? "border-[#006D6F] text-[#006D6F] bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <PackageSearch className="h-4 w-4" /> 2. Phlebotomy Consumables
            </button>
          </div>

          {/* Table Renderer */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b">
                {activeTab === 'reagents' ? (
                  <tr>
                    <th className="px-6 py-3">Reagent Sku</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Available Stock</th>
                    <th className="px-6 py-3">Expiry Node</th>
                    <th className="px-6 py-3">Threshold Class</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-3">Consumable Item</th>
                    <th className="px-6 py-3">Unit Type</th>
                    <th className="px-6 py-3 text-right">Global Stock</th>
                    <th className="px-6 py-3">Min Threshold</th>
                    <th className="px-6 py-3">Capacity Status</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y text-xs font-medium">
                {activeTab === 'reagents' ? (
                  reagents.map(r => (
                    <tr key={r.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-800">{r.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{r.code} • {r.supplierName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{r.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-extrabold font-mono text-slate-800">{r.currentStock}</span>
                        <span className="text-[10px] font-black text-slate-400 ml-1">{r.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {r.expiryDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                          r.status === 'In Stock' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                        )}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  consumables.map(c => (
                    <tr key={c.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-800">{c.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{c.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">{c.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-extrabold font-mono text-slate-800">{c.currentStock}</span>
                        <span className="text-[10px] font-black text-slate-400 ml-1">{c.unit}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-500">
                        {c.minThreshold} {c.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                          c.status === 'In Stock' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🕒 RIGHT CONTENT: Active Audit Trail logs */}
        <div className="xl:col-span-4 bg-card border rounded-2xl p-5 shadow-sm flex flex-col h-[500px]">
          <h3 className="text-sm font-black flex items-center gap-2 border-b pb-3 uppercase tracking-wider text-slate-700 mb-3">
            <History className="h-4 w-4 text-slate-500" /> Stock Action Log
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
            {transactions.map(tx => (
              <div key={tx.id} className="border rounded-xl p-3 flex gap-3 items-start bg-muted/20">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5",
                  tx.type === 'Inward' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
                )}>
                  {tx.type === 'Inward' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div className="text-xs font-black text-slate-800 truncate">{tx.itemName}</div>
                    <div className="text-[10px] font-black text-slate-500 whitespace-nowrap">
                      {tx.type === 'Inward' ? '+' : '-'}{tx.quantity}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase truncate">Ref: {tx.reference}</p>
                  {tx.notes && <p className="text-[10px] font-medium italic text-slate-600 mt-1 leading-relaxed">"{tx.notes}"</p>}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="text-[8px] font-black bg-white text-slate-500 border px-1.5 py-0.5 rounded uppercase">{tx.performedBy}</span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECORD ACTION MODAL DIALOGUE */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950 z-[90] cursor-pointer backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto h-max max-w-lg w-full bg-background rounded-2xl border border-border z-[100] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-[#006D6F] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-teal-100" />
                  <h3 className="text-base font-black tracking-tight">Manual Stock Operation Audit</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded text-teal-100"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmitOperation} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black">Transaction Logic</label>
                    <div className="flex bg-muted p-1 rounded-lg gap-1">
                      <button 
                        type="button" 
                        onClick={() => setType('Inward')}
                        className={cn("flex-1 py-1.5 text-center rounded-md text-xs font-black shadow-sm transition-all", type === 'Inward' ? "bg-[#006D6F] text-white" : "text-slate-500 hover:text-slate-700")}
                      >
                        Inward (Restock)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setType('Outward')}
                        className={cn("flex-1 py-1.5 text-center rounded-md text-xs font-black shadow-sm transition-all", type === 'Outward' ? "bg-rose-600 text-white" : "text-slate-500 hover:text-slate-700")}
                      >
                        Outward (Defect)
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black">Operation Quantity *</label>
                    <input 
                      required 
                      type="number" 
                      min={1} 
                      className="w-full p-2 border text-sm rounded font-mono"
                      value={quantity}
                      onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black">Target Inventory Sku *</label>
                  <select 
                    required 
                    className="w-full p-2 border text-sm rounded bg-card font-medium"
                    value={itemId}
                    onChange={e => setItemId(e.target.value)}
                  >
                    <option value="">-- Select Laboratory Asset --</option>
                    <optgroup label="Chemical Reagent Packs">
                      {reagents.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.currentStock} kits available)</option>
                      ))}
                    </optgroup>
                    <optgroup label="Consumables & Vials">
                      {consumables.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.currentStock} units available)</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black">System Reference Key</label>
                  <input 
                    type="text" 
                    placeholder="e.g., PO-82739, Report Code"
                    className="w-full p-2 border text-sm rounded"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black">Audit Log Description / Narrative</label>
                  <textarea 
                    className="w-full p-2 border text-sm rounded min-h-[70px]"
                    placeholder="Provide internal justification notes for outward defects or inward audits..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-xs border font-bold rounded">Cancel</button>
                  <button type="submit" className="px-6 py-2 text-xs bg-[#006D6F] text-white font-black rounded flex items-center gap-1 shadow hover:bg-[#004B4D]">
                    <Check className="h-4 w-4" /> Commit Changes
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
