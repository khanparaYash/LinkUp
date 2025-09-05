// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: !!localStorage.getItem("accesstoken"),
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { token, user } = action.payload;
      localStorage.setItem("accesstoken", token);
      localStorage.setItem("user", JSON.stringify(user));
      state.isAuthenticated = true;
      state.user = user;
    },
    logout(state) {
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("user");
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
