import { api } from 'src/boot/axios'
import { useLocalCavesStore } from '../stores/local-cave-store'
import { useOfflineStore } from 'stores/offline-store'

const caveResolver = async (to, from, next) => {
  if (navigator.connection.type && navigator.connection.type === 'none') {
    const store = useLocalCavesStore()
    const cave = await store.get(to.params.id)
    to.meta.cave = cave
  } else {
    const response = await api.get(`/api/caves/${to.params.id}`)
    to.meta.cave = response.data
  }
  next()
}
const excursionResolver = async (to, from, next) => {
  const response = await api.get(`/api/excursions/${to.params.id}`)
  to.meta.excursion = response.data
  next()
}
const customLocationResolver = async (to, from, next) => {
  const response = await api.get(`/api/customLocations/${to.params.id}`)
  to.meta.customLocation = response.data
  next()
}
const offlineRecordResolver = async (to, from, next) => {
  const store = useOfflineStore()
  const offlineRecord = await store.get(to.params.id)
  to.meta.offlineRecord = offlineRecord
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
      { path: '/caves/details/:id', name: 'caves-details', component: () => import('pages/CaveDetailsPage.vue'), beforeEnter: caveResolver },
      { path: '/trips', name: 'trips', component: () => import('pages/TripSearchPage.vue') },
      { path: '/trips/details/:id', name: 'trips-details', component: () => import('src/pages/TripDetailsPage.vue'), beforeEnter: excursionResolver },
      { path: '/custom-locations', name: 'custom-locations', component: () => import('pages/CustomLocationSearchPage.vue') },
      { path: '/custom-locations/details/:id', name: 'custom-locations-details', component: () => import('src/pages/CustomLocationDetailsPage.vue'), beforeEnter: customLocationResolver },
      { path: '/offline-data', name: 'offline-data-list', component: () => import('pages/OfflineDataList.vue') },
      { path: '/offline-data/:id', name: 'offline-data-page', component: () => import('pages/OfflineDataPage.vue'), beforeEnter: offlineRecordResolver }
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
