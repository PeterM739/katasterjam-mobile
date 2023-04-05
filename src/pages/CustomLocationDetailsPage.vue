<template>
  <q-card class="cave-top">
    <SimpleHeaderMap :center="center" :markLocations="markLocations"/>
    <q-card-section>
      <div class="text-overline text-orange-9">{{$t('customLocationDetails')}}</div>
      <div class="row no-wrap items-center">
        <div class="col text-h6 ellipsis">
          {{ customLocation.name }}<q-icon v-if="customLocation.isAuthor" name="check" />
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
        <q-fab-action label-position="left" color="green" icon="map" :label="$t('mainMap')" @click="showOnMap" />
        <q-fab-action label-position="left" color="orange" icon="assist_walker" :label="$t('navigate')" @click="goTo" />
      </q-fab>
    </q-card-section>

      <q-card-section horizontal>
        <q-card-section>
          <div class="text-grey text-caption q-pt-md items-center">
          {{$t('date')}}: {{ formatDate(customLocation.createdDate) }}
        </div>
        </q-card-section>
    </q-card-section>
    <q-separator />
    <q-markup-table>
      <tbody>
        <tr>
          <td class="text-left table-row-fit">{{$t('organizations')}}</td>
          <td class="text-left table-row-fit">
            <OrganizationsList :organizations="customLocation.organizations"/>
          </td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('latLng')}}</td>
          <td class="text-left table-row-fit">{{ customLocation.lat }}, {{ customLocation.lng }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('GKCoordinates')}}</td>
          <td class="text-left table-row-fit">{{ customLocation.xgk }}, {{ customLocation.ygk }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('customLocationType')}}</td>
          <td class="text-left table-row-fit">{{ $t(`customLocationTypes.${customLocation.type}`) }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('customLocationStatus')}}</td>
          <td class="text-left table-row-fit">{{ $t(`customLocationStatuses.${customLocation.status}`) }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('elevation')}}</td>
          <td class="text-left table-row-fit">{{ parseInt(customLocation.elevation) }} {{ $t('elevationAbrv') }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('geology')}}</td>
          <td class="text-left table-row-fit">{{ customLocation.geology }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('settlement')}}</td>
          <td class="text-left table-row-fit">{{ customLocation.settlement }}</td>
        </tr>
        <tr>
          <td class="text-left table-row-fit">{{$t('municipalty')}}</td>
          <td class="text-left table-row-fit">{{ customLocation.municipalty }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-separator />
    <q-card-section>
      <div class="q-ml-sm" v-html="customLocation.description"></div>
    </q-card-section>
  </q-card>
</template>
<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { formatDate } from 'src/helpers/date'
import { fromLonLat } from 'ol/proj'
import Point from 'ol/geom/Point'
import SimpleHeaderMap from 'src/components/map/SimpleHeaderMap.vue'
import OrganizationsList from 'src/components/organizations/OrganizationsList.vue'
import { Feature } from 'ol'
export default {
  name: 'customLocationDetailsPage',
  components: { OrganizationsList, SimpleHeaderMap },
  setup () {
    const { dialog } = useQuasar()
    const center = ref([1637531, 5766419])
    const markLocations = ref([])
    const customLocation = ref(null)

    return {
      center,
      markLocations,
      confirmDialog: dialog,
      formatDate,
      customLocation
    }
  },
  methods: {
    goTo () {
      this.confirm = true
      const name = `${this.customLocation?.name}`
      this.confirmDialog({
        title: `${this.$t('confirm')}`,
        message: `${this.$t('navigateToCustomLocation')}: ${name}`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$router.push({
          path: '/',
          query: {
            lat: this.customLocation.lat,
            lng: this.customLocation.lng,
            navigate: true,
            customLocation: true,
            name
          }
        })
      })
    },
    showOnMap () {
      this.$router.push({
        path: '/',
        query: {
          lat: this.customLocation.lat,
          lng: this.customLocation.lng,
          customLocation: true
        }
      })
    }
  },
  created () {
    this.customLocation = this.$route.meta.customLocation
    const coords = fromLonLat([this.customLocation.lng, this.customLocation.lat])
    this.center = coords
    const mark = new Feature(new Point(coords))
    this.markLocations = [mark]
  }
}
</script>
