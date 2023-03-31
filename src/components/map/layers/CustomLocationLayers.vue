<template>
  <ol-vector-layer>
    <ol-source-vector ref="vectorSource">
    <ol-feature v-for="customLocation in customLocations" :key="customLocation.id" :properties="{
        'id': customLocation.id,
        'name': customLocation.name
      }">
        <ol-geom-point :coordinates="customLocation.latLng"></ol-geom-point>

        <ol-style>
          <ol-style-icon :src="customLocation.icon" :scale="1"></ol-style-icon>
        </ol-style>
      </ol-feature>
  </ol-source-vector>
    </ol-vector-layer>
</template>

<script>
import { ref } from 'vue'
import VectorSource from 'ol/source/Vector'
import { useCustomLocationStore } from 'stores/custom-location-store'

export default {
  setup () {
    const store = useCustomLocationStore()
    const customLocations = ref([])
    const vectorSource = ref(new VectorSource())
    store.loadForMap().then(() => {
      console.log('locations loaded')

      store.customLocationsForMap.map(cl => customLocations.value.push(cl))
    })

    return {
      vectorSource,
      store,
      customLocations
    }
  }
}
</script>
