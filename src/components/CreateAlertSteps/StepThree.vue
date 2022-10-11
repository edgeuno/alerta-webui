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
            :value="data.tags"
            :items="tagsAvailable"
            item-value="value"
            clearable
            full-width
            multiple
            item-text="label"
            label="Tags"
            name="tags"
            autofocus
            box
            @input="handleChange('tags', $event)"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0">
                <span>{{ item }}</span>
              </v-chip>
              <span
                v-if="index === 1"
                class="grey--text caption"
              >(+{{ data.tags.length - 1 }} others)</span>
            </template>
          </v-select>
        </v-flex>
        <v-flex xs6>
          <v-text-field
            :value="data.timeout"
            type="number"
            suffix="seconds"
            label="timeout"
            name="timeout"
            hide-details
            single-line
            box
            @input="handleChange('timeout', validateTimeout($event))"
          />
        </v-flex>
        <v-flex xs12>
          <v-combobox
            id="attributes-input"
            :value="attribute"
            name="attributes"
            label="Attributes"
            :items="[]"
            persistent-hint
            deletable-chips
            multiple
            hide-no-data
            clearable
            hint="Attributes are created with the following structure => Name: value - If you failed to input the correct format this can result in incorrect data being set as an attribute of this alert."
            small-chips
            chips
            box
            @input="handleChange('attributes', $event)"
          >
            <template v-slot:item="{ index, item }">
              <v-list-tile-content>
                <v-chip
                  dark
                  label
                  small
                >
                  {{ item }}
                </v-chip>
              </v-list-tile-content>
            </template>
          </v-combobox>
        </v-flex>
      </v-layout>
    </v-form>

    <footer-actions
      :disabled="disabled"
      is-last-step
      @save="save"
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
    disabled: {
      type: Boolean,
      default: () => false,
    },
    data: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    isValid: false,
    attribute: '',
  }),
  computed: {
    tagsAvailable() {
      return this.$store.getters['alerts/tags']
    }
  },
  methods: {
    save() {
      this.$emit('save')
    },
    previousStep() {
      this.$emit('previous')
    },
    validateTimeout(value) {
      let rgx = /^[a-zA-Z]+$/
      let newVal = parseFloat(value.toString().replace(rgx, ''))
      return isNaN(newVal) ? 0 : newVal
    },
    handleChange(target, value) {
      this.$emit('change', { target, value })
    }
  }
}
</script>