<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
<div class="landing">

    <!-- NAVBAR -->
    <nav class="navbar">
        <div class="logo">
            <span class="logo-y">Y</span>ANN
            <span class="logo-sub">Drive</span>
        </div>
        <div class="nav-buttons">
            <router-link to="/login" class="btn-outline">Connexion</router-link>
            <router-link to="/register" class="btn-primary">Créer un compte</router-link>
        </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-content">
            <div class="badge">Plateforme documentaire sécurisée</div>
            <h1>Stockez, partagez<br><span class="accent">et contrôlez</span><br>vos documents</h1>
            <p>YamsDrive centralise tous vos fichiers d'entreprise avec des permissions granulaires, des liens sécurisés et un suivi complet des accès.</p>
            <div class="hero-buttons">
                <router-link to="/register" class="btn-primary big">Créer un compte</router-link>
                <router-link to="/login" class="btn-outline big">Se connecter</router-link>
            </div>
        </div>
        <div class="hero-visual">
            <div class="visual-card">
                <div class="visual-header">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                    <span class="visual-title">Mes documents</span>
                </div>
                <div class="visual-row">
                    <span class="vico">📕</span>
                    <div class="vinfo">
                        <div class="vname">Rapport_Q1_2025.pdf</div>
                        <div class="vmeta">2.4 MB • Partagé avec 3</div>
                    </div>
                    <span class="vstatus shared">partagé</span>
                </div>
                <div class="visual-row">
                    <span class="vico">📊</span>
                    <div class="vinfo">
                        <div class="vname">Budget_2025.xlsx</div>
                        <div class="vmeta">890 KB • Privé</div>
                    </div>
                    <span class="vstatus private">privé</span>
                </div>
                <div class="visual-row">
                    <span class="vico">📝</span>
                    <div class="vinfo">
                        <div class="vname">Contrat_Fournisseur.docx</div>
                        <div class="vmeta">1.1 MB • Lien public</div>
                    </div>
                    <span class="vstatus link">lien</span>
                </div>
                <div class="visual-row">
                    <span class="vico">🖼️</span>
                    <div class="vinfo">
                        <div class="vname">Logo_YamsGroup.png</div>
                        <div class="vmeta">340 KB • Privé</div>
                    </div>
                    <span class="vstatus private">privé</span>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="features">
        <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Accès sécurisé</h3>
            <p>Domaines autorisés uniquement. Chaque fichier est protégé par authentification Sanctum.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🔗</div>
            <h3>Liens publics</h3>
            <p>Générez des liens temporaires avec mot de passe, date d'expiration et contrôle de téléchargement.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Partage interne</h3>
            <p>Partagez vos documents avec vos collègues en quelques clics, avec suivi des accès.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Logs d'activité</h3>
            <p>L'administrateur visualise toutes les actions en temps réel : uploads, partages, téléchargements.</p>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
        <span>© 2025 YAMS Group — YamsDrive</span>
    </footer>

</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.landing {
    min-height: 100vh;
    background: #0a0a0f;
    color: #e0e0e0;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    background-image:
        radial-gradient(ellipse at 10% 30%, rgba(255,180,0,0.06) 0%, transparent 55%),
        radial-gradient(ellipse at 90% 70%, rgba(255,100,0,0.04) 0%, transparent 50%);
}

/* NAVBAR */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 60px;
    border-bottom: 1px solid #1a1a28;
    position: sticky;
    top: 0;
    background: rgba(10,10,15,0.9);
    backdrop-filter: blur(10px);
    z-index: 100;
}

.logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 22px;
    color: #fff;
    display: flex;
    align-items: baseline;
    gap: 2px;
}

.logo-y { color: #FFB400; }
.logo-sub {
    font-size: 11px;
    font-weight: 400;
    color: #555;
    margin-left: 4px;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.nav-buttons { display: flex; gap: 12px; align-items: center; }

/* HERO */
.hero {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 80px;
    padding: 80px 60px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.hero-content { max-width: 520px; }

.badge {
    display: inline-block;
    background: rgba(255,180,0,0.1);
    border: 1px solid rgba(255,180,0,0.25);
    color: #FFB400;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    margin-bottom: 24px;
}

h1 {
    font-family: 'Syne', sans-serif;
    font-size: 52px;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 20px;
    letter-spacing: -1.5px;
}

.accent { color: #FFB400; }

.hero p {
    font-size: 16px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 36px;
}

.hero-buttons { display: flex; gap: 14px; flex-wrap: wrap; }

/* VISUAL CARD */
.hero-visual { flex-shrink: 0; }

.visual-card {
    background: #111118;
    border: 1px solid #222230;
    border-radius: 14px;
    width: 340px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
}

.visual-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 18px;
    border-bottom: 1px solid #1e1e2e;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}
.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }

.visual-title {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #555;
    margin-left: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.visual-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid #141420;
    transition: background 0.15s;
}
.visual-row:last-child { border-bottom: none; }
.visual-row:hover { background: #14141e; }

.vico { font-size: 20px; flex-shrink: 0; }
.vinfo { flex: 1; min-width: 0; }
.vname { font-size: 13px; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vmeta { font-size: 11px; color: #444; margin-top: 2px; }

.vstatus {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
}
.vstatus.shared { background: rgba(255,180,0,0.1); color: #FFB400; border: 1px solid rgba(255,180,0,0.2); }
.vstatus.private { background: rgba(255,255,255,0.05); color: #555; border: 1px solid #222; }
.vstatus.link { background: rgba(80,160,255,0.1); color: #5fa8ff; border: 1px solid rgba(80,160,255,0.2); }

/* FEATURES */
.features {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 60px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.feature-card {
    background: #111118;
    border: 1px solid #1e1e2e;
    border-radius: 12px;
    padding: 24px;
    transition: border-color 0.2s;
}
.feature-card:hover { border-color: rgba(255,180,0,0.2); }

.feature-icon { font-size: 28px; margin-bottom: 14px; }

.feature-card h3 {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
}

.feature-card p { font-size: 13px; color: #555; line-height: 1.6; }

/* BUTTONS */
.btn-primary {
    background: #FFB400;
    color: #0a0a0f;
    padding: 11px 22px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    transition: background 0.15s;
    white-space: nowrap;
}
.btn-primary:hover { background: #ffc933; }
.btn-primary.big { padding: 13px 28px; font-size: 15px; }

.btn-outline {
    border: 1px solid #2a2a3a;
    color: #aaa;
    padding: 11px 22px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.15s;
    white-space: nowrap;
}
.btn-outline:hover { border-color: #FFB400; color: #FFB400; }
.btn-outline.big { padding: 13px 28px; font-size: 15px; }

/* FOOTER */
.footer {
    text-align: center;
    padding: 24px;
    border-top: 1px solid #1a1a28;
    font-size: 12px;
    color: #333;
}

/* RESPONSIVE */
@media (max-width: 900px) {
    .hero { flex-direction: column; padding: 40px 24px; gap: 40px; text-align: center; }
    .hero-visual { display: none; }
    h1 { font-size: 36px; }
    .features { grid-template-columns: repeat(2, 1fr); padding: 40px 24px; }
    .navbar { padding: 16px 24px; }
    .hero-buttons { justify-content: center; }
}

@media (max-width: 500px) {
    .features { grid-template-columns: 1fr; }
    h1 { font-size: 30px; }
}
</style>