import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReagentItem, ConsumableItem, StockTransaction, StockStatus } from '../../types/inventory';

interface InventoryState {
  reagents: ReagentItem[];
  consumables: ConsumableItem[];
  transactions: StockTransaction[];
}

const MOCK_REAGENTS: ReagentItem[] = [
  {
    id: 'r-1',
    code: 'CBC-RGT-01',
    name: 'Hematology Sysmex CBC Reagent Pack',
    category: 'Hematology',
    currentStock: 24,
    minThreshold: 5,
    unit: 'Kits',
    pricePerUnit: 4500,
    expiryDate: '2026-10-15',
    status: 'In Stock',
    lastRestockedAt: '2026-05-01T10:00:00Z',
    supplierName: 'Sysmex Medical Corp'
  },
  {
    id: 'r-2',
    code: 'GLU-RGT-02',
    name: 'Glucose Enzymatic UV Reagent (Roche)',
    category: 'Biochemistry',
    currentStock: 4,
    minThreshold: 10,
    unit: 'Liters',
    pricePerUnit: 1200,
    expiryDate: '2026-07-20',
    status: 'Low Stock',
    lastRestockedAt: '2026-04-22T14:30:00Z',
    supplierName: 'Roche Diagnostics India'
  },
  {
    id: 'r-3',
    code: 'THY-RGT-03',
    name: 'Chemiluminescence Thyroid TSH Kit',
    category: 'Immunology',
    currentStock: 12,
    minThreshold: 3,
    unit: 'Kits',
    pricePerUnit: 8900,
    expiryDate: '2027-01-10',
    status: 'In Stock',
    lastRestockedAt: '2026-05-05T09:15:00Z',
    supplierName: 'Abbott Labs'
  }
];

const MOCK_CONSUMABLES: ConsumableItem[] = [
  {
    id: 'c-1',
    code: 'V-EDTA-4',
    name: 'EDTA K2 Lavender Top Tube (4ml)',
    type: 'Vial',
    currentStock: 1450,
    minThreshold: 300,
    unit: 'Units',
    status: 'In Stock',
    lastRestockedAt: '2026-04-28T11:20:00Z'
  },
  {
    id: 'c-2',
    code: 'V-SST-5',
    name: 'SST Gold Top Clot Activator Gel (5ml)',
    type: 'Vial',
    currentStock: 250,
    minThreshold: 300,
    unit: 'Units',
    status: 'Low Stock',
    lastRestockedAt: '2026-04-28T11:20:00Z'
  },
  {
    id: 'c-3',
    code: 'N-VAC-21',
    name: 'Vacutainer Multi-Sample Needle 21G',
    type: 'Needle',
    currentStock: 80,
    minThreshold: 150,
    unit: 'Units',
    status: 'Low Stock',
    lastRestockedAt: '2026-04-10T16:00:00Z'
  }
];

const MOCK_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'tx-inv-1',
    itemId: 'r-1',
    itemName: 'Hematology Sysmex CBC Reagent Pack',
    type: 'Inward',
    quantity: 10,
    performedBy: 'Aditya Verma',
    date: '2026-05-01T10:00:00Z',
    reference: 'PO-109324',
    notes: 'Monthly stock replenish'
  },
  {
    id: 'tx-inv-2',
    itemId: 'c-1',
    itemName: 'EDTA K2 Lavender Top Tube (4ml)',
    type: 'Outward',
    quantity: 50,
    performedBy: 'System Automatic',
    date: '2026-05-14T16:30:00Z',
    reference: 'Consolidated Dispatch #493',
    notes: 'Automatic Phlebotomy Bag Allocation'
  }
];

const initialState: InventoryState = {
  reagents: MOCK_REAGENTS,
  consumables: MOCK_CONSUMABLES,
  transactions: MOCK_TRANSACTIONS,
};

