import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Banner, Coupon, Campaign, ApiLog } from '../../types';

export interface AppConfigState {
  layoutSections: string[];
  categoriesPriority: string[];
  emergencyAlert: {
    isActive: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical';
  };
  featureToggles: {
    enableOnlineConsultations: boolean;
    enableAiSymptomsChat: boolean;
    enableReportsWallet: boolean;
    enableUrgentCollection: boolean;
  };
  healthTips: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  primaryColor: string;
}

interface CmsState {
  banners: Banner[];
  coupons: Coupon[];
  campaigns: Campaign[];
  apiLogs: ApiLog[];
  appConfig: AppConfigState;
}

const MOCK_BANNERS: Banner[] = [
  { id: 'b-1', title: 'Full Body Wellness Offer', imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118', linkType: 'Package', linkValue: 'pkg-1', isActive: true, sortOrder: 1 },
  { id: 'b-2', title: 'Monsoon Health Screen 20% OFF', imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528', linkType: 'Category', linkValue: 'wellness', isActive: true, sortOrder: 2 }
];

const MOCK_COUPONS: Coupon[] = [
  { id: 'c-1', code: 'HEALTH20', discountType: 'Percentage', discountValue: 20, minOrderValue: 1000, maxDiscount: 500, expiryDate: '2026-12-31', isActive: true, usageCount: 142 },
  { id: 'c-2', code: 'FLAT150', discountType: 'Fixed', discountValue: 150, minOrderValue: 500, expiryDate: '2026-06-30', isActive: true, usageCount: 85 }
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'cmp-1', title: 'Diabetic Week Follow-up', channel: 'WhatsApp', recipientsCount: 1200, scheduledFor: '2026-05-14T10:00:00Z', status: 'Scheduled', messageTemplate: 'Hi {{name}}, this is MedsSeva. Remember to book your quarterly HbA1c test at a special discount!' },
  { id: 'cmp-2', title: 'New Year Wellness Launch', channel: 'Email', recipientsCount: 5000, scheduledFor: '2026-01-01T09:00:00Z', status: 'Sent', messageTemplate: 'Kickstart 2026 with a healthy body...' }
];

const MOCK_API_LOGS: ApiLog[] = [
  { id: 'log-1', timestamp: '2026-05-13T17:00:05Z', method: 'GET', path: '/api/v1/bookings', statusCode: 200, latencyMs: 42, ip: '45.12.44.22', userAgent: 'Mozilla/5.0' },
  { id: 'log-2', timestamp: '2026-05-13T17:01:12Z', method: 'POST', path: '/api/v1/reports/rep-1/approve', statusCode: 200, latencyMs: 148, ip: '12.98.32.101', userAgent: 'Axios/1.6.0' }
];

const DEFAULT_CONFIG: AppConfigState = {
  layoutSections: ['hero_banner', 'quick_categories', 'seva_check', 'health_campaigns', 'trending_packages', 'ai_health_tips'],
  categoriesPriority: ['Blood', 'Diabetes', 'Thyroid', 'Cardiac', 'Liver', 'Vitamins'],
  emergencyAlert: {
    isActive: false,
    title: 'Fever Outbreak Advisory',
    message: 'Higher volumes of dengue testing in your area. Pre-book collection slots 1 day early.',
    type: 'warning'
  },
  featureToggles: {
    enableOnlineConsultations: true,
    enableAiSymptomsChat: true,
    enableReportsWallet: true,
    enableUrgentCollection: false
  },
  healthTips: [
    { id: 'tip-1', title: 'Hydration First', description: 'Drinking 3L water daily stabilizes plasma density, assisting valid kidney panels.', icon: 'droplet' },
    { id: 'tip-2', title: 'Fasting Protocols', description: 'For accurate lipid screenings, avoid solid foods and coffee for exactly 10-12 hours.', icon: 'clock' }
  ],
  primaryColor: '#006D6F'
};

const initialState: CmsState = {
  banners: MOCK_BANNERS,
  coupons: MOCK_COUPONS,
  campaigns: MOCK_CAMPAIGNS,
  apiLogs: MOCK_API_LOGS,
  appConfig: DEFAULT_CONFIG
};

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    upsertBanner: (state, action: PayloadAction<Banner>) => {
      const idx = state.banners.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) {
        state.banners[idx] = action.payload;
      } else {
        state.banners.push(action.payload);
      }
    },
    deleteBanner: (state, action: PayloadAction<string>) => {
      state.banners = state.banners.filter(b => b.id !== action.payload);
    },
    upsertCoupon: (state, action: PayloadAction<Coupon>) => {
      const idx = state.coupons.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.coupons[idx] = action.payload;
      } else {
        state.coupons.push(action.payload);
      }
    },
    addCampaign: (state, action: PayloadAction<Campaign>) => {
      state.campaigns.unshift(action.payload);
    },
    addApiLog: (state, action: PayloadAction<ApiLog>) => {
      state.apiLogs.unshift(action.payload);
      if (state.apiLogs.length > 50) {
        state.apiLogs.pop();
      }
    },
    updateAppConfig: (state, action: PayloadAction<Partial<AppConfigState>>) => {
      state.appConfig = {
        ...state.appConfig,
        ...action.payload
      };
    }
  }
});

export const { upsertBanner, deleteBanner, upsertCoupon, addCampaign, addApiLog, updateAppConfig } = cmsSlice.actions;
export default cmsSlice.reducer;
