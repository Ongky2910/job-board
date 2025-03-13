import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Fungsi untuk refresh token
const refreshToken = async () => {
  try {
    const response = await api.get("/api/auth/refresh-token");
    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      return response.data.token;
    }
  } catch (error) {
    console.error("Refresh token failed:", error);
    return null;
  }
};

// Interceptor untuk token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Async thunk untuk login
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      console.log("🔥 API Login Response:", response.data);

      localStorage.setItem("accessToken", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      toast.success("Login successful!");
      return response.data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

// Async thunk untuk logout
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout");
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];
      toast.success("Logout successful! 👋");
    } catch (err) {
      toast.error("Logout failed");
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

// Async thunk untuk update profil
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.put("/api/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully!");
      return res.data;
    } catch (err) {
      toast.error("Failed to update profile");
      return rejectWithValue(err.response?.data || "Failed to update profile");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(
          "✅ Login successful, updating Redux state:",
          action.payload
        );
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
        localStorage.removeItem("accessToken");
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
