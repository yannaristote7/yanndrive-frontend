<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
<div class="min-h-screen bg-[#09090f] text-[#e0e0e0] flex flex-col"
     style="font-family:'DM Sans',sans-serif; background-image: radial-gradient(ellipse at 10% 30%, rgba(255,180,0,0.06) 0%, transparent 55%), radial-gradient(ellipse at 90% 70%, rgba(255,100,0,0.04) 0%, transparent 50%)">

    <!-- NAVBAR -->
    <nav class="sticky top-0 z-50 flex justify-between items-center px-16 py-5 border-b border-[#1a1a28] bg-[rgba(9,9,15,0.9)] backdrop-blur-xl">
        <div class="flex items-baseline gap-1" style="font-family:'Syne',sans-serif">
            <span class="font-black text-2xl tracking-tight text-white"><span class="text-[#FFB400]">Y</span>AMS</span>
            <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
        </div>
        <div class="flex gap-3 items-center">
            <router-link to="/login"
                class="border border-[#2a2a3a] text-[#aaa] hover:border-[#FFB400] hover:text-[#FFB400] px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
                Connexion
            </router-link>
            <router-link to="/register"
                class="bg-[#FFB400] hover:bg-[#ffc933] text-black px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                style="font-family:'Syne',sans-serif">
                Créer un compte
            </router-link>
        </div>
    </nav>

    <!-- HERO -->
    <section class="flex-1 flex items-center justify-center gap-20 px-16 py-20 max-w-[1200px] mx-auto w-full">
        <div class="max-w-lg">
            <div class="inline-flex items-center gap-2 bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.25)] text-[#FFB400] text-xs font-medium px-4 py-2 rounded-full mb-7 tracking-wide">
                Plateforme documentaire sécurisée
            </div>
            <h1 class="text-[52px] font-black leading-[1.08] tracking-[-2px] text-white mb-6" style="font-family:'Syne',sans-serif">
                Stockez, partagez<br>
                <span class="text-[#FFB400]">et contrôlez</span><br>
                vos documents
            </h1>
            <p class="text-[#666] text-base leading-relaxed mb-10">
                YamsDrive centralise tous vos fichiers d'entreprise avec des permissions granulaires, des liens sécurisés et un suivi complet des accès.
            </p>
            <div class="flex gap-4 flex-wrap">
                <router-link to="/register"
                    class="bg-[#FFB400] hover:bg-[#ffc933] text-black font-bold px-7 py-3.5 rounded-lg text-base transition-colors"
                    style="font-family:'Syne',sans-serif">
                    Créer un compte
                </router-link>
                <router-link to="/login"
                    class="border border-[#2a2a3a] text-[#aaa] hover:border-[#FFB400] hover:text-[#FFB400] px-7 py-3.5 rounded-lg text-base font-medium transition-all">
                    Se connecter
                </router-link>
            </div>
        </div>

        <!-- VISUAL CARD -->
        <div class="shrink-0 hidden lg:block">
            <div class="bg-[#111118] border border-[#222230] rounded-2xl w-[340px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                <div class="flex items-center gap-1.5 px-4 py-3.5 border-b border-[#1e1e2e]">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
                    <span class="ml-2 text-[11px] font-bold text-[#555] uppercase tracking-widest" style="font-family:'Syne',sans-serif">Mes documents</span>
                </div>
                <div v-for="(doc, i) in previewDocs" :key="i"
                    class="flex items-center gap-3 px-4 py-3.5 border-b border-[#141420] last:border-0 hover:bg-[#14141e] transition-colors">
                    <span class="text-xl shrink-0">{{ doc.icon }}</span>
                    <div class="flex-1 min-w-0">
                        <div class="text-[13px] text-[#ccc] truncate">{{ doc.name }}</div>
                        <div class="text-[11px] text-[#444] mt-0.5">{{ doc.meta }}</div>
                    </div>
                    <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide shrink-0', doc.statusClass]">
                        {{ doc.status }}
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="grid grid-cols-4 gap-4 px-16 pb-16 max-w-[1200px] mx-auto w-full max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div v-for="f in features" :key="f.title"
            class="bg-[#111118] border border-[#1e1e2e] hover:border-[rgba(255,180,0,0.2)] rounded-xl p-6 transition-colors">
            <div class="text-3xl mb-4">{{ f.icon }}</div>
            <h3 class="text-[15px] font-bold text-white mb-2" style="font-family:'Syne',sans-serif">{{ f.title }}</h3>
            <p class="text-[13px] text-[#555] leading-relaxed">{{ f.desc }}</p>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="text-center py-6 border-t border-[#1a1a28] text-[12px] text-[#333]">
        © 2025 YAMS Group — YamsDrive
    </footer>

</div>
</template>

<script>
export default {
    data() {
        return {
            previewDocs: [
                { icon: '📕', name: 'Rapport_Q1_2025.pdf', meta: '2.4 MB • Partagé avec 3', status: 'partagé', statusClass: 'bg-[rgba(255,180,0,0.1)] text-[#FFB400] border border-[rgba(255,180,0,0.2)]' },
                { icon: '📊', name: 'Budget_2025.xlsx', meta: '890 KB • Privé', status: 'privé', statusClass: 'bg-white/5 text-[#555] border border-[#222]' },
                { icon: '📝', name: 'Contrat_Fournisseur.docx', meta: '1.1 MB • Lien public', status: 'lien', statusClass: 'bg-[rgba(80,160,255,0.1)] text-[#5fa8ff] border border-[rgba(80,160,255,0.2)]' },
                { icon: '🖼️', name: 'Logo_YamsGroup.png', meta: '340 KB • Privé', status: 'privé', statusClass: 'bg-white/5 text-[#555] border border-[#222]' },
            ],
            features: [
                { icon: '🔒', title: 'Accès sécurisé', desc: 'Domaines autorisés uniquement. Chaque fichier est protégé par authentification Sanctum.' },
                { icon: '🔗', title: 'Liens publics', desc: 'Générez des liens temporaires avec mot de passe, date d\'expiration et contrôle de téléchargement.' },
                { icon: '👥', title: 'Partage interne', desc: 'Partagez vos documents avec vos collègues en quelques clics, avec suivi des accès.' },
                { icon: '📋', title: 'Logs d\'activité', desc: 'L\'administrateur visualise toutes les actions en temps réel : uploads, partages, téléchargements.' },
            ]
        }
    }
}
</script>