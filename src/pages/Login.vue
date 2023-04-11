<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          eKatasterJam
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page class="bg-light-blue row justify-center items-center">
        <div class="column">
          <div class="row">
            <h5 class="text-h5 text-white q-my-md">{{$t('logIn')}}</h5>
          </div>
          <div class="row">
            <q-card bordered class="q-pa-lg shadow-1">
              <q-card-section>
                <q-form class="q-gutter-md">
                  <q-input square filled clearable v-model="account.email" type="email" :label="$t('email')" />
                  <q-input square filled clearable v-model="account.password" type="password" :label="$t('password')" />
                </q-form>
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn :disable="loggingIn" :loading="loggingIn" unelevated color="light-blue-7" size="lg" class="full-width" :label="$t('loginLabel')" @click="submitForm" type="submit">
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-right" />
                    {{ $t('loggingIn') }}
                  </template>
                </q-btn>
              </q-card-actions>
              <q-card-section class="text-center q-pa-none">
                <p class="text-grey-6">{{ $t('register') }}</p>
              </q-card-section>
              <q-card-section class="text-center q-pa-none" v-if="loggingIn">
                <p class="text-grey-6">{{ $t('fetchingData') }}</p>
                <q-linear-progress size="50px" :value="progress" color="accent" class="q-mt-sm">

                  <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="accent" :label="progressLabel" />
                  </div>
                </q-linear-progress>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAuthStore } from 'stores/auth-store'
import { useCavesStore } from 'stores/local-cave-store'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
export default {
  name: 'LoginPage',
  setup () {
    const store = useAuthStore()
    const cavesStore = useCavesStore()
    const progress = ref(0.0)
    const { getPageNumber } = storeToRefs(cavesStore)

    const { notify } = useQuasar()
    return {
      notify,
      loggingIn: ref(false),
      store,
      cavesStore,
      progress,
      progressLabel: computed(() => (progress.value * 100).toFixed(2) + '%'),
      getPageNumber
    }
  },
  data () {
    return {
      account: {
        email: '',
        password: ''
      }
    }
  },
  watch: {
    getPageNumber (newValue, oldValue) {
      this.progress = newValue / this.cavesStore.totalPages
    }
  },
  methods: {
    async submitForm () {
      this.loggingIn = true
      try {
        const payload = {
          email: this.account.email,
          password: this.account.password,
          rememberMe: true
        }
        const result = await this.store.login(payload)

        if (result.success) {
          await this.cavesStore.tryFetchCavesForOffline()
          this.$router.replace('/')
        } else {
          console.error(result.message[0])
        }
      } catch (err) {
        console.error(err)
        this.notify({
          message: this.$t('loginFailed'),
          color: 'red'
        })
      } finally {
        this.loggingIn = false
      }
    }
  }
}
</script>
<style>
  .q-card {
    width: 360px;
  }
</style>
