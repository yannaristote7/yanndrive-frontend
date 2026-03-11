<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"

const route = useRoute()

const document = ref(null)

const fetchDocument = async () => {

    try {

        const token = route.params.token

        const response = await axios.get(`/public/share/${token}`)

        document.value = response.data

    } catch (error) {

        console.error(error)

    }

}

const download = () => {

    window.open(document.value.download_url)

}

onMounted(() => {

    fetchDocument()

})
</script>

<template>

<div class="container">

<div v-if="document">

<h2>{{ document.name }}</h2>

<p>Taille : {{ document.size }}</p>

<button @click="download">
Télécharger
</button>

</div>

<div v-else>

<p>Chargement...</p>

</div>

</div>

</template>

<style scoped>

.container{
max-width:600px;
margin:auto;
text-align:center;
}

button{
margin-top:20px;
padding:10px 20px;
}

</style>