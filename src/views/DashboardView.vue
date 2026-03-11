<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const documents = ref([])
const file = ref(null)

/*
========================================
PARTAGE
========================================
*/

const selectedDocument = ref(null)
const shareUserId = ref("")
const publicLink = ref(null)

/*
========================================
Récupérer documents
========================================
*/

const fetchDocuments = async () => {

    try {

        const response = await axios.get("/documents")

        documents.value = response.data.owned_documents

    } catch (error) {

        console.error("Erreur chargement documents", error)

    }
}

/*
========================================
Upload document
========================================
*/

const uploadDocument = async () => {

    if (!file.value) return

    const formData = new FormData()

    formData.append("file", file.value)

    try {

        await axios.post("/documents", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        file.value = null

        fetchDocuments()

    } catch (error) {

        console.error("Erreur upload", error)

    }
}

/*
========================================
Supprimer document
========================================
*/

const deleteDocument = async (id) => {

    if (!confirm("Supprimer ce document ?")) return

    try {

        await axios.delete(`/documents/${id}`)

        fetchDocuments()

    } catch (error) {

        console.error("Erreur suppression", error)

    }
}

/*
========================================
Télécharger document
========================================
*/

const downloadDocument = (id) => {

    window.open(`http://localhost:8000/api/documents/${id}/download`)

}

/*
========================================
OUVRIR PARTAGE
========================================
*/

const openShare = (doc) => {

    selectedDocument.value = doc
    publicLink.value = null
    shareUserId.value = ""

}

/*
========================================
PARTAGER UTILISATEUR
========================================
*/

const shareWithUser = async () => {

    if (!shareUserId.value) return

    try {

        await axios.post(`/documents/${selectedDocument.value.id}/share`, {
            user_id: shareUserId.value
        })

        alert("Document partagé")

    } catch (error) {

        console.error("Erreur partage", error)

    }

}

/*
========================================
GENERER LIEN PUBLIC
========================================
*/

const generateLink = async () => {

    try {

        const response = await axios.post(
            `/documents/${selectedDocument.value.id}/public-link`,
            {
                permission: "read",
                allow_download: true,
                expires_in_days: 7
            }
        )

        publicLink.value = response.data.public_url

    } catch (error) {

        console.error("Erreur lien public", error)

    }

}

/*
========================================
COPIER LIEN
========================================
*/

const copyLink = () => {

    navigator.clipboard.writeText(publicLink.value)

    alert("Lien copié")

}

/*
========================================
Chargement initial
========================================
*/

onMounted(() => {

    fetchDocuments()

})
</script>

<template>

<div class="container">

    <h1>Dashboard</h1>

    <!-- Upload -->

    <div class="upload-box">

        <input type="file" @change="e => file = e.target.files[0]" />

        <button @click="uploadDocument">
            Upload
        </button>

    </div>

    <!-- Liste documents -->

    <table>

        <thead>
            <tr>
                <th>Nom</th>
                <th>Taille</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>

            <tr v-for="doc in documents" :key="doc.id">

                <td>{{ doc.name }}</td>

                <td>{{ doc.size }}</td>

                <td>

                    <button @click="downloadDocument(doc.id)">
                        Télécharger
                    </button>

                    <button @click="deleteDocument(doc.id)">
                        Supprimer
                    </button>

                    <button @click="openShare(doc)">
                        Partager
                    </button>

                </td>

            </tr>

        </tbody>

    </table>

    <!-- PARTAGE -->

    <div v-if="selectedDocument" class="share-box">

        <h3>Partager : {{ selectedDocument.name }}</h3>

        <div>

            <input
                v-model="shareUserId"
                placeholder="ID utilisateur"
            />

            <button @click="shareWithUser">
                Partager avec utilisateur
            </button>

        </div>

        <hr>

        <button @click="generateLink">
            Générer lien public
        </button>

        <div v-if="publicLink">

            <p>{{ publicLink }}</p>

            <button @click="copyLink">
                Copier lien
            </button>

        </div>

    </div>

</div>

</template>

<style>

.container{
max-width:1000px;
margin:auto;
}

.upload-box{
margin-bottom:20px;
}

table{
width:100%;
border-collapse: collapse;
}

td,th{
border:1px solid #ddd;
padding:10px;
}

.share-box{
margin-top:40px;
padding:20px;
border:1px solid #ddd;
}

</style>