<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="confirmDialog" noBackdropDismiss>
        <q-card style="width: 300px" class="q-px-sm q-pb-md">
          <q-form
          @submit="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
          >
          <q-card-section>
            <div class="text-h6">{{ $t('dataForOffline') }}</div>
          </q-card-section>
          <q-card-section>
            <q-input :disable="inProgress" v-model="offlineDataName" :label="$t('offlineDataName')" dense :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          </q-card-section>
          <q-item-label header>{{ $t('mapLayers') }}</q-item-label>
          <q-item dense>
            <q-item-section avatar>
              <q-checkbox :disable="inProgress" v-model="selectedItems" val="osm" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('osmMapLayer') }}</q-item-label>
              <q-item-label caption>{{ $t('osmMapLayerDescription') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section avatar>
              <q-checkbox :disable="inProgress" v-model="selectedItems" val="lidar" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('lidarMapLayer') }}</q-item-label>
              <q-item-label caption>{{ $t('lidarMapLayerDescription') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section avatar top>
              <q-checkbox :disable="inProgress" v-model="selectedItems" val="ortophoto" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('orthoMapLayer') }}</q-item-label>
              <q-item-label caption>
                {{ $t('orthoMapLayerDescription') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item-label header>{{ $t('caves') }}</q-item-label>
          <q-item dense>
            <q-item-section avatar top>
              <q-checkbox :disable="inProgress" v-model="selectedItems" val="caves" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('caveData') }}</q-item-label>
              <q-item-label caption>
                {{ $t('caveDataDescription') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item-label header>{{ $t('customLocations')}} </q-item-label>
          <q-item dense>
            <q-item-section avatar top>
              <q-checkbox :disable="inProgress" v-model="selectedItems" val="customLocations" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('customLocationsData') }}</q-item-label>
              <q-item-label caption>
                {{ $t('customLocationsDataDescription') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-card-section class="text-center q-pa-none" v-if="inProgress">
            <p class="text-grey-6">{{ $t('fetchingData') }}: {{ allProgressLabel }}</p>
            <q-linear-progress :instant-feedback="true" size="50px" :value="progress" color="accent" class="q-mt-sm">

              <div class="absolute-full flex flex-center">
                <q-badge color="white" text-color="accent" :label="progressLabel" />
              </div>
            </q-linear-progress>
          </q-card-section>
          <q-card-actions align="center" class="q-mt-md">
            <q-btn :disable="inProgress" :label="$t('download')" type="submit" color="primary"/>
            <q-btn :label="$t('cancel')" type="reset" color="primary" flat class="q-ml-sm" />
          </q-card-actions>
          </q-form>
        </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useOfflineStore } from 'stores/offline-store'
import { useMapStore } from 'stores/map-store'

export default {
  setup () {
    const { dialog, notify } = useQuasar()
    const offlineStore = useOfflineStore()
    const mapStore = useMapStore()
    const { getShowDialog, progress, allContent, currentContent } = storeToRefs(offlineStore)
    const inProgress = ref(false)
    const offlineDataName = ref('')

    return {
      notify,
      offlineDataName,
      offlineStore,
      mapStore,
      getShowDialog,
      selectedItems: ref([]),
      confirmDialog: ref(false),
      confirmDownloadDialog: dialog,
      progress,
      allContent,
      currentContent,
      progressLabel: computed(() => (progress.value * 100).toFixed(2) + '%'),
      allProgressLabel: computed(() => currentContent.value + '/' + allContent.value),
      inProgress
    }
  },
  watch: {
    getShowDialog (newValue, oldValue) {
      this.confirmDialog = newValue
    }
  },
  methods: {
    async onSubmit () {
      if (this.offlineDataName.length === 0) {
        this.notify({
          message: this.$t('offlineNameMissing'),
          color: 'red'
        })

        return
      }
      this.confirmDownloadDialog({
        title: `${this.$t('confirm')}`,
        message: `${this.$t('confirmDownloadOfArea')}`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        this.inProgress = true
        try {
          await this.offlineStore.transferData(
            [...this.selectedItems, 'cavesLayer'],
            this.mapStore.getExtent,
            this.offlineDataName)
        } catch (error) {
          console.log(error)
        } finally {
          this.onReset()
        }
      })
    },
    onReset () {
      this.inProgress = false
      this.confirmDialog = false
      this.offlineStore.hideDialog()
    }
  }
}
</script>
