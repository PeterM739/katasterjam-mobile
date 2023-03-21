<template>
  <ol-tile-layer>
    <ol-source-osm />
  </ol-tile-layer>
  <ol-tile-layer ref="skyViewLayer">
  </ol-tile-layer>
  <ol-tile-layer ref="orthoPhotoLayer">
  </ol-tile-layer>
  <ol-tile-layer>
    <ol-source-xyz url="https://services7.arcgis.com/V2VriwTjJDabpGg6/ArcGIS/rest/services/2022_marec_export_ekataster_tile_layer/MapServer/WMTS/tile/1.0.0/2022_marec_export_ekataster_tile_layer/default/default028mm/{z}/{y}/{x}.png"/>
  </ol-tile-layer>
</template>

<script>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import { WMTSCapabilities } from 'ol/format'
import { useMapStore } from 'stores/map-store'

export default {
  setup () {
    const mapStore = useMapStore()
    const skyViewLayer = ref(null)
    const orthoPhotoLayer = ref(null)
    const { isSkyViewActive, isOrthoPhotoActive } = storeToRefs(mapStore)

    return {
      skyViewLayer,
      orthoPhotoLayer,
      isSkyViewActive,
      isOrthoPhotoActive,
      mapStore
    }
  },
  async mounted () {
    const loadLayer = async (layerData, layerRef) => {
      const wmtsParser = new WMTSCapabilities()
      const response = await fetch(layerData.url)
      const capText = await response.text()
      const capabilities = wmtsParser.read(capText)
      const optionsFromCap = optionsFromCapabilities(capabilities, {
        layer: layerData.layerName
      })
      const options = {
        projection: layerData.projection,
        ...optionsFromCap,
        attributions: [layerData.attributes],
        crossOrigin: 'anonymous'
      }
      this.wmtsSource = new WMTS(options)

      layerRef.tileLayer.setVisible(layerData.active)
      layerRef.tileLayer.setSource(this.wmtsSource)
    }
    await loadLayer(this.mapStore.skyView, this.skyViewLayer)
    await loadLayer(this.mapStore.orthoPhoto, this.orthoPhotoLayer)
  },
  watch: {
    isSkyViewActive (newValue, oldValue) {
      this.skyViewLayer.tileLayer.setVisible(newValue)
    },
    isOrthoPhotoActive (newValue, oldValue) {
      this.orthoPhotoLayer.tileLayer.setVisible(newValue)
    }
  }
}
</script>
