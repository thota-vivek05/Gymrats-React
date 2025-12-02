import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk for Login (Handles API + Error/Loading)
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await response.json();

            if (!data.success) {
                return rejectWithValue(data.error || 'Login failed');
            }
            
            // Return data to be handled by the reducer
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State: Check localStorage immediately (Persistence)
const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            // Clear Persistence
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Loading State
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // Handle Success State (Persistence)
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                
                // Save to LocalStorage
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                localStorage.setItem('token', action.payload.token);
            })
            // Handle Error State
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;