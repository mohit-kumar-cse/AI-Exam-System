// src/services/authService.js

import api from "./api";

export async function login(email, password) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data; 
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    throw message;
  }
}

export async function register(name, email, password, role) {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Registration failed";
    throw message;
  }
}

export async function googleLogin(credential) {
  try {
    const response = await api.post("/auth/google", {
      credential,
    });

    return response.data;  
  } catch (error) {
    const message =
      error.response?.data?.message || "Google login failed";
    throw message;
  }
}