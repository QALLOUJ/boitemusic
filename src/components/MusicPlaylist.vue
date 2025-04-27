<template>
  <div class="playlist">
    <h2>Playlist</h2>
    <ul>
      <li v-for="(track, index) in playlist" :key="index" :class="{ 'current-track': track === currentTrack }">
        <span>{{ track.title }}</span>
        <div>
          <button @click="playTrack(track)">Play</button>
          <button @click="deleteTrack(index)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    playlist: {
      type: Array,
      required: true,
    },
    currentTrack: {
      type: Object,
      default: null,
    },
  },
  methods: {
    playTrack(track) {
      this.$emit('playTrack', track); // Émettre l'événement vers le parent
    },
    deleteTrack(index) {
      this.$emit('deleteTrack', index); // Émettre l'événement vers le parent
    },
  },
};
</script>

