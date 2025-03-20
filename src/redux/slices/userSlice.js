import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const storedUser = localStorage.getItem("user");
const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

let isRefreshing = false;

const refreshToken = async () => {
  if (isRefreshing) return null;
  isRefreshing = true;
  try {
    const response = await api.get("/api/auth/refresh-token");
    if (response.data.token) {
      Cookies.set("accessToken", response.data.token, { expires: 7 });
      localStorage.setItem("accessToken", response.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      if (response.data.refreshToken) {
        Cookies.set("refreshToken", response.data.refreshToken, { expires: 7 });
      }
      return response.data.token;
    }
  } catch (error) {
    console.error("Failed to refresh token, logging out...");
    await logoutUser();
    window.location.href = "/login";
  } finally {
    isRefreshing = false;
  }
  return null;
};

export const verifyToken = createAsyncThunk("user/verifyToken", async (_, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.get("/api/auth/verify-token");
    return res.data.user;
  } catch (error) {
    console.log("❌ Token invalid, logging out...");
    dispatch(logoutUser());
    return rejectWithValue("Invalid token");
  }
});

export const registerUser = createAsyncThunk("user/register", async ({ displayName, email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/auth/register", { displayName, email, password });
    toast.success("Registration successful! 🎉");
    return response.data.user;
  } catch (err) {
    toast.error(err.response?.data?.message || "Registration failed");
    return rejectWithValue(err.response?.data || "Registration failed");
  }
});

export const loginUser = createAsyncThunk("user/login", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    const { user, token } = response.data;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
    Cookies.set("accessToken", token, { expires: 7 });

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    dispatch(setUser(user));

    toast.success("Login successful!");
    return user;
  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed");
    return rejectWithValue(err.response?.data || "Login failed");
  }
});

export const logoutUser = createAsyncThunk("user/logout", async (_, { dispatch, rejectWithValue }) => {
  try {
    await api.post("/api/auth/logout");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    Cookies.remove("accessToken");

    delete api.defaults.headers.common["Authorization"];

    dispatch(setUser(null));
    toast.success("Logout successful!");
  } catch (err) {
    toast.error("Logout failed");
    return rejectWithValue(err.response?.data || "Logout failed");
  }
});

export const updateProfile = createAsyncThunk("user/updateProfile", async (formData, { rejectWithValue }) => {
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
});

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
      })
      .addCase(verifyToken.rejected, (state) => {
        state.user = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, clearError } = userSlice.actions;
export default userSlice.reducer;
