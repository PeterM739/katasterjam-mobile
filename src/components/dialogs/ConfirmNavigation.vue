<template>
  <q-dialog v-model="openDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="assist_walker" color="primary" text-color="white" />
        <span class="q-ml-sm">Do you want to start navigation to the {{ selectedType }}: <b>{{ selectedName }}</b>?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Go!" color="primary" v-close-popup @click="navigateTo"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue'
export default {
  props: ['selectedType', 'selectedName', 'lat', 'lng'],
  setup () {
    const openDialog = ref(false)
    return {
      openDialog
    }
  },
  computed: {
    isOpened () {
      return this.open
    }
  },
  methods: {
    show () {
      this.openDialog = true
    },
    navigateTo () {
      this.$router.push({
        path: '/',
        query: {
          lat: this.lat,
          lng: this.lng,
          navigate: true,
          name: this.selectedName
        }
      })
    }
  }
}
</script>
