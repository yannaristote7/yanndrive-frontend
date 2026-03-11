import { defineStore } from "pinia";
import api from "@/api/axios";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: localStorage.getItem("token") || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role?.name === "admin",
    },

    actions: {
        async login(credentials) {
            const response = await api.post("/login", credentials);

            this.token = response.data.token;
            this.user = response.data.user;

            localStorage.setItem("token", this.token);

            router.push("/dashboard");
        },

        async register(data) {
            await api.post("/register", data);
            await this.login({
                email: data.email,
                password: data.password,
            });
        },

        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem("token");
            router.push("/login");
        },

        async fetchUser() {
            if (!this.token) return;

            try {
                const response = await api.get("/user");
                this.user = response.data;
            } catch (error) {
                this.logout();
            }
        },
    },
});