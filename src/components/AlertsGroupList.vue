<template>
  <v-expansion-panel>
    <v-expansion-panel-content
      v-for="(item,i) in 5"
      :key="i"
    >
      <template v-slot:header>
        <div slot="header" />
      </template>
      <slot />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    collapseId: {
      type: String,
      required: true
    }
  }
}
</script>