const updateStatus = (current: number, threshold: number): StockStatus => {
  if (current <= 0) return 'Out of Stock';
  if (current <= threshold) return 'Low Stock';
  return 'In Stock';
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    recordTransaction: (state, action: PayloadAction<Omit<StockTransaction, 'id' | 'date'>>) => {
      const newTx: StockTransaction = {
        ...action.payload,
        id: `tx-inv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString()
      };
      
      state.transactions.unshift(newTx);

      // Locate reagent
      const rIdx = state.reagents.findIndex(r => r.id === action.payload.itemId);
      if (rIdx !== -1) {
        const adjust = action.payload.type === 'Inward' ? action.payload.quantity : -action.payload.quantity;
        state.reagents[rIdx].currentStock = Math.max(0, state.reagents[rIdx].currentStock + adjust);
        state.reagents[rIdx].status = updateStatus(state.reagents[rIdx].currentStock, state.reagents[rIdx].minThreshold);
        if (action.payload.type === 'Inward') state.reagents[rIdx].lastRestockedAt = newTx.date;
        return;
      }

      // Locate consumable
      const cIdx = state.consumables.findIndex(c => c.id === action.payload.itemId);
      if (cIdx !== -1) {
        const adjust = action.payload.type === 'Inward' ? action.payload.quantity : -action.payload.quantity;
        state.consumables[cIdx].currentStock = Math.max(0, state.consumables[cIdx].currentStock + adjust);
        state.consumables[cIdx].status = updateStatus(state.consumables[cIdx].currentStock, state.consumables[cIdx].minThreshold);
        if (action.payload.type === 'Inward') state.consumables[cIdx].lastRestockedAt = newTx.date;
      }
    },
    consumeForTests: (state, action: PayloadAction<{ testIds: string[]; bookingCode: string }>) => {
      const { testIds, bookingCode } = action.payload;
      
      // System mapping rules:
      // CBC (t-1) -> consumes 1x EDTA Lavender Vial (c-1) + 0.05 Reagent Kits (r-1)
      // HbA1c (t-2) -> consumes 1x EDTA Lavender Vial (c-1)
      // Thyroid (t-3) / Lipid (t-4) -> consumes 1x SST Gold Vial (c-2)
      
      let edtaToConsume = 0;
      let sstToConsume = 0;
      let needlesToConsume = testIds.length > 0 ? 1 : 0; // 1 collection per run
      
      testIds.forEach(tid => {
        if (tid === 't-1') {
          edtaToConsume += 1;
          // Reagent deduction: (Integer pack reduction simulation - reduce 1 pack every 20 tests, or just decrement 1 unit if we represent vials)
          const reg = state.reagents.find(r => r.id === 'r-1');
          if (reg) {
            reg.currentStock = Math.max(0, reg.currentStock - 1);
            reg.status = updateStatus(reg.currentStock, reg.minThreshold);
            state.transactions.unshift({
              id: `tx-inv-auto-${Date.now()}-1`,
              itemId: 'r-1',
              itemName: reg.name,
              type: 'Outward',
              quantity: 1,
              performedBy: 'LIMS Engine',
              date: new Date().toISOString(),
              reference: bookingCode,
              notes: 'Automatic deduction for CBC Diagnostic run'
            });
          }
        } else if (tid === 't-2') {
          edtaToConsume += 1;
        } else if (tid === 't-3' || tid === 't-4') {
          sstToConsume += 1;
        }
      });

      if (edtaToConsume > 0) {
        const item = state.consumables.find(c => c.id === 'c-1');
        if (item) {
          item.currentStock = Math.max(0, item.currentStock - edtaToConsume);
          item.status = updateStatus(item.currentStock, item.minThreshold);
        }
      }

      if (sstToConsume > 0) {
        const item = state.consumables.find(c => c.id === 'c-2');
        if (item) {
          item.currentStock = Math.max(0, item.currentStock - sstToConsume);
          item.status = updateStatus(item.currentStock, item.minThreshold);
        }
      }

      if (needlesToConsume > 0) {
        const item = state.consumables.find(c => c.id === 'c-3');
        if (item) {
          item.currentStock = Math.max(0, item.currentStock - needlesToConsume);
          item.status = updateStatus(item.currentStock, item.minThreshold);
        }
      }

      if (edtaToConsume > 0 || sstToConsume > 0) {
        state.transactions.unshift({
          id: `tx-inv-auto-${Date.now()}-c`,
          itemId: 'multiple',
          itemName: `Consumables (Vials/Needles)`,
          type: 'Outward',
          quantity: edtaToConsume + sstToConsume + needlesToConsume,
          performedBy: 'LIMS Engine',
          date: new Date().toISOString(),
          reference: bookingCode,
          notes: `Deducted ${edtaToConsume}x EDTA, ${sstToConsume}x SST, ${needlesToConsume}x Needle`
        });
      }
    }
  }
});

export const { recordTransaction, consumeForTests } = inventorySlice.actions;
export default inventorySlice.reducer;
