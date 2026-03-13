import { defineStore } from "pinia";
import api from "@/api/axios";
import router from "@/router";

export const useAuthStore = defineStore("auth", {

    state: () => ({
        user: null,
        loading: false
    }),

    getters: {

        isAuthenticated: (state) => !!state.user,

        isAdmin: (state) => state.user?.role?.name === "admin"

    },

    actions: {

        async login(credentials) {

            this.loading = true

            try {

                // 1️⃣ récupérer cookie CSRF pour Sanctum
                await api.get("/sanctum/csrf-cookie")

                // 2️⃣ envoyer login
                await api.post("/api/login", credentials)

                // 3️⃣ récupérer utilisateur
                const response = await api.get("/api/user")

                this.user = response.data

                // 4️⃣ redirection dashboard
                router.push("/dashboard")

            } catch (error) {

                console.error("Erreur login :", error.response?.data || error)

                throw error

            } finally {

                this.loading = false

            }

        },

        async register(data) {

            try {

                await api.post("/api/register", data)

                await this.login({
                    email: data.email,
                    password: data.password
                })

            } catch (error) {

                console.error("Erreur register :", error.response?.data || error)

                throw error

            }

        },

        async logout() {

            try {

                await api.post("/api/logout")

            } catch (error) {

                console.warn("Erreur logout :", error)

            }

            this.user = null

            router.push("/login")

        },

        async fetchUser() {

            try {

                const response = await api.get("//api/user")

                this.user = response.data

            } catch (error) {

                this.user = null

            }

        }

    }

})