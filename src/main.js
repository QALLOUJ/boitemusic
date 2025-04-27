
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importez le routeur
import '@/assets/styles.css';

const app = createApp(App);
app.use(router); // Utilisez le routeur
app.mount('#app');