<template>
  <v-container
    fluid
    grid-list-md
    pa-5
  >
    <v-form
      ref="form"
      v-model="isValid"
      :rules="formRules"
      lazy-validation
    >
      <v-layout
        row
        wrap
      >
        <v-flex xs6>
          <v-select
            :value="data.severity"
            :items="severityAvailable"
            :rules="formRules.severity"
            item-value="value"
            item-text="label"
            label="Severity"
            name="severity"
            autofocus
            required
            box
            @input="handleChange('severity', $event)"
          />
        </v-flex>
        <v-flex xs6>
          <v-text-field
            :value="data.resource"
            :rules="formRules.resource"
            label="Resource"
            name="resource"
            required
            box
            @input="handleChange('resource', $event)"
          />
        </v-flex>
        <v-flex xs6>
          <v-text-field
            :value="data.event"
            :rules="formRules.event"
            label="Event"
            name="event"
            required
            box
            @input="handleChange('event', $event)"
          />
        </v-flex>
        <v-flex xs6>
          <v-select
            :value="data.customer"
            :items="customersAvailable"
            :rules="formRules.customer"
            label="Customer"
            name="customer"
            item-value="customer"
            item-text="customer"
            autofocus
            required
            box
            @input="handleChange('customer', $event)"
          />
        </v-flex>
        <v-flex
          xs12
        >
          <v-select
            :value="data.environment"
            :rules="formRules.environment"
            :items="environmentsAvailable"
            label="Environment"
            name="environment"
            required
            box
            @input="handleChange('environment', $event)"
          />
        </v-flex>
        <v-flex xs12>
          <v-textarea
            :value="data.text"
            :rules="formRules.text"
            label="Description"
            name="description"
            required
            box
            @input="handleChange('text', $event)"
          />
        </v-flex>
      </v-layout>
    </v-form>
    <footer-actions
      is-first-step
      @previous="previousStep"
      @next="validateBeforeNext"
    />
  </v-container>
</template>

<script>
import FooterActions from './FooterActions'

export default {
  components: {
    FooterActions,
  },
  props: {
    data: {
      type: Object,
      required: true,
    }
  },
  data: () => ({
    isValid: false,
  }),
  computed: {
    formRules() {
      return {
        severity: [
          v => !!v || 'Severity is required'
        ],
        environment: [
          v => !!v || 'An environment is required'
        ],
        text: [
          v => !!v || 'A description is required'
        ],
        resource: [
          v => !!v || 'Resource is required'
        ],
        event: [
          v => !!v || 'Event is required'
        ],
        customer: [
          v => !!v || 'Customer is required'
        ]
      }
    },
    customersAvailable() {
      return this.$store.state.customers.customers
    },
    severityAvailable() {
      return [
        {
          label: 'Security',
          value: 'security'
        },
        {
          label: 'Critical',
          value: 'critical'
        },
        {
          label: 'Major',
          value: 'major'
        },
        {
          label: 'Minor',
          value: 'minor'
        },
        {
          label: 'Warning',
          value: 'warning'
        },
        {
          label: 'Indeterminate',
          value: 'indeterminate'
        },
        {
          label: 'Informational',
          value: 'informational'
        },
        {
          label: 'Normal',
          value: 'normal'
        },
        {
          label: 'Ok',
          value: 'ok'
        },
        {
          label: 'Cleared',
          value: 'cleared'
        },
        {
          label: 'Debug',
          value: 'debug'
        },
        {
          label: 'Trace',
          value: 'trace'
        },
        {
          label: 'Unkown',
          value: 'unkown'
        }
      ]
    },
    environmentsAvailable() {
      return this.$store.getters['alerts/environments'](this.showAllowedEnvs)
    }
  },
  methods: {
    validate() {
      return this.$refs.form.validate()
    },
    validateBeforeNext() {
      if (this.validate()) this.nextStep()
    },
    nextStep() {
      this.$emit('next')
    },
    previousStep() {
      this.$emit('previous')
    },
    handleChange(target, value) {
      this.$emit('change', { target, value })
    }
  }
}
</script>