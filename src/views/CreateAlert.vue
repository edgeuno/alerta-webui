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

      <create-alert-stepper
        ref="steps"
        :loading="isCreatingAlert"
        @create-alert="handleCreateAlert"
      />
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
      this.getCustomers(),
      this.getGroups(),
      this.getTags()
    ])
  },
  methods: {
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
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
          this.$refs.steps.reset()
        })
      } finally {
        this.isCreatingAlert = false
      }
    }
  }
}
</script>