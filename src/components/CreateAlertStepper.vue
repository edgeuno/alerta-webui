<template>
  <v-stepper
    v-model="currentStep"
    vertical
  >
    <v-stepper-step
      :complete="currentStep > 1"
      step="1"
    >
      Create alert
      <small>Relevant information</small>
    </v-stepper-step>

    <v-stepper-content step="1">
      <step-one
        ref="stepOne"
        :data="form.stepOne"
        @next="handleNextStep"
        @previous="handlePreviousStep"
        @change="handleStepChange('stepOne', $event)"
      />
    </v-stepper-content>

    <v-stepper-step
      :complete="currentStep > 2"
      step="2"
    >
      Create alert
      <small>Optional information</small>
    </v-stepper-step>

    <v-stepper-content step="2">
      <step-two
        :data="form.stepTwo"
        @next="handleNextStep"
        @previous="handlePreviousStep"
        @change="handleStepChange('stepTwo', $event)"
      />
    </v-stepper-content>

    <v-stepper-step
      :complete="currentStep > 3"
      step="3"
    >
      Create alert
      <small>Optional information</small>
    </v-stepper-step>

    <v-stepper-content step="3">
      <step-three
        :disabled="loading"
        :data="form.stepThree"
        @save="validateForms"
        @previous="handlePreviousStep"
        @change="handleStepChange('stepThree', $event)"
      />
    </v-stepper-content>
  </v-stepper>
</template>

<script>
export default {
  components: {
    StepOne: () => import('@/components/CreateAlertSteps/StepOne'),
    StepTwo: () => import('@/components/CreateAlertSteps/StepTwo'),
    StepThree: () => import('@/components/CreateAlertSteps/StepThree'),
  },
  props: {
    loading: {
      type: Boolean,
      default: () => false
    }
  },
  data: () => ({
    currentStep: 1,
    form: {
      stepOne: {
        correlate: [],
        origin: 'curl',
        customer: '',
        text: '',
        event: '',
        severity: 'major', 
        resource: '',
        environment: '',
      },
      stepTwo: {
        type: '',
        group: '',
        status: 'open',
      },
      stepThree: {
        tags: [],
        timeout: 86400,
        attributes: []
      }
    },
  }),
  methods: {
    validateForms() {
      const isValid = this.$refs.stepOne.validate()
      this.$emit('create-alert', this.form)
    },
    handleStepIsValid(name) {
      this.steps[name].valid = true
    },
    handleStepChange(name, { target, value }) {
      this.form[name][target] = value
    },
    handleNextStep() {
      this.currentStep += 1
    },
    handlePreviousStep() {
      this.currentStep -= 1
    },
    reset() {
      this.form = {
        stepOne: {
          correlate: [],
          origin: 'curl',
          customer: '',
          text: '',
          event: '',
          severity: '', 
          resource: '',
          environment: '',
        },
        stepTwo: {
          type: '',
          group: '',
          status: 'open',
        },
        stepThree: {
          tags: [],
          timeout: 86400,
          attributes: ''
        }
      }
      this.$refs.stepOne.$refs.form.resetValidation()
      this.currentStep = 1
    }
  }
}
</script>