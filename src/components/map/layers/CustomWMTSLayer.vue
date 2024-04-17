<template>
  <ol-tile-layer ref="layerRef">
  </ol-tile-layer>
</template>

<script>
import { ref } from 'vue'
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import { useMapStore } from 'stores/map-store'
import { useAuthStore } from 'stores/auth-store'
import { db } from 'src/db/db'
import TileState from 'ol/TileState'
export default {
  props: { layer: Object },
  setup () {
    const mapStore = useMapStore()
    const authStore = useAuthStore()
    const layerRef = ref(null)

    return {
      layerRef,
      mapStore,
      authStore
    }
  },
  async mounted () {
    const loadLayer = async (layerData, layerRef) => {
      const capabilitiesText = localStorage.getItem(`cap-${layerData.label}`)
      const capabilities = JSON.parse(capabilitiesText.replace(/http:\/\//g, 'https://'))
      const optionsFromCap = optionsFromCapabilities(capabilities, {
        layer: layerData.layerName
      })
      const options = {
        projection: layerData.projection,
        ...optionsFromCap,
        attributions: [layerData.attributes],
        crossOrigin: 'anonymous'
      }
      options.tileLoadFunction = async (imageTile, src) => {
        const image = imageTile.getImage()
        const storedTile = await db.tiles.where('tileKey')
          .equals(src)
          .first()
        if (!storedTile) {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', src)
          xhr.setRequestHeader('Authorization', `Bearer ${this.authStore.getAccessToken}`)

          xhr.onload = function () {
            if (xhr.status === 200) {
              const url = URL.createObjectURL(new Blob([xhr.response], { type: 'image/png' }))
              image.src = url
            } else {
              imageTile.setState(TileState.ERROR)
            }
          }
          xhr.responseType = 'arraybuffer'
          xhr.send()

          return
        }
        const objUrl = URL.createObjectURL(storedTile.image)
        image.onload = function () {
          URL.revokeObjectURL(objUrl)
        }
        image.src = objUrl
      }
      const wmtsSource = new WMTS(options)
      this.mapStore.setSource(layerData, wmtsSource)

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
