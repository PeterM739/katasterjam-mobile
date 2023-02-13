<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { useAuthStore } from 'stores/auth-store'

export default defineComponent({
  name: 'App',
  setup () {
    const store = useAuthStore()

    return {
      store
    }
  },
  beforeCreate () {
    this.store.init()
  }
})
</script>
