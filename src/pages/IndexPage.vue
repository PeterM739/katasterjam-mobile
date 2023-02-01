<template>
  <PageFullScreen style="background: #eee">
    <ol-map loadTilesWhileAnimating loadTilesWhileInteracting style="height:100%;">

      <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
        @zoomChanged="zoomChanged"
        @centerChanged="centerChanged"
        @resolutionChanged="resolutionChanged"
        @rotationChanged="rotationChanged" />

      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>

    </ol-map>
  </PageFullScreen>
</template>

<script>
import { ref, defineComponent } from 'vue'
import PageFullScreen from 'layouts/PageFullScreen.vue'

export default defineComponent({
  name: 'IndexPage',
  components: { PageFullScreen },
  setup () {
    const center = ref([1637531.7171455352, 5766419.270826726])
    const projection = ref('EPSG:3857')
    const zoom = ref(8)
    const rotation = ref(0)
    return {
      center,
      projection,
      zoom,
      rotation
    }
  },
  data () {
    return {
      currentCenter: this.center,
      currentZoom: this.zoom,
      currentResolution: this.resolution,
      currentRotation: this.rotation
    }
  },
  methods: {
    zoomChanged (currentZoom) {
      this.currentZoom = currentZoom
    },
    resolutionChanged (resolution) {
      this.currentResolution = resolution
    },
    centerChanged (center) {
      this.currentCenter = center
      console.info(center)
    },
    rotationChanged (rotation) {
      this.currentRotation = rotation
    }
  }
})
</script>
