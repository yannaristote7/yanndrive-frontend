<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const stats = ref({})

const fetchStats = async () => {

    try {

        const response = await axios.get("/admin/stats")

        stats.value = response.data

    } catch (error) {

        console.error(error)

    }

}

onMounted(() => {

    fetchStats()

})
</script>

<template>

<div class="container">

<h1>Admin Dashboard</h1>

<div class="stats">

<div class="card">
<h3>Utilisateurs</h3>
<p>{{ stats.users }}</p>
</div>

<div class="card">
<h3>Documents</h3>
<p>{{ stats.documents }}</p>
</div>

<div class="card">
<h3>Partages</h3>
<p>{{ stats.shares }}</p>
</div>

<div class="card">
<h3>Téléchargements</h3>
<p>{{ stats.downloads }}</p>
</div>

</div>

</div>

</template>

<style scoped>

.container{
max-width:1000px;
margin:auto;
}

.stats{
display:flex;
gap:20px;
}

.card{
flex:1;
padding:20px;
border:1px solid #ddd;
text-align:center;
}

</style>