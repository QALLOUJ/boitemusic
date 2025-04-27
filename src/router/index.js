// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import BoiteMusicApp from '@/components/BoiteMusicApp.vue';
import PlaylistManager from '@/components/PlaylistManager.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: BoiteMusicApp,
  },
  {
    path: '/playlist',
    name: 'playlist',
    component: PlaylistManager,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;