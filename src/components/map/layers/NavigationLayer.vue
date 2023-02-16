<template>
 <ol-vector-layer>
    <ol-source-vector>
      <ol-feature>
        <ol-geom-line-string :coordinates="navigateTo"></ol-geom-line-string>
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
// add top template where user can see distance, direction and can cancelcoo
export default {
  setup () {
    const store = useLocationStore()
    const strokeWidth = ref(3)
    const strokeColor = ref('green')
    store.registerForLocationUpdates({
      locationUpdated: (location) => {
        const coords = fromLonLat([location.longitude, location.latitude])
        if (store.getNavigationActive) {
          store.updateNavigation(coords)
        }
      },
      locationStopped: () => {
        console.log('location terminated')
        if (!store.getNavigationActive) {
          store.updateNavigation([])
        }
      }
    })

    return {
      store,
      strokeWidth,
      strokeColor
    }
  },
  computed: {
    navigateTo () {
      return this.store.getNavigateTo
    }
  }
}
</script>
