import Vue from 'vue'
import Router from 'vue-router'
import mylogin from '@/components/Login'
import mychart from '@/components/Chart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: mylogin
    },
    {
      path: '/login',
      name: 'login',
      component: mylogin
    },
    {
      path: '/chart',
      name: 'chart',
      meta: {
        title: 'Chart'
      },
      component: mychart
    }
  ]
})
