<template>
  <q-card>
    <SimpleHeaderMap :center="center" :extent="extentPolygon" :height="'400px'"/>
    <q-card-section>
      <div class="text-overline text-orange-9">{{$t('offlineDataDetails')}}</div>
      <div class="row no-wrap items-center">
        <div class="col text-h6 ellipsis">
          {{ offlineRecord.id }} - {{ offlineRecord.name }}
        </div>
      </div>

      <q-fab
        class="absolute"
        style="top: 0; right: 12px; transform: translateY(-50%);"
        vertical-actions-align="right"
        color="primary"
        glossy
        icon="keyboard_arrow_down"
        direction="down"
      >
        <q-fab-action label-position="left" color="green" icon="delete" :label="$t('delete')" @click="deleteRecord" />
      </q-fab>
    </q-card-section>

      <q-card-section horizontal>
        <q-card-section>
          <div class="text-grey text-caption q-pt-md items-center" v-if="offlineRecord.date">
            {{$t('date')}}: {{ offlineRecord.date }}
          </div>
        </q-card-section>
    </q-card-section>
    <q-separator />
    <q-markup-table>
      <tbody>
        <tr>
          <td class="text-left table-row-fit">{{$t('numberOfTiles')}}</td>
          <td class="text-left table-row-fit">{{ numberOfTiles }} tiles</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('storedItems')}}</td>
          <td class="text-left table-row-fit">
            <span :key="selectedItem" v-for="(selectedItem, index) in offlineRecord.selectedItems">
              {{ $t(selectedItem) }}<span v-if="index+1 < offlineRecord.selectedItems.length">, </span>
            </span>
          </td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('dataSize')}}</td>
          <td class="text-left table-row-fit"> {{ (parseInt(offlineRecord.totalSize) / 1000000).toFixed(2) }} MB</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-card>
</template>
<script>
import { defineComponent, ref } from 'vue'
import { useOfflineStore } from 'stores/offline-store'
import SimpleHeaderMap from 'src/components/map/SimpleHeaderMap.vue'
import { getCenter } from 'ol/extent'
export default defineComponent({
  name: 'OfflineDataPage',
  components: { SimpleHeaderMap },
  setup () {
    const store = useOfflineStore()
    const center = ref([1637531, 5766419])
    const offlineRecord = ref(null)
    const extentPolygon = ref(null)
    const numberOfTiles = ref(0)
    return {
      center,
      extentPolygon,
      offlineRecord,
      numberOfTiles,
      store
    }
  },
  methods: {
    deleteRecord () {
      this.confirmDialog({
        title: `${this.$t('confirm')}`,
        message: `${this.$t('confirmDeleteOfflineRecords')}`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await this.store.deleteAll(this.offlineRecord.id)
      })
    }
  },
  created () {
    this.offlineRecord = this.$route.meta.offlineRecord
    this.store.getNumberOfTiles(this.offlineRecord.id).then(number => {
      this.numberOfTiles = number
    })
    if (this.offlineRecord.extent) {
      this.center = getCenter(this.offlineRecord.extent)
      this.extentPolygon = [[
        [this.offlineRecord.extent[0], this.offlineRecord.extent[1]],
        [this.offlineRecord.extent[0], this.offlineRecord.extent[3]],
        [this.offlineRecord.extent[2], this.offlineRecord.extent[3]],
        [this.offlineRecord.extent[2], this.offlineRecord.extent[1]]
      ]]
    }
  }
})
</script>
