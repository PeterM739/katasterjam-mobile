<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Kataster jam
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page class="bg-light-blue row justify-center items-center">
        <div class="column">
          <div class="row">
            <h5 class="text-h5 text-white q-my-md">Log in</h5>
          </div>
          <div class="row">
            <q-card bordered class="q-pa-lg shadow-1">
              <q-card-section>
                <q-form class="q-gutter-md">
                  <q-input square filled clearable v-model="account.email" type="email" label="email" />
                  <q-input square filled clearable v-model="account.password" type="password" label="password" />
                </q-form>
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn unelevated color="light-blue-7" size="lg" class="full-width" label="Login" @click="submitForm" type="submit"/>
              </q-card-actions>
              <q-card-section class="text-center q-pa-none">
                <p class="text-grey-6">Not registered? Create new Account</p>
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
export default {
  name: 'LoginPage',
  setup () {
    const store = useAuthStore()

    return {
      store
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
  methods: {
    async submitForm () {
      try {
        const payload = {
          email: this.account.email,
          password: this.account.password,
          rememberMe: true
        }
        const result = await this.store.login(payload)

        if (result.success) {
          this.$router.replace('/')
        } else {
          console.error(result.message[0])
        }
      } catch (err) {
        console.error(err)
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
