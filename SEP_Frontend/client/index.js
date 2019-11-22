import './promise-polyfill'
import { app } from './app'
import('./../node_modules/vuetify/dist/vuetify.min.css') 

// Enable progressive web app support (with offline-plugin)
if (process.env.NODE_ENV === 'production') {
  require('./pwa')
}

app.$mount('#app')
