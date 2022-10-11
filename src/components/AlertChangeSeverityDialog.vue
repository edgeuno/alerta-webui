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
        {{ $t('ChangeSeverity') }}
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
              v-model="severity"
              :items="severitiesAvailable"
              :label="$t('Severity')"
              hint="Remember that changing the severity of an alert to ok/cleared doesn't mean that is acked."
              persistent-hint
            />
            <v-flex xs12 class="mt-2">
              <v-btn
                :disabled="!valid"
                color="success"
                type="submit"
                class="ml-0"
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
import i18n from '@/plugins/i18n'
import debounce from 'lodash/debounce'

export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    severity: '',
    valid: false, 
  }),
  computed: {
    severitiesAvailable() {
      return Object.keys(this.$config.alarm_model.severity)
    },
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
  },
  watch: {
    visibility() {
      if (!'attributes' in this.currentAlert) return
      const severity = this.currentAlert.attributes.severity_raw ? this.currentAlert.attributes.severity_raw : this.currentAlert.severity 
      this.checkValue(severity)
    }
  },
  methods: {
    checkValue(value) {
      if (value && this.severitiesAvailable.includes(value.toLowerCase())) {
        this.severity = value
      }
    },
    validate() {
      if (this.$refs.form.validate()) this.closeAndSave()
    },
    closeAndSave() {
      const alerts = this.currentAlertId ? [{ id: this.currentAlertId }] : this.selected
      this.$emit('change-severity', { severity: this.severity, alerts })
      this.close()
    },
    close() {
      this.severity = ''
      this.$emit('close', null)
    }
  }
}
</script>