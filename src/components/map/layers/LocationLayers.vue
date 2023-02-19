<template>
  <ol-vector-layer>
    <ol-source-vector :features="myLocationFeatures">
    </ol-source-vector>
  </ol-vector-layer>
  <ol-overlay :position="myLocationCoordinates" :positioning="'center-center'" v-if="myLocationFeatures.length > 0">
    <template v-slot="slotProps">
      <q-icon name="navigation" :class="slotProps" :style="{ rotate: rotation + 'deg' }" size="lg" />
    </template>
  </ol-overlay>
  <TrackingLayer/>
  <NavigationLayer />
</template>
<script>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import Point from 'ol/geom/Point'
import { Feature } from 'ol'
import { circular } from 'ol/geom/Polygon'
import TrackingLayer from './TrackingLayer.vue'
import NavigationLayer from './NavigationLayer.vue'
import { useLocationStore } from 'stores/location-store'
export default {
  props: ['view'],
  emits: ['centerChanged'],
  components: { TrackingLayer, NavigationLayer },
  setup () {
    const store = useLocationStore()
    const myLocationCoordinates = ref([])
    const myLocationFeatures = ref([])
    const { myLocation } = storeToRefs(store)

    return {
      store,
      myLocationCoordinates,
      myLocationFeatures,
      myLocation
    }
  },
  computed: {
    rotation () {
      return this.store.getRotation
    }
  },
  watch: {
    myLocation (newValue, oldValue) {
      const accuracy = circular([newValue.longitude, newValue.latitude], this.store.getMyLocationAccuracy)
      this.myLocationFeatures = [
        new Feature(accuracy.transform('EPSG:4326', this.store.getProjection)),
        new Feature(new Point(this.store.getMyLocationCoordinates))
      ]
      this.myLocationCoordinates = newValue.coordinates
      this.$emit('centerChanged', this.store.getMyLocationCoordinates)
    }
  }
}
</script>
