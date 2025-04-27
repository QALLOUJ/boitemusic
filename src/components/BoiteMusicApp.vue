<template>
  <div class="boitemusic">
    <h1>AshleyChafaeMusic</h1>

    <!-- Section de la piste en cours de lecture -->
    <div class="current-track">
      <p>Now playing: {{ currentPlaylistName }}</p> <!-- Afficher le nom de la playlist -->
    </div>

    <!-- Image statique -->
    <div class="album-art" :class="{ playing: isPlaying }">
      <img :src="currentTrack ? currentTrack.art : albumImage" alt="Album Art" />
    </div>

    <!-- Contrôles de lecture -->
    <div class="controls">
      <button @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <button @click="skipTrack">Next</button>
    </div>

    <!-- Barre de progression interactive -->
    <div class="progress-bar" @click="seekAudio">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Élément audio -->
    <audio ref="audio" :src="currentTrack ? currentTrack.url : ''" @ended="handleEnd"></audio>

    <!-- Options de lecture (mode de répétition) -->
    <div class="playback-options">
      <label>Playback mode:</label>
      <input type="radio" id="repeatList" value="repeatList" v-model="playbackMode" />
      <label for="repeatList">Repeat list</label>
      <input type="radio" id="repeatTrack" value="repeatTrack" v-model="playbackMode" />
      <label for="repeatTrack">Repeat track</label>
      <input type="radio" id="noRepeat" value="noRepeat" v-model="playbackMode" />
      <label for="noRepeat">Don't repeat</label>
    </div>

    <!-- Sélection de fichier MP3 local ou URL -->
    <div>
      <label for="fileInput">Select MP3 file:</label>
      <input type="file" id="fileInput" accept="audio/mp3" @change="handleFileInput" />
    </div>

    <div>
      <label for="urlInput">Or enter MP3 URL:</label>
      <input type="text" id="urlInput" v-model="urlInput" placeholder="Enter MP3 URL" @keyup.enter="handleUrlInput" />
      <button type="button" @click="handleUrlInput">Add MP3 URL</button>
    </div>

    <!-- Liste de lecture -->
    <MusicPlaylist 
      :playlist="currentPlaylist" 
      :currentTrack="currentTrack" 
      @playTrack="playTrack" 
      @deleteTrack="deleteTrack" 
    />
    <PlaylistManager 
      v-if="showPlaylistManager" 
      @selectPlaylist="handleSelectPlaylist" 
      @close="showPlaylistManager = false" 
    />

    <!-- Bouton pour aller à la page de gestion des playlists -->
    <button @click="goToPlaylist">Gérer les playlists</button>
  </div>
</template>

<script>
import MusicPlaylist from './MusicPlaylist.vue';
import albumImage from '@/assets/album.jpg';
import PlaylistManager from './PlaylistManager.vue';

