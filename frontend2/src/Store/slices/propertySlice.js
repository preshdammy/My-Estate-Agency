import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching properties
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // You'll replace this with actual API call
      const response = await fetch('/api/properties');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const propertySlice = createSlice({
  name: 'properties',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {
      location: '',
      minPrice: '',
      maxPrice: '',
      category: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        location: '',
        minPrice: '',
        maxPrice: '',
        category: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// THIS IS CRITICAL - default export of the reducer
export default propertySlice.reducer;

// Named exports for actions
export const { setFilters, clearFilters } = propertySlice.actions;