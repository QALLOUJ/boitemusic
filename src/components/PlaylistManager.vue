<template>
  <div class="playlist-manager">
    <h2>Gérer les playlists</h2>
    <button @click="goBack">Retour</button>

    <!-- Liste des playlists -->
    <ul>
      <li v-for="(playlist, index) in playlists" :key="index">
        <span>{{ playlist.name }} ({{ playlist.tracks.length }} titres)</span>
        <button @click="selectPlaylist(index)">Sélectionner</button>
        <button @click="deletePlaylist(index)">Supprimer</button>
      </li>
    </ul>

    <!-- Formulaire pour ajouter une nouvelle playlist -->
    <div>
      <input v-model="newPlaylistName" placeholder="Nom de la nouvelle playlist" />
      <button @click="createPlaylist">Créer</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      playlists: JSON.parse(localStorage.getItem('playlists')) || [],
      newPlaylistName: '',
    };
  },
  methods: {
    createPlaylist() {
      if (this.newPlaylistName) {
        this.playlists.push({ name: this.newPlaylistName, tracks: [] });
        this.newPlaylistName = '';
        this.savePlaylists();
      }
    },
    selectPlaylist(index) {
      this.$emit('selectPlaylist', index); // Émettre l'index de la playlist sélectionnée
      this.goBack(); // Retourner à la première page
    },
    
    deletePlaylist(index) {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette playlist ?")) {
        this.playlists.splice(index, 1);
        this.savePlaylists();
      }
    },
    savePlaylists() {
      localStorage.setItem('playlists', JSON.stringify(this.playlists));
    },
    goBack() {
      this.$router.push({ name: 'home' }); // Retour à la page principale
    },
  },
};
</script>

