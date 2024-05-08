<template>
  <PageFullScreen style="background: #eee">
    <ol-map
      loadTilesWhileAnimating
      loadTilesWhileInteracting
      style="height:100%;"
      :moveTolerance="5"
      ref="mapRef">

      <ol-view
        ref="view"
        :enableRotation="false"
        :center="center"
        :zoom="zoom"
        :projection="projection"
        @change:center="centerChanged"
        @change:resolution="resolutionChanged"/>
      <CartoLayers/>
      <LocationLayers
        :view="view"
        @centerChanged="centerChanged"/>
      <CustomLocationLayers v-if="customLocations"/>
      <ol-vector-layer>
        <ol-source-vector :features="markLocations">
        </ol-source-vector>
      </ol-vector-layer>
      <q-resize-observer @resize="onScreenOrientationChange" />
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
      <q-fab size="100px"
        vertical-actions-align="right"
        glossy
        color="purple"
        icon="add"
        direction="up">
        <q-fab-action :disable="currentZoom < 14" label-position="right" color="primary" @click="storeDataForOffline" icon="wifi_off" label="Offline" />
        <q-fab-action label-position="right" color="secondary" :icon="trackLocationIcon ? 'stop_circle' : 'play_arrow'"  label="Start track" @click="trackingClicked" />
      </q-fab>
    </q-page-sticky>
    <DetailsDrawer />
    <OfflineConfirmDialog />
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
import DetailsDrawer from 'src/components/map/drawer/DetailsDrawer.vue'
import OfflineConfirmDialog from 'src/components/offline/OfflineConfirmDialog.vue'
import { useLocationStore } from 'stores/location-store'
import { useMapStore } from 'stores/map-store'
import { useOfflineStore } from 'stores/offline-store'
export default defineComponent({
  name: 'IndexPage',
  components: { PageFullScreen, CartoLayers, LocationLayers, CustomLocationLayers, DetailsDrawer, OfflineConfirmDialog },
  setup () {
    const locationStore = useLocationStore()
    const mapStore = useMapStore()
    const offlineStore = useOfflineStore()
    const center = ref([1637531, 5766419])
    const projection = ref('EPSG:3857')
    const zoom = ref(8)
    const customLocations = ref(false)
    const markLocations = ref([])
    const goTo = ref(null)

    const view = ref('')
    const mapRef = ref('')
    mapStore.saveMapRef(mapRef)

    return {
      locationStore,
      center,
      projection,
      zoom,
      view,
      mapRef,
      markLocations,
      goTo,
      customLocations,
      mapStore,
      offlineStore
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
      return this.locationStore.getLocationTracking
    },
    navigationActive () {
      return this.locationStore.getNavigationActive
    },
    isCenterFixed () {
      return this.fixedCenter
    }
  },
  methods: {
    async onMapClick (evt) {
      if (evt.coordinate) {
        const featuresClick = this.mapRef.map.getFeaturesAtPixel(evt.pixel)
        await this.mapStore.mapClick(evt.coordinate, featuresClick)
      }
    },
    zoomChanged (currentZoom) {
      this.currentZoom = currentZoom
      this.mapStore.updateExtent(this.mapRef.map.getView().calculateExtent())
    },
    trackingClicked (evt) {
      this.locationStore.toggleLocationTracking()
    },
    myLocationClicked (evt) {
      this.center = this.locationStore.getMyLocationCoordinates
      this.fixedCenter = true
      this.zoom = this.zoom < 15 ? 15 : this.currentZoom
    },
    resolutionChanged (event) {
      this.currentResolution = event.target.getResolution()
      this.zoomChanged(event.target.getZoom())
    },
    centerChanged (event) {
      if (!event.target) {
        return
      }
      const center = event.target.getCenter()
      if (this.view === '') {
        return
      }
      this.currentCenter = center
      if (this.view.getInteracting()) {
        this.fixedCenter = false
      } else if (this.fixedCenter) {
        this.center = center
      }
    },
    onScreenOrientationChange () {
      this.mapRef.updateSize()
    },
    storeDataForOffline () {
      this.offlineStore.showDialog()
    }
  },
  watch: {
    view (newVal, oldVal) {
      this.locationStore.initialize(newVal.getProjection())
      if (this.goTo) {
        this.locationStore.startNavigation(this.goTo)
      }
    }
  },
  mounted () {
    this.mapRef.map.on('click', async (evt) => {
      await this.onMapClick(evt)
    })
  }
})
</script>
