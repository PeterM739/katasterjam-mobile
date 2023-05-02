<template>
  <ol-map ref="map" loadTilesWhileAnimating loadTilesWhileInteracting :style="{ height: height ?? '200px' }">
    <ol-view
      ref="view"
      :enableRotation="false"
      :center="center"
      :zoom="zoom"
      :projection="projection"/>
    <CartoLayers/>
    <ol-vector-layer>
      <ol-source-vector :features="markLocations">
      </ol-source-vector>
    </ol-vector-layer>
    <ol-vector-layer v-if="extent">
      <ol-source-vector ref="extentSource">
        <ol-feature>
          <ol-geom-polygon
            :coordinates="extent"
          ></ol-geom-polygon>
          <ol-style>
            <ol-style-stroke color="red" :width="2"></ol-style-stroke>
            <ol-style-fill color="rgba(255,0,0,0.2)"></ol-style-fill>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
  </ol-map>
</template>
<script>
import { ref } from 'vue'
import CartoLayers from 'src/components/map/layers/CartoLayers.vue'
export default {
  name: 'SimpleMap',
  components: { CartoLayers },
  props: ['center', 'markLocations', 'extent', 'height'],
  setup () {
    const projection = ref('EPSG:3857')
    const zoom = ref(15)
    const view = ref('')
    const map = ref('')
    const extentSource = ref('')

    return {
      projection,
      zoom,
      map,
      extentSource,
      view
    }
  },
  mounted () {
    if (this.extent) {
      const extent = this.extentSource.source.getExtent()
      this.map.map.getView().fit(extent, {
        size: this.map.map.getSize(),
        padding: [10, 10, 10, 10]
      })
    }
  }
}
</script>
