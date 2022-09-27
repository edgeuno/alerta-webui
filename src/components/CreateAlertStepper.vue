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
        :disabled="isSendingInfo"
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
  data: () => ({
    isSendingInfo: false,
    currentStep: 1,
    form: {
      stepOne: {
        correlate: [],
        origin: 'curl',
        text: 'Testing alert creation from Alerta UI',
        event: 'Testing alert creation from Alerta UI',
        severity: 'major', 
        resource: 'edge1.lim1.edgeuno.net',
        environment: 'Datacenter',
      },
      stepTwo: {
        type: '',
        group: '',
        status: 'open',
      },
      stepThree: {
        tags: [],
        timeout: 0,
        attributes: ''
      }
    },
  }),
  mounted() {
    this.$on('create-alert', this.toggleLoading)
  },
  beforeDestroy() {
    this.$off('create-alert', this.toggleLoading)
  },
  methods: {
    toggleLoading() {
      this.isSendingInfo = !this.isSendingInfo
    },
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
    }
  }
}
</script>