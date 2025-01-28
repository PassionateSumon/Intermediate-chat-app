import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoginIng: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async ({data}) => {
    console.log(data)
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", {
        ...data,
      });
      set({ authUser: res.data });
      toast.success("Account created successsfully.");
    } catch (error) {
      console.log("Error in signup:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigninUp: false });
    }
  },
}));
