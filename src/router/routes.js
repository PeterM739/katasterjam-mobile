import { api } from 'src/boot/axios'

const caveResolver = async (to, from, next) => {
  const response = await api.get(`/api/caves/${to.params.caveNumber}`)
  to.meta.cave = response.data
  next()
}

const routes = [
  {
    name: 'Login',
    path: '/login',
    component: () => import('pages/Login.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requireLogin: true },
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue') },
      { path: '/caves', name: 'caves', component: () => import('pages/CaveSearchPage.vue') },
      { path: '/caves/details/:caveNumber', name: 'caves-details', component: () => import('pages/CaveDetailsPage.vue'), beforeEnter: caveResolver }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
