<template>
  <v-container
    fluid
    grid-list-md
    pa-5
  >
    <v-form
      v-model="isValid"
      lazy-validation
    >
      <v-layout
        row
        wrap
      >
        <v-flex xs6>
          <v-select
            :value="data.group"
            :items="groupsAvailable"
            item-value="value"
            item-text="label"
            label="Groups"
            name="groups"
            autofocus
            box
            @input="handleChange('groups', $event)"
          />
        </v-flex>
        <v-flex xs6>
          <v-text-field
            v-model="data.type"
            label="Type"
            name="type"
            box
          />
        </v-flex>
        <v-flex xs6>
          <v-select
            :value="data.status"
            :items="statusAvailable"
            item-value="value"
            item-text="label"
            label="Status"
            name="status"
            autofocus
            box
            @input="handleChange('status', $event)"
          />
        </v-flex>
      </v-layout>
    </v-form>

    <footer-actions
      @next="nextStep"
      @previous="previousStep"
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
      required: true
    }
  },
  data: () => ({
    isValid: false,
  }),
  computed: {
    statusAvailable() {
      return [
        {
          label: 'Open',
          value: 'open'
        },
        {
          label: 'Assign',
          value: 'assign'
        },
        {
          label: 'Ack',
          value: 'ack'
        },
        {
          label: 'Shelved',
          value: 'shelved'
        },
        {
          label: 'Blackout',
          value: 'blackout'
        },
        {
          label: 'Closed',
          value: 'closed'
        },
        {
          label: 'Expired',
          value: 'expired'
        },
        {
          label: 'Unknown',
          value: 'unknown'
        },
        {
          label: 'Not Valid',
          value: 'notValid'
        },
      ]
    },
    groupsAvailable() {
      return this.$store.getters['alerts/groups']
    },
  },
  methods: {
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