<template>
  <ol-map loadTilesWhileAnimating loadTilesWhileInteracting style="height:200px;">
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
  </ol-map>
</template>
<script>
import { ref } from 'vue'
import CartoLayers from 'src/components/map/layers/CartoLayers.vue'
export default {
  name: 'SimpleMap',
  components: { CartoLayers },
  props: ['center', 'markLocations'],
  setup () {
    const projection = ref('EPSG:3857')
    const zoom = ref(15)
    const view = ref('')

    return {
      projection,
      zoom,
      view
    }
  }
}
</script>
