import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SummaryApi } from "../common/summaryApi";
import { callApi } from "../api/callApi";

// register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, thunkAPI) => {
    try {
      const res = await callApi(SummaryApi.register, payload);
      if (res.token) localStorage.setItem("accesstoken", res.token);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.msg || err);
    }
  }
);

// login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      const res = await callApi(SummaryApi.login, payload);
      if (res.token) localStorage.setItem("accesstoken", res.token);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.msg || err);
    }
  }
);

// fetch current user
export const fetchUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await callApi(SummaryApi.user_details);
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.msg || err);
  }
});

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem("accesstoken"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("accesstoken");
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message;
      })

      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message;
      })

      .addCase(fetchUser.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (s) => {
        s.loading = false;
        s.user = null;
        s.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
