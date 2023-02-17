<template>
  <ol-vector-layer>
    <ol-source-vector :features="myLocation">
    </ol-source-vector>
  </ol-vector-layer>
  <ol-overlay :position="myLocationCoordinates" :positioning="'center-center'" v-if="myLocation.length > 0">
    <template v-slot="slotProps">
      <q-icon name="navigation" :class="slotProps" :style="{ rotate: rotation + 'deg' }" size="lg" />
    </template>
  </ol-overlay>
  <TrackingLayer/>
  <NavigationLayer />
</template>
<script>
import { fromLonLat } from 'ol/proj'
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
    store.registerForLocationUpdates({
      locationUpdated: (location, projection) => {
        const coords = fromLonLat([location.longitude, location.latitude])
        const accuracy = circular([location.longitude, location.latitude], location.accuracy)
        store.updateMyLocation(coords, [
          new Feature(accuracy.transform('EPSG:4326', projection)),
          new Feature(new Point(coords))
        ])
      },
      locationStopped: () => {
        console.log('location terminated')
      }
    })

    return {
      store
    }
  },
  computed: {
    rotation () {
      return this.store.getRotation
    },
    myLocation () {
      return this.store.getMyLocation
    },
    myLocationCoordinates () {
      this.$emit('centerChanged', this.store.getMyLocationCoordinates)
      return this.store.getMyLocationCoordinates
    }
  }
}
</script>
