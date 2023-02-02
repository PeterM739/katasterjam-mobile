<template>
  <PageFullScreen style="background: #eee">
    <ol-map loadTilesWhileAnimating loadTilesWhileInteracting style="height:100%;">

      <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
        @zoomChanged="zoomChanged"
        @centerChanged="centerChanged"
        @resolutionChanged="resolutionChanged"
        @rotationChanged="rotationChanged" />

      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>

    </ol-map>
  </PageFullScreen>
</template>

<script>
import { ref, defineComponent } from 'vue'
import PageFullScreen from 'layouts/PageFullScreen.vue'

export default defineComponent({
  name: 'IndexPage',
  components: { PageFullScreen },
  setup () {
    const center = ref([1637531.7171455352, 5766419.270826726])
    const projection = ref('EPSG:3857')
    const zoom = ref(8)
    const rotation = ref(0)
    return {
      center,
      projection,
      zoom,
      rotation
    }
  },
  data () {
    return {
      currentCenter: this.center,
      currentZoom: this.zoom,
      currentResolution: this.resolution,
      currentRotation: this.rotation
    }
  },
  methods: {
    startTracking () {
      if (this.$q.platform.is.cordova) {
        try {
          window.BackgroundGeolocation.configure({
            locationProvider: window.BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
            desiredAccuracy: window.BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 10,
            distanceFilter: 10,
            stopOnTerminate: false,
            notificationTitle: 'Location tracking',
            notificationText: 'Vaša lokacija se beleži v ozadju',
            debug: false,
            httpHeaders: { 'X-Auth': 'če ga rabiš' },
            interval: 60000,
            fastestInterval: 10000,
            activitiesInterval: 30000,
            url: 'https://katasterjam.si/api/track',
            syncUrl: 'https://katasterjam.si/api/sync'
          })

          window.BackgroundGeolocation.on('authorization', (status) => {
            if (status !== window.BackgroundGeolocation.AUTHORIZED) {
              setTimeout(() => {
                navigator.notification.confirm('Prosimo vključite dostop do lokacije', b => {
                  if (b === 1) {
                    window.BackgroundGeolocation.showAppSettings()
                  }
                }, 'Kataster jam')
              }, 1000)
            }
          })

          window.BackgroundGeolocation.start()
        } catch (e) {
          console.error(e)
        }
      }
    },
    zoomChanged (currentZoom) {
      this.currentZoom = currentZoom
    },
    resolutionChanged (resolution) {
      this.currentResolution = resolution
    },
    centerChanged (center) {
      this.currentCenter = center
      console.info(center)
    },
    rotationChanged (rotation) {
      this.currentRotation = rotation
    }
  }
})
</script>
