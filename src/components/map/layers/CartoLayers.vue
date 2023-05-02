<template>
  <ol-tile-layer>
    <ol-source-osm ref="osmSource"/>
  </ol-tile-layer>
  <CustomWMTSLayer v-for="layer in mapStore.getLayers" :key="layer.name" :layer="layer"/>
  <ol-tile-layer>
    <ol-source-xyz ref="cavesSource" url="https://services7.arcgis.com/V2VriwTjJDabpGg6/ArcGIS/rest/services/2022_marec_export_ekataster_tile_layer/MapServer/WMTS/tile/1.0.0/2022_marec_export_ekataster_tile_layer/default/default028mm/{z}/{y}/{x}.png"/>
  </ol-tile-layer>
</template>

<script>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from 'stores/map-store'
import CustomWMTSLayer from './CustomWMTSLayer.vue'
import { db } from 'src/db/db'

export default {
  components: { CustomWMTSLayer },
  setup () {
    const mapStore = useMapStore()
    const skyViewLayer = ref(null)
    const orthoPhotoLayer = ref(null)
    const cavesSource = ref(null)
    const osmSource = ref(null)
    const { isSkyViewActive, isOrthoPhotoActive, getOrthoPhoto } = storeToRefs(mapStore)

    return {
      skyViewLayer,
      orthoPhotoLayer,
      isSkyViewActive,
      isOrthoPhotoActive,
      mapStore,
      getOrthoPhoto,
      osmSource,
      cavesSource
    }
  },
  watch: {
    isSkyViewActive (newValue, oldValue) {
      this.skyViewLayer.tileLayer.setVisible(newValue)
    }
  },
  async mounted () {
    [this.cavesSource, this.osmSource].map(src => {
      return src.source.setTileLoadFunction(async (tile, url) => {
        const image = tile.getImage()
        const sanitizedUrl = url.replace(/^(https?:\/\/)[abc]\./, '$1')
        const storedTile = await db.tiles.where('tileKey')
          .equals(sanitizedUrl)
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
    })
  }
}
</script>
