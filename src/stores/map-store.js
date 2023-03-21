import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    skyView: {
      active: false,
      url: 'https://gisserver.gov.si/arcgis/rest/services/TEMELJNE_KARTE/LidarTlaZgradbe_D96/MapServer/WMTS',
      layerName: 'TEMELJNE_KARTE_LidarTlaZgradbe_D96',
      projection: 'EPSG:3794',
      attributes: 'Ministrstvo za kulturo, Ministrstvo za okolje in prostor'
    },
    orthoPhoto: {
      active: false,
      url: 'https://gisserver.gov.si/arcgis/rest/services/TEMELJNE_KARTE/DOF2021/MapServer/WMTS',
      layerName: 'TEMELJNE_KARTE_DOF2021',
      projection: 'EPSG:3912',
      attributes: 'Ortophoto podlaga, GURS'
    }
  }),
  getters: {
    isSkyViewActive (state) {
      return state.skyView.active
    },
    isOrthoPhotoActive (state) {
      return state.orthoPhoto.active
    }
  },
  actions: {
    toggleSkyView () {
      this.skyView.active = !this.skyView.active
    },
    toggleOrthoPhoto () {
      this.orthoPhoto.active = !this.orthoPhoto.active
    }
  }
})
