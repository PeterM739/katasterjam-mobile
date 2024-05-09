<template>
  <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
    <q-card class="text-white q-pa-md" style="width: 80%">
      <q-form
      @submit="onSubmit"
      @reset="reset"
      class="q-gutter-md"
      >
        <q-input
          filled
          v-model="name"
          :label="$t('customLocationName')"
          :hint="$t('locationNameHint')"
          lazy-rules
          :rules="[ inputValidator ]"
        />
        <q-input
          filled
          v-model="description"
          :label="$t('customLocationDescription')"
          lazy-rules
          :rules="[ inputValidator ]"
        />
        <q-select v-model="selectedType" :options="typeOptions" :label="$t('customLocationType')"
          lazy-rules
          :rules="[dropDownValidator]"/>
        <q-select v-model="selectedStatus" :options="statusOptions" :label="$t('customLocationStatus')"
          lazy-rules
          :rules="[dropDownValidator]"/>
        <q-select
        filled
        v-model="selectedExcursion"
        clearable
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :label="$t('excursion')"
        :options="excursionOptions"
        @filter="filterFn"
        @filter-abort="abortFilterFn"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{$t('noResults')}}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div class="q-gutter-md row items-center justify-end">
          <q-btn :label="$t('submit')" type="submit" color="primary"/>
          <q-btn :label="$t('cancel')" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
    </q-form>

    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { getDBDateNow } from 'src/helpers/date'
import { useLocationStore } from 'stores/location-store'
import { useExcursionsStore } from 'stores/excursion-store'
import { useLocalCustomLocationStore } from 'stores/local-custom-location-store'
export default {
  setup () {
    const locationStore = useLocationStore()
    const excursionStore = useExcursionsStore()
    const localCustomLocationStore = useLocalCustomLocationStore()
    const dialog = ref(false)
    const name = ref(null)
    const description = ref(null)
    const { getAddLocation } = storeToRefs(locationStore)
    const excursionOptions = ref([])
    const typeOptions = ref([])
    const statusOptions = ref([])
    localCustomLocationStore.getCustomLocationsTypes.then(types => {
      typeOptions.value = types.map(t => {
        return {
          value: t.id,
          label: t.name
        }
      })
    })
    localCustomLocationStore.getCustomLocationsStatuses.then(statuses => {
      statusOptions.value = statuses.map(s => {
        return {
          value: s.id,
          label: s.description
        }
      })
    })

    return {
      dialog,
      name,
      description,
      getAddLocation,
      locationStore,
      excursionStore,
      localCustomLocationStore,
      selectedType: ref(null),
      typeOptions,
      selectedStatus: ref(null),
      statusOptions,
      selectedExcursion: ref(null),
      excursionOptions
    }
  },
  computed: {
  },
  methods: {
    async onSubmit () {
      await this.localCustomLocationStore.add({
        id: -1,
        createdDate: getDBDateNow(),
        description: this.description,
        externalId: uuidv4(),
        isAuthor: true,
        lat: this.getAddLocation[1],
        lng: this.getAddLocation[0],
        name: this.name,
        organizations: [],
        typeId: this.selectedType.value,
        statusId: this.selectedStatus.value,
        excursionId: this.selectedExcursion?.value
      })
      this.localCustomLocationStore.uploadNew().then(() => {
        console.log('uploading customlocations finished')
      })
      this.reset()
    },
    reset () {
      this.dialog = false
      this.name = null
      this.description = null
      this.selectedExcursion = null
      this.selectedStatus = null
      this.selectedType = null
      this.filesImages = []
      this.images = []
    },
    filterFn (val, update, abort) {
      setTimeout(() => {
        update(
          async () => {
            this.excursionStore.addQueryParameter(val.toLowerCase())
            await this.excursionStore.searchForExcursions()
            this.excursionOptions = this.excursionStore.getExcursions.map(e => {
              return {
                label: e.name,
                value: e.id
              }
            })
          },
          ref => {
            if (val !== '' && ref.options.length > 0) {
              ref.setOptionIndex(-1)
              ref.moveOptionSelection(1, true)
            }
          }
        )
      }, 300)
    },
    abortFilterFn () {
      console.log('delayed filter aborted')
    },
    inputValidator (val) {
      return (val && val.length > 0) || this.$t('required')
    },
    dropDownValidator (val) {
      return val || this.$t('required')
    }
  },
  watch: {
    getAddLocation (newValue, oldValue) {
      this.dialog = newValue?.length > 0
    }
  }
}
</script>
