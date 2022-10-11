<template>
  <v-dialog
    v-model="visibility"
    width="520"
    persistent
    lazy
  >
    <v-card>
      <v-card-title
        class="headline grey"
        primary-title
      >
        {{ $t('Assign') }}
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit="validate"
          >
            <v-select
              v-model="assignedTo"
              :items="usersAvailable"
              item-disabled="disabled"
              item-value="name"
              item-text="name"
              :label="$t('User')"
            />
            <v-flex xs12>
              <v-btn
                :disabled="!valid"
                color="success"
                type="submit"
                @click.stop.prevent="validate"
              >
                {{ $t('Send') }}
              </v-btn>
              <v-btn
                color="green darken-1"
                flat="flat"
                @click="visibility = false"
              >
                {{ $t('Cancel') }}
              </v-btn>
            </v-flex>
          </v-form>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    value: {
      type: String,
      default: () => '',
    }
  },
  data: () => ({
    assignedTo: '',
    valid: false,
  }),
  computed: {
    visibility: {
      get() {
        return this.isVisible
      },
      set() {
        return this.close()
      }
    },
    currentAlert() {
      return this.$store.state.alerts.alert
    },
    currentAlertId() {
      return this.$store.state.alerts.alert.id
    },
    selected() {
      return this.$store.state.alerts.selected
    },
    usersAvailable() {
      return this.$store.state.users.users
    },
  },
  watch: {
    visibility() {
      if (!this.usersAvailable.length) this.getUsers()
      if (this.currentAlertId) {
        this.assignedTo = this.currentAlert.attributes.assign_to
      }
    }
  },
  methods: {
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    validate() {
      if (this.$refs.form.validate()) this.closeAndSave()
    },
    closeAndSave() {
      const alerts = this.currentAlertId ? [{ id: this.currentAlertId }] : this.selected
      this.$emit('assign-to', { assignedTo: this.assignedTo, alerts })
      this.close()
    },
    close() {
      this.assignedTo = ''
      this.$emit('close', null)
    }
  }
}
</script>