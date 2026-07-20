import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';

interface ExtendedAuthState extends AuthState {
  currentCityId: string;
  currentBranchId: string;
  previewRoleSlug: string | null;
}

const initialState: ExtendedAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
currentCityId: 'all',
  currentBranchId: 'all',
  previewRoleSlug: null,
};

const authSlice = createSlice({ 
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user; // includes permissions + accessibleModules
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('medsseva_token', action.payload.token);

      // Lock context dynamically based on logged-in franchise admin alignment
      const franchiseId = action.payload.user.franchiseId;
      if (franchiseId === 'fr-104') {
        state.currentCityId = 'ind';
      } else if (franchiseId === 'fr-101') {
        state.currentCityId = 'dl';
      } else if (franchiseId === 'fr-102') {
        state.currentCityId = 'mum';
      } else if (franchiseId === 'fr-103') {
        state.currentCityId = 'blr';
      } else {
        state.currentCityId = 'all';
      }
      state.currentBranchId = 'all';
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('medsseva_token');
    },
     setPreviewRole: (state, action: PayloadAction<string | null>) => {
      state.previewRoleSlug = action.payload;
    },
    switchContext: (state, action: PayloadAction<{ cityId?: string; branchId?: string }>) => {
      if (action.payload.cityId !== undefined) {
        state.currentCityId = action.payload.cityId;
        // Auto reset branch context when city changes
        state.currentBranchId = 'all';
      }
      if (action.payload.branchId !== undefined) {
        state.currentBranchId = action.payload.branchId;
      }
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, setPreviewRole, switchContext } = authSlice.actions;
export default authSlice.reducer;
