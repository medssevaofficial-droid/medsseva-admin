import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { updateBookingStatus } from '../redux/slices/bookingSlice';
import { Booking, SampleCondition } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Beaker, 
  Clock, 
  ArrowUpRight, 
  CheckSquare,
  Thermometer,
  Layers,
  Search,
  ShieldAlert,
  FlaskConical,
  X,
  Activity,
  FileCheck,
  RefreshCw
} from 'lucide-react';

export const SamplesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(state => state.bookings.bookings);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Accession states
  const [accessionNo, setAccessionNo] = useState('');
  const [condition, setCondition] = useState<SampleCondition>('Good');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const activeQueue = bookings.filter(b => 
    ['Collected', 'Received', 'Accessioned', 'Processing'].includes(b.status) &&
    (b.bookingCode.toLowerCase().includes(search.toLowerCase()) || 
     b.patient.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getBookingSamples = (booking: Booking) => {
    const sampleSet = new Set<string>();
    booking.tests.forEach(t => { if (t.sampleType) sampleSet.add(t.sampleType); });
    booking.packages.forEach(() => { sampleSet.add('Blood (EDTA Tube)'); });
    return Array.from(sampleSet).length > 0 ? Array.from(sampleSet) : ['Blood (EDTA Tube)'];
  };

  const handleOpenIntake = (b: Booking) => {
    setSelectedBooking(b);
    // Generate mock clinical Accession No
    setAccessionNo(`ACC-${Math.floor(100000 + Math.random() * 900000)}`);
    setCondition('Good');
    setRejectionNotes('');
  };

  const processAccession = (action: 'approve' | 'reject') => {
    if (!selectedBooking) return;

    if (action === 'approve') {
      // Phase transition: Collected -> Accessioned
      dispatch(updateBookingStatus({
        id: selectedBooking.id,
        status: 'Accessioned',
        // Real apps would store sampleDetails in redux state, simulate by status mapping
      }));
    } else {
      // Rejection state
      dispatch(updateBookingStatus({
        id: selectedBooking.id,
        status: 'Sample Rejected'
      }));
    }

    setSelectedBooking(null);
  };

  const startCentrifugeAnalysis = (bookingId: string) => {
    dispatch(updateBookingStatus({ id: bookingId, status: 'Processing' }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-emerald-600" /> Advanced LIMS Sample Queue
          </h1>
          <p className="text-sm text-muted-foreground">Logistics checkpoint for accessioning, physical condition QC, and centrifuge testing flows.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Scan Tube Barcode..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-input text-xs font-bold shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lab Telemetry Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <div className="font-extrabold text-xs text-slate-700 tracking-wide uppercase">Centrifuge Intake Vault #3 Temp</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Safe Guard Protocol: 2°C – 8°C • Current: <span className="text-emerald-600 font-black">4.2°C</span></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2.5 py-1 rounded uppercase flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Refrigeration Node Active
          </div>
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2.5 py-1 rounded uppercase">
            Chain of Custody Secure
          </div>
        </div>
      </div>

      {/* 3 Column Kanban LIMS Track */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: INBOUND COLLECTED QUEUE */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm h-[650px] flex flex-col">
          <div className="bg-emerald-50/40 border-b p-4 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-emerald-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" /> 1. Inbound Intake
            </h3>
            <span className="h-5 px-2 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-full flex items-center justify-center border border-emerald-300">
              {activeQueue.filter(b => b.status === 'Collected').length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-slate-50/30">
            {activeQueue.filter(b => b.status === 'Collected').map(booking => (
              <motion.div 
                layoutId={`card-${booking.id}`}
                key={booking.id}
                className="bg-card border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-emerald-300 hover:scale-[1.01] transition-all cursor-pointer"
                onClick={() => handleOpenIntake(booking)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 truncate max-w-[160px]">{booking.patient.name}</h4>
                    <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{booking.bookingCode}</div>
                  </div>
                  <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                    Arrived
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {getBookingSamples(booking).map((sample, i) => (
                    <span key={i} className="text-[8px] bg-slate-100 text-slate-600 font-black px-1.5 py-0.5 rounded truncate max-w-full">
                      {sample}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                    <Clock className="h-3 w-3" /> 2h ago
                  </div>
                  <button className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-0.5">
                    Accession <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
            {activeQueue.filter(b => b.status === 'Collected').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl opacity-60 bg-white">
                <CheckSquare className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-bold text-slate-400">No pending inbound scan collections</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: ACCESSIONED READY QUEUE */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm h-[650px] flex flex-col">
          <div className="bg-indigo-50/40 border-b p-4 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-indigo-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" /> 2. Accession Queue
            </h3>
            <span className="h-5 px-2 bg-indigo-200 text-indigo-900 text-[10px] font-black rounded-full flex items-center justify-center border border-indigo-300">
              {activeQueue.filter(b => b.status === 'Accessioned').length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-slate-50/30">
            {activeQueue.filter(b => b.status === 'Accessioned').map(booking => (
              <motion.div 
                key={booking.id}
                className="bg-card border border-slate-200 rounded-xl p-3.5 shadow-sm border-l-4 border-l-indigo-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{booking.patient.name}</h4>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 mt-0.5">
                      <FileCheck className="h-3 w-3" /> Acc: AC-{(Math.random()*1000).toFixed(0)}-QC
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>

                <div className="mt-3 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-black px-2 py-1 rounded flex items-center gap-1">
                  <CheckSquare className="h-3 w-3 text-emerald-600" /> Condition Cleared: Good
                </div>

                <button 
                  onClick={() => startCentrifugeAnalysis(booking.id)}
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded flex items-center justify-center gap-1 shadow uppercase"
                >
                  <RefreshCw className="h-3 w-3" /> Spin Centrifuge
                </button>
              </motion.div>
            ))}
            {activeQueue.filter(b => b.status === 'Accessioned').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl opacity-60 bg-white">
                <FileCheck className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-bold text-slate-400">Queue is clear. Centrifuge empty.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: PROCESSING / IN TESTING MACHINE */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm h-[650px] flex flex-col">
          <div className="bg-sky-50/40 border-b p-4 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-sky-900 flex items-center gap-2">
              <Beaker className="h-4 w-4 text-sky-600" /> 3. In Analyzer
            </h3>
            <span className="h-5 px-2 bg-sky-200 text-sky-900 text-[10px] font-black rounded-full flex items-center justify-center border border-sky-300">
              {activeQueue.filter(b => b.status === 'Processing').length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-slate-50/30">
            {activeQueue.filter(b => b.status === 'Processing').map(booking => (
              <motion.div 
                key={booking.id}
                className="bg-card border border-slate-200 rounded-xl p-3.5 shadow-sm border-l-4 border-l-sky-500 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-sky-100 overflow-hidden">
                  <div className="h-full bg-sky-600 animate-shimmer w-1/2 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                </div>

                <div className="flex justify-between items-start mt-1">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{booking.patient.name}</h4>
                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">{booking.bookingCode}</div>
                  </div>
                  <span className="text-[8px] font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Testing
                  </span>
                </div>

                <div className="mt-3 p-2 bg-sky-50/50 border border-sky-100 rounded-lg flex items-center gap-2">
                  <span className="animate-spin h-3 w-3 border-2 border-sky-600 border-t-transparent rounded-full" />
                  <span className="text-[9px] font-extrabold text-sky-800">Analyzing Hematology Vials...</span>
                </div>

                <a 
                  href="/report-builder" 
                  className="w-full mt-4 py-1.5 border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-slate-700 text-[9px] font-black rounded flex items-center justify-center gap-1 transition-all uppercase"
                >
                  Enter Derived Data <ArrowUpRight className="h-3 w-3" />
                </a>
              </motion.div>
            ))}
            {activeQueue.filter(b => b.status === 'Processing').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl opacity-60 bg-white">
                <Beaker className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-bold text-slate-400">No samples in wet analyzer machinery</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LOG ACCESSION INTAKE MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-slate-950 z-[90] cursor-pointer backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto h-max max-w-lg w-full bg-background rounded-2xl border border-border z-[100] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-emerald-700 text-white p-5 flex justify-between items-center border-b border-emerald-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-100" />
                  <h3 className="text-base font-black tracking-tight uppercase">Scan Reception Node</h3>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="hover:bg-white/10 p-1 rounded text-emerald-100"><X className="h-5 w-5" /></button>
              </div>

              <div className="p-6 space-y-5 bg-slate-50/20">
                <div className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Subject Profile</span>
                    <h4 className="text-sm font-black text-slate-800 leading-tight">{selectedBooking.patient.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500">{selectedBooking.patient.gender}, {selectedBooking.patient.age} Yrs</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Booking Key</span>
                    <div className="font-mono text-xs font-black text-slate-700">{selectedBooking.bookingCode}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Allocated Accession #</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border text-sm font-mono font-extrabold rounded bg-muted text-slate-600"
                      value={accessionNo}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">Visual Condition QC</label>
                    <select 
                      className="w-full p-2 border text-sm rounded bg-card font-bold"
                      value={condition}
                      onChange={e => setCondition(e.target.value as SampleCondition)}
                    >
                      <option value="Good">Good (Passed Inspection)</option>
                      <option value="Haemolysed">Haemolysed (Damaged Cells)</option>
                      <option value="Insufficient Quantity">Insufficient Quantity</option>
                      <option value="Leaked">Leaked Vial</option>
                    </select>
                  </div>
                </div>

                {/* If Sample damaged, force Rejection note entry */}
                {condition !== 'Good' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl"
                  >
                    <div className="flex items-center gap-1.5 text-rose-800">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs font-black uppercase">Strict Rejection Mandatory</span>
                    </div>
                    <p className="text-[10px] text-rose-700 opacity-90">This sample violates biological stability checks. You must reject it to auto-queue an urgent re-collection booking dispatch.</p>
                    <textarea 
                      className="w-full p-2 border border-rose-200 text-xs rounded text-rose-950 placeholder-rose-300 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                      placeholder="Record rejection rationale for audit history..."
                      value={rejectionNotes}
                      onChange={e => setRejectionNotes(e.target.value)}
                      required
                    />
                  </motion.div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-end gap-2 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4">
                  <button type="button" onClick={() => setSelectedBooking(null)} className="px-4 py-2 text-xs border font-extrabold rounded">Cancel</button>
                  {condition === 'Good' ? (
                    <button 
                      onClick={() => processAccession('approve')}
                      className="px-6 py-2 text-xs bg-emerald-700 text-white font-black rounded shadow-md hover:bg-emerald-800 flex items-center gap-1 uppercase"
                    >
                      <FileCheck className="h-4 w-4" /> Approve & Accession
                    </button>
                  ) : (
                    <button 
                      onClick={() => processAccession('reject')}
                      disabled={!rejectionNotes.trim()}
                      className="px-6 py-2 text-xs bg-rose-600 text-white font-black rounded shadow-md hover:bg-rose-700 flex items-center gap-1 uppercase disabled:opacity-50"
                    >
                      <ShieldAlert className="h-4 w-4" /> Reject Sample
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
