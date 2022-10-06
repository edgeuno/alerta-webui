<template>
  <div>
    <v-container
      v-if="!showForm"
      class="pa-1 py-2"
      fluid
    >
      <v-layout>
        <v-flex
          d-flex
          row
          no-wrap
          justify-space-between
        >
          <div>
            <v-btn
              v-show="!isWatched"
              outline
              :color="`${isDark ? 'blue-grey' : 'grey darken-2'}`"
              @click="watchAlert"
            >
              <v-icon>visibility</v-icon>&nbsp;{{ $t('Watch') }}
            </v-btn>
  
            <v-btn
              v-show="isWatched"
              outline
              :color="`${isDark ? 'blue-grey' : 'grey darken-2'}`"
              @click="unwatchAlert"
            >
              <v-icon>visibility_off</v-icon>&nbsp;{{ $t('Unwatch') }}
            </v-btn>
  
            <v-btn
              outline
              :color="`${isDark ? 'blue-grey' : 'grey darken-2'}`"
              @click="$emit('add-note')"
            >
              <v-icon>note_add</v-icon>&nbsp;{{ $t('AddNote') }}
            </v-btn>
  
            <v-btn
              v-if="!alertHasTicket"
              outline
              :color="`${isDark ? 'blue-grey' : 'grey darken-2'}`"
              @click="createTicket"
            >
              <v-icon>confirmation_number</v-icon>&nbsp;{{ $t('CreateTicket') }}
            </v-btn>
            <a
              v-else
              :href="ticketUrl"
              target="_blank"
              style="color: inherit; text-decoration: none;"
              class="d-inline-block"
            >
              <v-btn
                outline
                :color="`${isDark ? 'blue-grey' : 'grey darken-2'}`"
              >
                <v-icon>confirmation_number</v-icon>&nbsp; {{ $t('ViewTicket') }}
              </v-btn>
            </a>
          </div>
          <div class="d-flex justify-end">
            <v-btn
              outline
              style="max-width: 10rem"
              :color="`${isDark ? 'red lighten-1' : 'red darken-2'}`"
              @click="deleteAlert"
            >
              <v-icon>delete_forever</v-icon>&nbsp;{{ $t('Delete') }}
            </v-btn>
          </div>
        </v-flex>
      </v-layout>
    </v-container>


    <!-- <v-container
      v-if="showForm"
      class="pa-1"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit="addNote"
          >
            <v-card>
              <v-card-text>
                <v-text-field
                  v-model.trim="text"
                  :counter="maxNoteLength"
                  :maxlength="maxNoteLength"
                  :minlength="minNoteLength"
                  :rules="textRules"
                  :label="$t('AddNote')"
                  prepend-icon="edit"
                  required
                />
              </v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="!isAcked && !isClosed"
                  color="green"
                  class="white--text"
                  @click="takeAction('open')"
                >
                  <v-icon>refresh</v-icon>&nbsp;{{ $t('Open') }}
                </v-btn>

                <v-btn
                  v-show="!isAcked"
                  :disabled="!isOpen"
                  color="blue darken-2"
                  class="white--text"
                  @click="ackAlert()"
                >
                  <v-icon>check_circle_outline</v-icon>&nbsp;{{ $t('Ack') }}
                </v-btn>

                <v-btn
                  v-show="isAcked"
                  color="blue darken-2"
                  class="white--text"
                  @click="takeAction('unack')"
                >
                  <v-icon>check_circle_outline</v-icon>&nbsp;{{ $t('Unack') }}
                </v-btn>

                <v-btn
                  v-show="!isShelved"
                  :disabled="!isOpen && !isAcked"
                  color="blue"
                  class="white--text"
                  @click="shelveAlert()"
                >
                  <v-icon>schedule</v-icon>&nbsp;{{ $t('Shelve') }}
                </v-btn>

                <v-btn
                  v-show="isShelved"
                  color="blue"
                  class="white--text"
                  @click="takeAction('unshelve')"
                >
                  <v-icon>schedule</v-icon>&nbsp;{{ $t('Unshelve') }}
                </v-btn>

                <v-btn
                  :disabled="isClosed"
                  color="orange"
                  class="white--text"
                  @click="takeAction('close')"
                >
                  <v-icon>highlight_off</v-icon>&nbsp;{{ $t('Close') }}
                </v-btn>

                <v-btn
                  color="white"
                  :class="{'black--text': isDark}"
                  @click="addNote"
                >
                  <v-icon>note_add</v-icon>&nbsp;{{ $t('AddNote') }}
                </v-btn>

                <v-spacer />

                <v-btn
                  icon
                  @click="close"
                >
                  <v-icon
                    color="grey darken-1"
                  >
                    delete
                  </v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container> -->
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import i18n from '@/plugins/i18n'

export default {
  props: {
    id: {
      type: String,
      required: true
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
  data: vm => ({
    showForm: false,
    valid: true,
    text: '',
    maxNoteLength: 200,
    minNoteLength: 0,
    textRules: [
      v => !!v || i18n.t('TextIsRequired'),
      v => (v && v.length <= vm.maxNoteLength) || `${i18n.t('TextMustBeLessThan')} ${vm.maxNoteLength} ${i18n.t('characters')}`
    ]
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
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
    },
    alertHasTicket() {
      const keys = Object.keys(this.$store.state.alerts.alert.attributes)
      return keys.includes('ticket_id')
    },
    ticketUrl() {
      return this.$store.state.alerts.alert.attributes.ticket_url_raw
    }
  },
  methods: {
    takeAction: debounce(function(action) {
      this.$emit('take-action', this.id, action, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    createTicket: debounce(function(action) {
      this.$emit('create-ticket', this.id)
      this.close()
    }, 200, {leading: true, trailing: false}),
    ackAlert: debounce(function() {
      this.$emit('ack-alert', this.id, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function() {
      this.$emit('shelve-alert', this.id, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function() {
      this.$emit('watch-alert', this.id)
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function() {
      this.$emit('unwatch-alert', this.id)
    }, 200, {leading: true, trailing: false}),
    addNote: debounce(function(action) {
      this.$emit('add-note', this.id, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function() {
      this.$emit('delete-alert', this.id)
    }, 200, {leading: true, trailing: false}),
    close() {
      this.text = null
      this.showForm = false
    }
  }
}
</script>

<style></style>
