<template>
  <template v-if="offlineRecords.length === 0">
    <q-item>
        <q-item-section class="text-center">
          <q-item-label class="text-h6" style="padding-top: 50px;">
            {{ $t('noRecords') }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  <q-pull-to-refresh v-else @refresh="refresh">
    <q-list ref="scrollTargetRef" class="scroll" >
      <div v-for="(offlineRecord, index) in offlineRecords" :key="index" >
        <q-item clickable @click="click(offlineRecord.id)">
          <q-item-section avatar top>
            <q-avatar icon="info" color="primary" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">{{ offlineRecord.id }} - {{ offlineRecord.name }}</q-item-label>

            <q-item-label caption>{{$t('size')}}: {{ (parseInt(offlineRecord.totalSize) / 1000000).toFixed(2) }} MB</q-item-label>
            <q-item-label vfeature-if="offlineRecord.date" caption>{{$t('date')}}: {{ offlineRecord.date }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="delete" color="black" size="lg" @click.stop="deleteRecord(offlineRecord)"/>
          </q-item-section>
        </q-item>
        <q-separator/>
      </div>
    </q-list>
  </q-pull-to-refresh>
</template>
<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useOfflineStore } from 'stores/offline-store'
export default defineComponent({
  name: 'OfflineDataList',
  components: {},
  setup () {
    const { dialog } = useQuasar()
    const store = useOfflineStore()
    store.searchRecords().then(() => {
      console.log('offline records loaded')
    })
    return {
      confirmDialog: dialog,
      store
    }
  },
  computed: {
    offlineRecords () {
      return this.store.getOfflineRecords
    }
  },
  methods: {
    async refresh (done) {
      await this.store.searchRecords()
      done()
    },
    click (id) {
      this.$router.push({
        name: 'offline-data-page',
        params: { id }
      })
    },
    deleteRecord (record) {
      this.confirmDialog({
        title: `${this.$t('confirm')}`,
        message: `${this.$t('confirmDeleteOfflineRecords')}`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await this.store.deleteAll(record.id)
        await this.store.searchRecords()
      })
    }
  }
})
</script>
