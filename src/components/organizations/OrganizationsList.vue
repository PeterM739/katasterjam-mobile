<template>
  <span :key="organization.id" v-for="(organization, index) in organizations">
    {{ organization.name }}<span v-if="index+1 < organizations.length">, </span>
  </span>
</template>
<script>
export default {
  props: ['organizations']
}
</script>
