import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { persistor } from "../store";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const storedUser = localStorage.getItem("user");
const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");
const logoutEvent = new Event("logout");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        if (!newToken) throw new Error("Failed to refresh token");

        isRefreshing = false;
        onTokenRefreshed(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        console.error("❌ Refresh token failed, logging out...");
        window.dispatchEvent(logoutEvent);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const response = await api.get("/api/auth/refresh-token");
    if (response.status !== 200) throw new Error("Invalid refresh token");

    const newToken = response.data.token;
    Cookies.set("accessToken", newToken, { expires: 7 });
    localStorage.setItem("accessToken", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    return newToken;
  } catch (error) {
    console.error("❌ Refresh token gagal, logout...");
    window.dispatchEvent(logoutEvent);
    return null;
  }
};

export const verifyToken = createAsyncThunk(
  "user/verifyToken",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.get("/api/auth/verify-token");
      return res.data.user;
    } catch (error) {
      console.log("❌ Token invalid, logging out...");
      dispatch(logoutUser());
      return rejectWithValue("Invalid token");
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async ({ displayName, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/register", {
        displayName,
        email,
        password,
      });
      toast.success("Registration successful! 🎉");
      return response.data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      return rejectWithValue(err.response?.data || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { user, token } = response.data;

      Cookies.set("accessToken", token, { expires: 7 });
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch(setUser(user));
      toast.success("Login successful!");
      return user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout");

      // Hapus token di localStorage & cookies
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      Cookies.remove("accessToken");

      // Hapus token di axios default headers
      delete api.defaults.headers.common["Authorization"];

      await persistor.purge(); 

      toast.success("Logout successful!");
    } catch (err) {
      toast.error("Logout failed");
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

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
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        console.log("verifyToken REJECTED:", action.error);
        state.user = null;
        state.error = action.payload;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("✅ Logout sukses, reset user Redux");
        state.user = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, clearError } = userSlice.actions;
export default userSlice.reducer;
