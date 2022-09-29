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
        {{ $t('AddNote') }}
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
              v-model="action"
              :items="actionsAvailable"
              item-disabled="disabled"
              item-value="value"
              item-text="label"
              label="Action"
              chips
            />
            <v-textarea
              v-model.trim="note"
              :minlength="minNoteLength"
              :maxlength="maxNoteLength"
              :counter="maxNoteLength"
              :label="$t('AddNote')"
              prepend-icon="edit"
              name="input-7-1"
              autofocus
              box
            />
            <v-flex xs12>
              <v-btn
                :disabled="!valid"
                color="success"
                type="submit"
                @click="validate"
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
    },
    id: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: () => 'note'
    },
    status: {
      type: String,
      required: true
    },
    isWatched: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    note: '',
    action: 'note',
    valid: false, 
    maxNoteLength: 200,
    minNoteLength: 0,
  }),
  computed: {
    actionsAvailable() {
      return [
        {
          label: this.$t('Open'),
          value: 'open',
          disabled: false
        }, 
        {
          label: this.$t('Ack'),
          value: 'ack',
          disabled: false
        },
        {
          label: this.$t('Unack'),
          value: 'unack',
          disabled: true
        },
        {
          label: this.$t('Shelve'),
          value: 'shelve',
          disabled: false
        },
        {
          label: this.$t('Unshelve'),
          value: 'unshelve',
          disabled: false
        },
        {
          label: this.$t('Close'),
          value: 'close',
          disabled: false
        },
        {
          label: this.$t('AddNote'),
          value: 'note',
          disabled: false
        },
      ]
    },
    actionsAvailableValues() {
      return this.actionsAvailable.map(item => item.value)
    },
    visibility: {
      get() {
        return this.isVisible
      },
      set() {
        return this.close()
      }
    },
    isOpen(status) {
      return this.status == 'open' || this.status == 'NORM'
    },
    isAcked() {
      return this.status == 'ack' || this.status == 'ACKED'
    },
    isShelved() {
      return this.status == 'shelved' || this.status == 'SHLVD'
    },
    isClosed() {
      return this.status == 'closed'
    }
  },
  watch: {
    visibility() {
      this.checkValue(this.value)
    }
  },
  mounted() {
    this.checkValue(this.value)
  },
  methods: {
    checkValue(value) {
      if (value !== '' && this.actionsAvailableValues.includes(value)) {
        this.action = value
      }
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.closeAndSave()
      }
    },
    closeAndSave() {
      this.$emit('add-note', { note: this.note, action: this.action, id: this.id })
      this.close()
    },
    close() {
      this.note = ''
      this.action = 'note'
      this.$emit('close', null)
    }
  }
}
</script>