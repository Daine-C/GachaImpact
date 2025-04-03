import { writable } from "svelte/store";

export const user = writable(null); // Stores the logged-in user session
export const isAuthenticated = writable(false); // Tracks session status
export const loading = writable(false); // Tracks loading state

export async function checkSession() {
  loading.set(true); // Start loading
  try {
    const res = await fetch("http://localhost:3001/api/session");

    if (res.status === 401 || res.status === 403) {
      throw new Error("Session expired or invalid");
    }

    if (!res.ok) {
      throw new Error("Session not found");
    }

    const data = await res.json();
    user.set(data);
    isAuthenticated.set(true);
  } catch (error) {
    console.error("Session check failed:", error);
    user.set(null); // Clear the user store
    isAuthenticated.set(false);
  } finally {
    loading.set(false); // Stop loading
  }
}

export async function logout() {
  try {
    const res = await fetch("http://localhost:3001/api/logout", {
      method: "POST"
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    user.set(null); // Clear the user store
    isAuthenticated.set(false);
  } catch (error) {
    console.error("Logout failed:", error);
  }
}