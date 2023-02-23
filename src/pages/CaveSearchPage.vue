<template>
  <q-input
    :loading="searching"
    v-model="query"
    debounce="500"
    filled
    :placeholder="$t('search')"
    :hint="$t('searchForCave')"
  >
    <template v-slot:append>
      <q-icon v-if="query !== ''" name="close" @click="query = ''" class="cursor-pointer" />
      <q-icon v-else name="search" />
    </template>
    <template v-slot:after>
      <q-btn round dense flat icon="gps_fixed" @click="searchAroundMe" :color="currentSort === 'distance' ? 'light-green' : ''"/>
    </template>
  </q-input>
  <q-pull-to-refresh @refresh="refresh">
    <q-list ref="scrollTargetRef" class="scroll" >
      <div v-for="(cave, index) in caves" :key="index" >
        <q-slide-item @left="opt => goTo(opt, cave)">
          <template v-slot:left>
            <q-icon name="assist_walker" />
          </template>
          <q-item clickable @click="caveClick(cave.caveNumber)">
            <q-item-section avatar top>
              <q-avatar icon="info" color="primary" text-color="white" />
              <q-icon name="keyboard_double_arrow_right" size="lg" color="primary"></q-icon>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">{{ cave.caveNumber }} - {{ cave.name }}</q-item-label>
              <q-item-label caption>{{$t('length')}}: {{ cave.length }} m, {{$t('depth')}}: {{ cave.depth }} m</q-item-label>
              <q-item-label caption>{{ cave.organization }}</q-item-label>
              <q-item-label v-if="cave.distance" caption>{{$t('distance')}}: {{ parseInt(cave.distance) }} m</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="map" color="green" size="lg" @click.stop="showOnMapClick(cave)"/>
            </q-item-section>
          </q-item>
        </q-slide-item>
        <q-separator/>
      </div>
    </q-list>
  </q-pull-to-refresh>
  <q-btn unelevated color="light-blue-7" size="lg" class="full-width" :label="$t('loadMore')" @click="loadMore" :disabled="(totalPages <= pageNumber)"/>
</template>

<script>

import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useCavesStore } from 'stores/cave-store'
export default {
  name: 'CaveSearchPage',
  setup () {
    const { dialog } = useQuasar()
    const store = useCavesStore()

    if (store.getCaves.length === 0) {
      store.searchForCaves().then(() => {
        console.log('caves loaded')
      })
    }
    const query = ref(store.getQuery)
    const selectedCave = ref(null)
    const confirmRef = ref(null)

    return {
      confirmDialog: dialog,
      store,
      query,
      confirm: ref(false),
      selectedCave,
      closeSlider: null,
      confirmRef
    }
  },
  computed: {
    caves () {
      return this.store.getCaves
    },
    pageNumber () {
      return this.store.getPageNumber
    },
    totalPages () {
      return this.store.getTotalPages
    },
    currentSort () {
      return this.store.getCurrentSort
    },
    selectedName () {
      return `[${this.selectedCave?.caveNumber}] ${this.selectedCave?.name}`
    },
    searching () {
      return this.store.getSearchingStatus
    }
  },
  watch: {
    query (newQuery, oldQuery) {
      this.executeSearch()
    }
  },
  methods: {
    goTo ({ reset }, cave) {
      reset()
      this.selectedCave = cave
      const name = `[${this.selectedCave?.caveNumber}] ${this.selectedCave?.name}`
      this.confirmDialog({
        title: `${this.$t('confirm')}`,
        message: `${this.$t('navigateToCave')}: ${name}`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$router.push({
          path: '/',
          query: {
            lat: this.selectedCave.lat,
            lng: this.selectedCave.lng,
            navigate: true,
            name
          }
        })
      })
    },
    caveClick (caveNumber) {
      this.$router.push({
        name: 'caves-details',
        params: { caveNumber }
      })
    },
    showOnMapClick (cave) {
      this.$router.push({
        path: '/',
        query: {
          lat: cave.lat,
          lng: cave.lng
        }
      })
    },
    async loadMore () {
      this.store.incrementPageNumber()

      await this.store.searchForCaves()
    },
    async executeSearch () {
      this.store.clearLocationParameters()
      this.store.addQueryParameter(this.query)
      await this.store.searchForCaves()
    },
    async searchAroundMe () {
      if (this.currentSort) {
        this.store.clearLocationParameters()
        this.store.addQueryParameter(this.query)
        await this.store.searchForCaves()

        return
      }
      await this.store.searchForNearbyCaves()
    },
    async refresh (done) {
      if (this.currentSort === 'distance') {
        await this.store.searchForNearbyCaves()
      } else {
        await this.store.searchForCaves()
      }
      done()
    }
  }
}
</script>
