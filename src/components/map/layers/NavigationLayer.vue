<template>
  <q-dialog v-model="navigationInProgress" :position="position" seamless class="q-dialog__top50">
      <q-card style="width: 350px">
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">Go to: {{ name }}</div>
            <div class="text-grey">Distance: {{ distance }} {{ distanceUnit }}</div>
          </div>

          <q-space />
          <q-icon name="navigation" :style="{ rotate: bearing + 'deg' }" size="lg" />
          <q-btn flat round icon="stop" @click="stopNavigation"/>
        </q-card-section>
      </q-card>
    </q-dialog>
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
import { ref } from 'vue'
import { useLocationStore } from 'stores/location-store'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'

export default {
  setup () {
    const dialog = ref(true)
    const position = ref('top')
    const store = useLocationStore()
    const strokeWidth = ref(3)
    const strokeColor = ref('green')

    return {
      dialog,
      position,
      store,
      strokeWidth,
      strokeColor
    }
  },
  data () {
    return {
      currentCenter: this.center,
      currentZoom: this.zoom,
      currentResolution: this.resolution,
      fixedCenter: false,
      name: this.$route.query.name
    }
  },
  computed: {
    bearing () {
      const directionBetweenTwoPoints = ([x1, y1], [x2, y2]) => {
        const x = x2 - x1
        const y = y2 - y1
        return ((Math.atan2(x, y) * 180 / Math.PI) + 360) % 360
      }
      const direction = directionBetweenTwoPoints(this.store.getNavigateTo[1], this.store.getNavigateTo[0])

      return direction - this.store.getRotation
    },
    navigateTo () {
      return this.store.getNavigateTo
    },
    navigationInProgress () {
      return this.store.getNavigateTo.length > 0
    },
    distance () {
      const line = new LineString(this.store.getNavigateTo)
      const distanceInMeters = getLength(line)
      if (distanceInMeters > 1000) {
        return (distanceInMeters / 1000).toFixed(2)
      }
      return parseInt(distanceInMeters)
    },
    distanceUnit () {
      const line = new LineString(this.store.getNavigateTo)
      const distanceInMeters = getLength(line)
      if (distanceInMeters > 1000) {
        return 'km'
      }
      return 'm'
    }
  },
  methods: {
    stopNavigation () {
      this.store.stopNavigation()
    }
  }
}
</script>
<style>
.q-dialog__top50 {
  top: 50px;
  z-index: 1000;
}
.q-dialog__inner--top {
  top: 50px;
}
</style>
