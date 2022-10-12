<template>
  <v-layout
    row
    wrap
  >
    <v-flex xs10>
      <v-btn
        :disabled="isFirstStep || disabled"
        flat
        @click="previous"
      >
        {{ $t('Previous') }}
      </v-btn>
      <v-btn
        v-if="isLastStep"
        :disabled="isSaveDisabled || disabled"
        color="primary"
        @click="save"
      >
        {{
          $t('Save')
        }}
      </v-btn>
      <v-btn
        v-else
        :disabled="disabled"
        color="primary"
        @click="next"
      >
        {{
          $t('Continue')
        }}
      </v-btn>
    </v-flex>
    <v-flex class="px-0" d-flex xs2>
      <v-btn
        flat
        :disabled="disabled"
        @click="cancel"
      >
        {{ $t('Cancel') }}
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    isLastStep: {
      type: Boolean,
      default: () => false
    },
    isFirstStep: {
      type: Boolean,
      default: () => false
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    isSaveDisabled: {
      type: Boolean,
      default: () => false
    }
  },
  methods: {
    next() {
      this.$emit('next')
    },
    save() {
      this.$emit('save')
    },
    cancel() {
      this.$emit('cancel')
    },
    previous() {
      this.$emit('previous')
    }
  }
}
</script>