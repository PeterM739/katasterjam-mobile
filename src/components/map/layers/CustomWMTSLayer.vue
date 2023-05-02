<template>
  <ol-tile-layer ref="layerRef">
  </ol-tile-layer>
</template>

<script>
import { ref } from 'vue'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import { WMTSCapabilities } from 'ol/format'
import { useMapStore } from 'stores/map-store'
import { db } from 'src/db/db'
export default {
  props: { layer: Object },
  setup () {
    const mapStore = useMapStore()
    const layerRef = ref(null)

    return {
      layerRef,
      mapStore
    }
  },
  async mounted () {
    const loadLayer = async (layerData, layerRef) => {
      const wmtsParser = new WMTSCapabilities()
      const capabilitiesText = localStorage.getItem(`cap-${layerData.label}`)
      const capabilities = wmtsParser.read(capabilitiesText)
      const optionsFromCap = optionsFromCapabilities(capabilities, {
        layer: layerData.layerName
      })
      const options = {
        projection: layerData.projection,
        ...optionsFromCap,
        attributions: [layerData.attributes],
        crossOrigin: 'anonymous'
      }
      const wmtsSource = new WMTS(options)
      this.mapStore.setSource(layerData, wmtsSource)
      wmtsSource.setTileLoadFunction(async (tile, url) => {
        const image = tile.getImage()
        const storedTile = await db.tiles.where('tileKey')
          .equals(url)
          .first()
        if (!storedTile) {
          image.src = url
          return
        }
        const objUrl = URL.createObjectURL(storedTile.image)
        image.onload = function () {
          URL.revokeObjectURL(objUrl)
        }
        image.src = objUrl
      })

      layerRef.tileLayer.setVisible(this.layer.active)
      layerRef.tileLayer.setSource(wmtsSource)
    }
    await loadLayer(this.layer, this.layerRef)
  },
  watch: {
    layer: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.layerRef.tileLayer.setVisible(newVal.active)
      }
    }
  }
}
</script>
