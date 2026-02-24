import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOffline: boolean;
  networkError: string | null;
  lastSyncTime: number | null;
  appVersion: string;
}

const initialState: AppState = {
  isOffline: false,
  networkError: null,
  lastSyncTime: null,
  appVersion: '1.0.0',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
      if (action.payload) {
        state.networkError = 'No internet connection. Some features may be limited.';
      } else {
        state.networkError = null;
      }
    },
    setNetworkError: (state, action: PayloadAction<string | null>) => {
      state.networkError = action.payload;
    },
    clearNetworkError: (state) => {
      state.networkError = null;
    },
    updateLastSyncTime: (state) => {
      state.lastSyncTime = Date.now();
    },
    setAppVersion: (state, action: PayloadAction<string>) => {
      state.appVersion = action.payload;
    },
  },
});

export const {
  setOfflineStatus,
  setNetworkError,
  clearNetworkError,
  updateLastSyncTime,
  setAppVersion,
} = appSlice.actions;

// Selectors
export const selectIsOffline = (state: { app: AppState }) => state.app.isOffline;
export const selectNetworkError = (state: { app: AppState }) => state.app.networkError;
export const selectLastSyncTime = (state: { app: AppState }) => state.app.lastSyncTime;
export const selectAppVersion = (state: { app: AppState }) => state.app.appVersion;

export default appSlice.reducer;