export default {
  name: "BoiteMusicApp",
  components: {
    MusicPlaylist,
    PlaylistManager,
  },
  data() {
    return {
      currentTrack: null,
      playbackMode: 'noRepeat',
      playlists: [], // Liste de toutes les playlists
      currentPlaylistIndex: 0, // Index de la playlist actuellement sélectionnée
      urlInput: "",
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      albumImage, // Ajoutez l'image importée aux données
    };
  },
  computed: {
    // Calculer la progression en pourcentage
    progress() {
      return (this.currentTime / this.duration) * 100 || 0;
    },
    currentPlaylistName() {
      return this.playlists[this.currentPlaylistIndex]?.name || 'No playlist selected';
    },
    currentPlaylist() {
      return this.playlists[this.currentPlaylistIndex]?.tracks || [];
    },
  },
  methods: {
    // Jouer une piste
    playTrack(track) {
      if (!track) {
        console.error("Aucune piste n'a été fournie.");
        return;
      }

      this.currentTrack = track;
      this.isPlaying = true;

      // Vérifier si l'élément audio est disponible
      if (this.$refs.audio) {
        this.$refs.audio.src = track.url; // Définir la source audio
        this.$refs.audio.load(); // Charger la nouvelle source
        this.$refs.audio.play().catch(error => {
          console.error("Erreur lors de la lecture :", error);
        });
      } else {
        console.error("L'élément audio n'est pas disponible.");
      }
    },

    // Basculer entre lecture et pause
    togglePlay() {
      if (this.$refs.audio) {
        if (this.isPlaying) {
          this.$refs.audio.pause();
        } else {
          this.$refs.audio.play();
        }
        this.isPlaying = !this.isPlaying;
      }
    },

    // Passer à la piste suivante
    skipTrack() {
      if (this.currentPlaylist.length === 0) return; // Vérifier si la playlist est vide

      const currentIndex = this.currentPlaylist.indexOf(this.currentTrack);
      if (currentIndex === -1) return; // Vérifier si la piste actuelle est valide

      const nextIndex = (currentIndex + 1) % this.currentPlaylist.length; // Passer à la piste suivante
      const nextTrack = this.currentPlaylist[nextIndex];
      this.playTrack(nextTrack);
    },

    // Gérer la fin de la lecture
    handleEnd() {
      if (this.playbackMode === 'repeatTrack') {
        this.$refs.audio.play(); // Rejouer la même piste
      } else if (this.playbackMode === 'repeatList') {
        this.skipTrack(); // Passer à la piste suivante
      }
    },

    // Mettre à jour le temps de lecture
    updateTime() {
      this.currentTime = this.$refs.audio.currentTime;
      this.duration = this.$refs.audio.duration;
    },

    // Gérer le clic sur la barre de progression
    seekAudio(event) {
      if (this.$refs.audio) {
        const progressBar = event.currentTarget;
        const clickPosition = event.offsetX; // Position du clic en pixels
        const progressBarWidth = progressBar.clientWidth; // Largeur totale de la barre
        const seekTime = (clickPosition / progressBarWidth) * this.duration; // Temps correspondant
        this.$refs.audio.currentTime = seekTime; // Mettre à jour le temps de lecture
      }
    },

    // Ajouter une URL de piste à la playlist
    addTrackToPlaylist(trackUrl) {
      if (trackUrl && trackUrl.match(/https?:\/\/\S+\.mp3$/)) {
        const track = { title: trackUrl.split('/').pop(), url: trackUrl, art: albumImage }; // Ajoutez l'image par défaut
        this.addTrack(track);
      } else {
        alert('Please enter a valid MP3 URL.');
      }
    },

    // Ajouter un fichier local MP3 à la playlist
    addFileToPlaylist(file) {
      if (file && file.type.startsWith('audio/')) {
        const track = {
          title: file.name,
          url: URL.createObjectURL(file), // Utilisation de l'URL temporaire pour la lecture locale
          art: albumImage, // Ajoutez l'image par défaut
        };
        this.addTrack(track);
      } else {
        alert('Please select a valid MP3 file.');
      }
    },

    // Gérer l'entrée de fichier (lecture locale)
    handleFileInput(event) {
      const file = event.target.files[0];
      if (file) {
        this.addFileToPlaylist(file);
      }
    },

    // Gérer l'entrée d'URL (lecture distante)
    handleUrlInput() {
      if (this.urlInput) {
        this.addTrackToPlaylist(this.urlInput);
        this.urlInput = "";  // Réinitialiser le champ après l'ajout
      }
    },

    // Rediriger vers la page de gestion des playlists
    goToPlaylist() {
      this.$router.push({ name: 'playlist' }); // Rediriger vers la page de gestion des playlists
    },

    // Ajouter une piste à la playlist
    addTrack(track) {
      track.art = track.art || albumImage;
      this.playlists[this.currentPlaylistIndex].tracks.push(track);
      this.savePlaylists(); // Sauvegarder les playlists après l'ajout
    },

    // Supprimer une piste de la playlist
    deleteTrack(index) {
      this.playlists[this.currentPlaylistIndex].tracks.splice(index, 1);
      this.savePlaylists(); // Sauvegarder les playlists après la suppression
    },

    // Sauvegarder les playlists dans le localStorage
    savePlaylists() {
      localStorage.setItem('playlists', JSON.stringify(this.playlists));
    },

    // Charger les playlists depuis le localStorage
    loadPlaylists() {
      const savedPlaylists = localStorage.getItem('playlists');
      if (savedPlaylists) {
        this.playlists = JSON.parse(savedPlaylists);
      }
    },
  },
  handleSelectPlaylist(index) {
      this.currentPlaylistIndex = index; // Mettre à jour l'index de la playlist sélectionnée
  },
  mounted() {
    this.$refs.audio.addEventListener('timeupdate', this.updateTime);
    this.loadPlaylists(); // Charger les playlists au montage du composant
  },
  beforeUnmount() {
    this.$refs.audio.removeEventListener('timeupdate', this.updateTime);
  },
};
</script>

