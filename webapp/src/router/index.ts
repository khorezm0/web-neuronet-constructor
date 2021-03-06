import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/edit',
    name: 'edit',
    component: ()=> import('../views/NeuroNetBuilder.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('../views/CreateNetwork.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/result',
    name: 'result',
    component: () => import('../views/TrainingResult.vue')
  },

  //aliases
  {
    path: '/',
    redirect: '/create',
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
