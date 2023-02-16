<template>
  <ol-vector-layer>
    <ol-source-vector>
      <ol-feature>
        <ol-geom-line-string :coordinates="myTrack"></ol-geom-line-string>
          <ol-style>
            <ol-style-stroke :color="strokeColor" :width="strokeWidth"></ol-style-stroke>
          </ol-style>
      </ol-feature>
    </ol-source-vector>
  </ol-vector-layer>
</template>

<script>
import { fromLonLat } from 'ol/proj'
import { ref } from 'vue'
import { useLocationStore } from 'stores/location-store'

export default {
  setup () {
    const store = useLocationStore()
    const strokeWidth = ref(5)
    const strokeColor = ref('red')
    store.registerForLocationUpdates({
      locationUpdated: (location) => {
        const coords = fromLonLat([location.longitude, location.latitude])
        if (store.getLocationTracking) {
          store.updateMyTrack(coords)
        }
      },
      locationStopped: () => {
        console.log('location terminated. TODO: handle track (delete or save)')
      }
    })

    return {
      store,
      strokeWidth,
      strokeColor
    }
  },
  computed: {
    myTrack () {
      return this.store.getMyTrack
    }
  }
}
</script>
