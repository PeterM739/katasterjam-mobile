<template>
  <q-input
    :loading="searching"
    v-model="query"
    debounce="500"
    filled
    :placeholder="$t('search')"
    :hint="$t('searchForExcursion')"
  >
    <template v-slot:append>
      <q-icon v-if="query !== ''" name="close" @click="query = ''" class="cursor-pointer" />
      <q-icon v-else name="search" />
    </template>
    <template v-slot:after>
      <q-btn round dense flat icon="check" @click="onlyMine" :color="mine ? 'light-green' : ''"/>
    </template>
  </q-input>

  <q-pull-to-refresh @refresh="refresh">
    <q-list ref="scrollTargetRef" class="scroll" >
      <div v-for="(excursion, index) in excursions" :key="index" >
        <q-slide-item @left="opt => joinExcursion(opt, excursion)">
          <template v-slot:left v-if="canJoinExcursion(excursion)">
            <q-icon name="check" />
              {{$t('joinExcursion')}}
          </template>
          <q-item clickable @click="excursionClick(excursion.id)">
            <q-item-section avatar top>
              <q-avatar icon="info" color="primary" text-color="white" />
              <q-icon v-if="excursion.meParticipant" name="check" color="green" size="lg"></q-icon>
              <template v-else-if="excursion.requestedJoin">
                <q-icon name="check" color="grey" size="smc"></q-icon>
                <q-item-label caption>{{$t('requested')}}</q-item-label>
              </template>
              <q-icon v-else name="keyboard_double_arrow_right" size="lg" color="primary"></q-icon>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">{{ excursion.name }}</q-item-label>
              <q-item-label caption>{{$t('date')}}: {{ formatDate(excursion.dateOfExcursion) }}</q-item-label>
              <q-item-label caption>{{$t('excursionParticipants')}}: {{ excursion.participants }}</q-item-label>
            </q-item-section>

            <q-item-section side >
              <q-item-label caption v-for="(organization, idx) in excursion.organizations" :key="idx">{{ organization.name }}</q-item-label>
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
import { useLocalExcursionsStore } from 'stores/local-excursion-store'
import { formatDate } from 'src/helpers/date'
export default {
  name: 'ExcursionSearchPage',
  setup () {
    const { dialog } = useQuasar()
    const store = useLocalExcursionsStore()
    const query = ref(store.getQuery)
    const mine = ref(false)
    store.tryFetchExcursionsForOffline().then(() => {
      console.log('Excursion list updated')
    })
    store.search().then(() => {
      console.log('excursions loaded')
    })

    return {
      confirmDialog: dialog,
      store,
      mine,
      query,
      formatDate
    }
  },
  computed: {
    excursions () {
      return this.store.getExcursions
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
    canJoinExcursion (excursion) {
      return !excursion.meParticipant && !excursion.requestedJoin
    },
    excursionClick (id) {
      this.$router.push({
        name: 'trips-details',
        params: { id }
      })
    },
    joinExcursion ({ reset }, excursion) {
      reset()
      this.confirmDialog({
        title: `${this.$t('confirm')}`,
        message: `${this.$t('joinExcursionText')}${excursion.name}`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await this.store.joinExcursion(excursion)
      })
    },
    async onlyMine () {
      this.store.onlyMyExcursions(this.mine = !this.mine)
      await this.store.search()
    },
    async executeSearch () {
      this.store.addQueryParameter(this.query)
      await this.store.search()
    },
    async loadMore () {
      this.store.incrementPageNumber()
      await this.store.search()
    },
    async refresh (done) {
      await this.store.search()
      done()
    }
  }
}
</script>
