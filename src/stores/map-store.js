import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    layers: [{
      active: false,
      label: 'Lidar',
      url: 'https://gisserver.gov.si/arcgis/rest/services/TEMELJNE_KARTE/LidarTlaZgradbe_D96/MapServer/WMTS',
      layerName: 'TEMELJNE_KARTE_LidarTlaZgradbe_D96',
      projection: 'EPSG:3794',
      attributes: 'Ministrstvo za kulturo, Ministrstvo za okolje in prostor',
      preview: 'map/skyview.png'
    }, {
      active: false,
      label: 'Ortho',
      url: 'https://gisserver.gov.si/arcgis/rest/services/TEMELJNE_KARTE/DOF2021/MapServer/WMTS',
      layerName: 'TEMELJNE_KARTE_DOF2021',
      projection: 'EPSG:3912',
      attributes: 'Ortophoto podlaga, GURS',
      preview: 'map/ortophoto.png'
    }]
  }),
  getters: {
    getLayers (state) {
      return state.layers
    }
  }
})
