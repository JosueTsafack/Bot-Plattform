import Vue from 'vue'
import Router from 'vue-router'
import overview from '../views/overview.vue'
import config from '../views/config.vue'
import create from '../views/create.vue'
import login from '../views/login.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: __dirname,
  routes: [
    {
      path: '/',
      redirect: '/overview'
    },
    {
      path: '/config/:id',
      component: config
    },
    {
      path: '/overview',
      component: overview
    },
    {
      path: '/create',
      component: create
    },
    {
      path: '/login',
      component: login
    }
  ]
})
