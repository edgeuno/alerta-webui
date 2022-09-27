<template>
  <v-container class="pa-4">
    <v-card
      :color="`${isDark ? 'grey darken-2' : 'grey lighten-3'}`"
      class="pt-0"
    >
      <v-card-title
        primary-title
        class="px-4"
      >
        <h3 class="headline mb-0">
          Create Alert
        </h3>
      </v-card-title>

      <create-alert-stepper @create-alert="handleCreateAlert" />
      <v-progress-linear
        v-if="isCreatingAlert"
        style="margin: 0;"
        :indeterminate="true"
      />
    </v-card>
  </v-container>
</template>

<script>
import CreateAlertStepper from '@/components/CreateAlertStepper'

export default {
  components: {
    CreateAlertStepper
  },
  data: () => ({
    isCreatingAlert: false,
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    }
  },
  mounted() {
    Promise.all([
      this.getGroups(),
      this.getTags()
    ])
  },
  methods: {
    getTags() {
      this.$store.dispatch('alerts/getTags')
    },
    getGroups() {
      this.$store.dispatch('alerts/getGroups')
    },
    handleCreateAlert({ stepOne, stepTwo, stepThree }) {
      this.isCreatingAlert = true
      try {
        this.$store.dispatch('alerts/addAlert', { ...stepOne, ...stepTwo, ...stepThree }).then(() => {
          this.$store.dispatch(
            'notifications/success',
            'Alert created successfully!',
            { root: true }
          )
        })
      } catch(err) {
        console.error(err, 'catched error 65 ')
      } 
      finally {
        this.isCreatingAlert = true
      }
    }
  }
}
</script>