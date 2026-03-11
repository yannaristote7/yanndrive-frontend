<script setup>
</script>

<template>

<div class="landing">

<!-- NAVBAR -->

<nav class="navbar">

<div class="logo">
YamsDrive
</div>

<div class="nav-buttons">

<router-link to="/login" class="btn-outline">
Connexion
</router-link>

<router-link to="/register" class="btn-primary">
Créer un compte
</router-link>

</div>

</nav>


<!-- HERO -->

<section class="hero">

<div class="hero-content">

<h1>
Stockez et partagez vos documents
</h1>

<p>
Une plateforme sécurisée pour gérer,
partager et contrôler vos fichiers.
</p>

<div class="hero-buttons">

<router-link to="/login" class="btn-outline big">
Connexion
</router-link>

<router-link to="/register" class="btn-primary big">
Créer un compte
</router-link>

</div>

</div>

</section>

</div>

</template>

<style scoped>

/* PAGE */

.landing{
height:100vh;
display:flex;
flex-direction:column;
font-family:Arial, Helvetica, sans-serif;
}

/* NAVBAR */

.navbar{
display:flex;
justify-content:space-between;
align-items:center;
padding:20px 40px;
border-bottom:1px solid #eee;
}

.logo{
font-size:22px;
font-weight:bold;
}

.nav-buttons{
display:flex;
gap:12px;
}

/* HERO */

.hero{
flex:1;
display:flex;
justify-content:center;
align-items:center;
text-align:center;
background:#f5f7fa;
padding:20px;
}

.hero-content{
max-width:600px;
}

.hero h1{
font-size:48px;
margin-bottom:20px;
}

.hero p{
font-size:18px;
color:#555;
margin-bottom:30px;
}

.hero-buttons{
display:flex;
justify-content:center;
gap:20px;
flex-wrap:wrap;
}

/* BUTTONS */

.btn-primary{
background:#1a73e8;
color:white;
padding:12px 24px;
border-radius:6px;
text-decoration:none;
font-weight:500;
}

.btn-outline{
border:1px solid #1a73e8;
color:#1a73e8;
padding:12px 24px;
border-radius:6px;
text-decoration:none;
font-weight:500;
}

.big{
font-size:18px;
}

/* RESPONSIVE */

@media (max-width:768px){

.hero h1{
font-size:32px;
}

.hero p{
font-size:16px;
}

}

</style>