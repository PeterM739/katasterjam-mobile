<template>
  <q-page :style-fn="tweak" class="scroll-y fhpadd">
    <slot/>
  </q-page>
</template>

<script>
export default {
  name: 'PageFullScreen',
  methods: {
    tweak () {
      return {
        height: (this.$q.screen.height - 50) + 'px'
      }
    },
    myTweak (offset) {
      if (!offset) offset = 0
      const minHeight = (this.$q.platform.is.cordova)
        ? `calc(100vh - ${offset}px)`
        : window.innerHeight - offset + 'px'
      this.$store.state.windowSize = minHeight
      return { minHeight }
    }
  }
}
</script>

<style scoped>

</style>
