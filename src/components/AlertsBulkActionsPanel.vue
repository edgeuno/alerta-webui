<template>
  <v-navigation-drawer
    :value="sidesheet"
    clipped
    disable-resize-watcher
    absolute
    hide-overlay
    width="300"
    right
  >
    <v-card flat>
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        card
        dense
      >
        <v-toolbar-title>
          {{ $t('BulkActions') }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items />
        <v-menu
          bottom
          right
          offset-y
        >
          <v-btn
            slot="activator"
            icon
            @click="close"
          >
            <v-icon
              size="20px"
              class="ml-1"
            >
              close
            </v-icon>
          </v-btn>
        </v-menu>
      </v-toolbar>

      <v-container
        fluid
        grid-list-xl
      >
        <v-layout
          align-center
          wrap
          class="px-3"
        >
          <v-flex
            class="py-0 pb-2"
            xs12
          >
            <span class="subheading">
              {{ selectedLength }}<span class="hidden-sm-and-down"> {{ $t('selected') }}</span>
            </span>
            <v-menu
              bottom
              left
            >
              <v-btn
                slot="activator"
                flat
                icon
                small
              >
                <v-icon small>
                  more_vert
                </v-icon>
              </v-btn>

              <v-list
                subheader
              >
                <v-subheader>Actions</v-subheader>
                <v-divider />
                <v-list-tile
                  v-for="(action, i) in actions"
                  :key="i"
                  @click="takeBulkAction(action)"
                >
                  <v-list-tile-title>{{ action | splitCaps }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-flex>

          <v-spacer />
          <v-flex
            xs6
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="bulkAckAlert"
            >
              <span>{{ $t('Ack') }}</span>
              <v-icon
                size="20px"
                class="ml-1"
              >
                check
              </v-icon>
            </v-btn>
          </v-flex>

          <v-flex
            v-if="someCanUnack"
            xs6
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="takeBulkAction('unack')"
            >
              <span>{{ $t('Unack') }}</span>
              <v-icon
                size="20px"
              >
                undo
              </v-icon>
            </v-btn>
          </v-flex>

          <v-flex
            v-if="someCanUnshelved"
            xs6
            px6
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="takeBulkAction('unshelve')"
            >
              <span>{{ $t('Unshelve') }}</span>
              <v-icon
                size="20px"
              >
                restore
              </v-icon>
            </v-btn>
          </v-flex>

          <v-flex
            v-if="!someCanUnshelved"
            xs6
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              depressed
              block
              @click="bulkShelveAlert"
            >
              <span>{{ $t('Shelve') }}</span>
              <v-icon
                size="20px"
                class="ml-1"
              >
                schedule
              </v-icon>
            </v-btn>
          </v-flex>
          <v-flex
            xs6
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="takeBulkAction('close')"
            >
              <span>{{ $t('Close') }}</span>
              <v-icon
                size="20px"
                class="ml-1"
              >
                highlight_off
              </v-icon>
            </v-btn>
          </v-flex>
          <v-flex
            xs6
            :xs12="someCanUnack"
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="bulkDeleteAlert"
            >
              <span>{{ $t('Delete') }}</span>
              <v-icon
                size="20px"
                class="ml-1"
              >
                delete
              </v-icon>
            </v-btn>
          </v-flex>
          <v-flex
            xs12
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="bulkAddNote"
            >
              <span>{{ $t('AddNote') }}</span>
              <v-icon
                size="20px"
                class="ml-1"
              >
                note
              </v-icon>
            </v-btn>
          </v-flex>

          <v-flex
            v-if="!someCanUnwatch"
            xs12
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="toggleWatch"
            >
              <span>{{ $t('Watch') }}</span>
              <v-icon
                size="20px"
                class="ml-1"
              >
                visibility
              </v-icon>
            </v-btn>
          </v-flex>

          <v-flex
            v-if="someCanUnwatch"
            px6
            class="py-0 px-1"
          >
            <v-btn
              slot="activator"
              block
              depressed
              @click="toggleWatch"
            >
              <span>{{ $t('Unwatch') }}</span>
              <v-icon
                size="20px"
              >
                visibility_off
              </v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import { bus } from '@/common/bus.ts'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: vm => ({
    sidesheet: vm.value,
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    selected() {
      return this.$store.state.alerts.selected
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    selectedLength() {
      return this.selected.length
    },
    actions() {
      return this.$config.actions
    },
    someCanUnack() {
      return this.selected.some(item => item.status == 'ack' || status == 'ACKED')
    },
    someCanUnwatch() {
      const tag = `watch:${this.username}`
      return this.selected.some(item => {
        return item.tags ? item.tags.indexOf(tag) > -1 : false
      })
    },
    someCanUnshelved() {
      return this.selected.some(item => item.status == 'shelved' || status == 'SHLVD')
    },
    someAreClosed(status) {
      return this.selected.some(item => item.status == 'closed')
    },
  },
  watch: {
    value(val) {
      this.sidesheet = val
    },
    selectedLength(bool) {
      if (!bool) this.close()
    },
  },
  methods: {
    takeBulkAction(actionStr) {
      bus.$emit('take-bulk-action', actionStr)
    },
    bulkAckAlert() {
      bus.$emit('bulk-ack-alert', null)
    },
    bulkShelveAlert() {
      bus.$emit('bulk-shelve-alert')
    },
    toggleWatch() {
      bus.$emit('toggle-watch')
    },
    bulkAddNote() {
      bus.$emit('bulk-add-note')
    },
    bulkDeleteAlert() {
      bus.$emit('bulk-delete-alert')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

