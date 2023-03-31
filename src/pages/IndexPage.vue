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

      <ol-vector-layer>
        <ol-source-vector :features="markLocations">
        </ol-source-vector>
      </ol-vector-layer>
    </ol-map>
    <q-page-sticky position="top-right" :offset="[18, 18]">
      <q-fab
      size="100px"
        external-label
        color="purple"
        icon="layers"
        direction="left"
      >
        <q-fab-action v-for="layer in mapStore.getLayers" :key="layer.name" padding="3px" label-class="bg-grey-3 text-grey-8" external-label label-position="bottom"
          :color="layer.active ? 'red' : 'primary'"
          @click="layer.active = !layer.active"
          :icon="`img:${layer.preview}`"
          :label="layer.label" />
      </q-fab>
    </q-page-sticky>

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
import { useLocationStore } from 'stores/location-store'
import { useMapStore } from 'stores/map-store'
export default defineComponent({
  name: 'IndexPage',
  components: { PageFullScreen, CartoLayers, LocationLayers },
  setup () {
    const store = useLocationStore()
    const mapStore = useMapStore()
    const center = ref([1637531, 5766419])
    const projection = ref('EPSG:3857')
    const zoom = ref(8)
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
      mapStore
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
