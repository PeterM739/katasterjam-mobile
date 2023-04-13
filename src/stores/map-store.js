import { defineStore } from 'pinia'
import * as olProj from 'ol/proj'
import { EsriJSON } from 'ol/format'
import { useLocalCavesStore } from './local-cave-store'

export const useMapStore = defineStore('map', {
  state: () => ({
    mapRef: null,
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
    }],
    bottomDrawer: false,
    drawerLoading: false,
    clickedFeature: {}
  }),
  getters: {
    getLayers (state) {
      return state.layers
    },
    getClickedFeature (state) {
      return state.clickedFeature
    },
    getDrawerLoading (state) {
      return state.drawerLoading
    },
    showBottomDrawer (state) {
      return state.bottomDrawer
    },
    getMap (state) {
      return state.mapRef.map
    }
  },
  actions: {
    async mapClick (coordinates, featuresClick) {
      this.bottomDrawer = true
      this.drawerLoading = true
      try {
        const lngLat = olProj.toLonLat(coordinates)
        this.clickedFeature = {
          lat: lngLat[1].toFixed(5),
          lng: lngLat[0].toFixed(5),
          type: 'click'
        }
        const features = featuresClick.filter(f => f.values_.type === 'poi')
        if (features.length > 0) {
          this.clickedFeature = {
            ...features[0].values_
          }
        } else {
          const result = await this.getCavesFromLocalStorage(coordinates)
          if (result) {
            const cave = result
            this.clickedFeature = {
              id: cave.caveNumber,
              name: cave.name,
              lat: cave.lat,
              lng: cave.lon,
              length: cave.length,
              depth: cave.depth,
              type: 'cave'
            }
          }
        }
      } catch (error) {
        console.log('error while fetching data: ', error)
      } finally {
        this.drawerLoading = false
      }
    },
    hideDrawer () {
      this.bottomDrawer = false
    },
    saveMapRef (mapRef) {
      this.mapRef = mapRef
    },
    async getCavesFromLocalStorage (coordinates) {
      const lngLat = olProj.toLonLat(coordinates)
      const store = useLocalCavesStore()
      let distance = 4000 / Math.pow(2, (this.getMap.getView().getZoom() - 9))
      distance = distance < 5 ? 5 : distance
      const closestCaves = await store.getClosestCavesFor({
        longitude: lngLat[0],
        latitude: lngLat[1]
      })

      if (closestCaves.length > 0 && closestCaves[0].distance <= distance) {
        return closestCaves[0]
      }

      return null
    },
    async getRemoteFeatures (coordinate) {
      let distance = 4000 / Math.pow(2, (this.getMap.getView().getZoom() - 9))
      distance = distance < 5 ? 5 : distance
      const url = 'https://services7.arcgis.com/V2VriwTjJDabpGg6/arcgis/rest/services/2023_marec_export_ekataster_a/FeatureServer/0/query/?f=json&' +
        'returnGeometry=true&geometry=' +
        encodeURIComponent('{"x":' + (coordinate[0]) + ',"y":' + (coordinate[1]) + ',"spatialReference":{"wkid":102100}}') +
        `&distance=${distance}` +
        '&geometryType=esriGeometryPoint&inSR=102100&outFields=*&outSR=102100'
      const response = await fetch(url)
      const val = await response.text()
      const esriJsonFormat = new EsriJSON()
      const features = esriJsonFormat.readFeatures(val, {
        featureProjection: this.getMap.getView().getProjection()
      })

      return features
    }
  }
})
