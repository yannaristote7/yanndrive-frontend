<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const logs = ref([])

const fetchLogs = async () => {

    try {

        const response = await axios.get("/activity-logs")

        logs.value = response.data

    } catch (error) {

        console.error("Erreur logs", error)

    }

}

onMounted(() => {

    fetchLogs()

})
</script>

<template>

<div class="container">

<h2>Historique des activités</h2>

<table>

<thead>
<tr>
<th>Utilisateur</th>
<th>Action</th>
<th>Description</th>
<th>IP</th>
<th>Date</th>
</tr>
</thead>

<tbody>

<tr v-for="log in logs" :key="log.id">

<td>{{ log.user?.name }}</td>

<td>{{ log.action }}</td>

<td>{{ log.description }}</td>

<td>{{ log.ip_address }}</td>

<td>{{ log.created_at }}</td>

</tr>

</tbody>

</table>

</div>

</template>

<style scoped>

.container{
max-width:1100px;
margin:auto;
}

table{
width:100%;
border-collapse:collapse;
}

td,th{
border:1px solid #ddd;
padding:10px;
}

</style>