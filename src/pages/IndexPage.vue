<template>
  <PageFullScreen style="background: #eee">
    <ol-map loadTilesWhileAnimating loadTilesWhileInteracting style="height:100%;">

      <ol-view
        ref="view"
        :enableRotation="false"
        :center="center"
        :zoom="zoom"
        :projection="projection"
        @zoomChanged="zoomChanged"
        @centerChanged="centerChanged"
        @resolutionChanged="resolutionChanged"/>
      <CartoLayers/>
      <LocationLayers
        :view="view"
        @centerChanged="centerChanged"/>
      <CustomLocationLayers v-if="customLocations"/>
      <ol-vector-layer>
        <ol-source-vector :features="markLocations">
        </ol-source-vector>
      </ol-vector-layer>
    </ol-map>

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn fab :icon="isCenterFixed ? 'my_location' : 'location_searching'" color="accent" @click="myLocationClicked" />
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab :icon="trackLocationIcon ? 'stop_circle' : 'play_arrow'" color="accent" @click="trackingClicked" />
    </q-page-sticky>
  </PageFullScreen>
</template>

<script>
import { ref, defineComponent } from 'vue'
import { fromLonLat } from 'ol/proj'
import Point from 'ol/geom/Point'
import { Feature } from 'ol'
import PageFullScreen from 'layouts/PageFullScreen.vue'
import CartoLayers from 'src/components/map/layers/CartoLayers.vue'
import LocationLayers from 'src/components/map/layers/LocationLayers.vue'
import CustomLocationLayers from 'src/components/map/layers/CustomLocationLayers.vue'
import { useLocationStore } from 'stores/location-store'
export default defineComponent({
  name: 'IndexPage',
  components: { PageFullScreen, CartoLayers, LocationLayers, CustomLocationLayers },
  setup () {
    const store = useLocationStore()
    const center = ref([1637531, 5766419])
    const projection = ref('EPSG:3857')
    const zoom = ref(8)
    const customLocations = ref(false)
    const markLocations = ref([])
    const goTo = ref(null)

    const view = ref('')
    return {
      store,
      center,
      projection,
      zoom,
      view,
      markLocations,
      goTo,
      customLocations
    }
  },
  data () {
    if (this.$route.query.lat && this.$route.query.lng) {
      const coords = fromLonLat([this.$route.query.lng, this.$route.query.lat])
      const mark = new Feature(new Point(coords))
      this.markLocations = [mark]
      this.center = coords
      this.zoom = 15
      this.goTo = this.$route.query.navigate ? mark : null
    }
    this.customLocations = this.$route.query.customLocation

    return {
      currentCenter: this.center,
      currentZoom: this.zoom,
      currentResolution: this.resolution,
      fixedCenter: false
    }
  },
  computed: {
    trackLocationIcon () {
      return this.store.getLocationTracking
    },
    navigationActive () {
      return this.store.getNavigationActive
    },
    isCenterFixed () {
      return this.fixedCenter
    }
  },
  methods: {
    zoomChanged (currentZoom) {
      this.currentZoom = currentZoom
    },
    trackingClicked (evt) {
      this.store.toggleLocationTracking()
    },
    myLocationClicked (evt) {
      this.center = this.store.getMyLocationCoordinates
      this.fixedCenter = true
      this.zoom = this.zoom < 15 ? 15 : this.currentZoom
    },
    resolutionChanged (resolution) {
      this.currentResolution = resolution
    },
    centerChanged (center) {
      if (this.view === '') {
        return
      }
      this.currentCenter = center
      if (this.view.getInteracting()) {
        this.fixedCenter = false
      } else if (this.fixedCenter) {
        this.center = center
      }
    }
  },
  watch: {
    view (newVal, oldVal) {
      this.store.initialize(newVal.getProjection())
      if (this.goTo) {
        this.store.startNavigation(this.goTo)
      }
    }
  }
})
</script>
