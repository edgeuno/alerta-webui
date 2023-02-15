<template>
  <v-app
    id="alerta"
    :dark="isDark"
  >
    <div v-if="!isKiosk">
      <v-navigation-drawer
        v-if="isLoggedIn || !isAuthRequired || isAllowReadonly"
        v-model="drawer"
        :clipped="$vuetify.breakpoint.lgAndUp"
        disable-resize-watcher
        fixed
        app
      >
        <v-toolbar
          :color="isDark ? '#616161' : '#eeeeee'"
          flat
        >
          <v-toolbar-side-icon @click.stop="drawer = !drawer" />

          <router-link
            to="/"
            class="toolbar-title"
          >
            <img
              v-if="$config.site_logo_url"
              :src="$config.site_logo_url"
              height="48"
            >
            <v-toolbar-title
              v-else
              class="logo"
            >
              alerta
            </v-toolbar-title>
          </router-link>
        </v-toolbar>

        <v-divider />
        <v-list dense>
          <template v-for="(item, index) in items">
            <v-list-tile
              v-if="item.icon && item.show"
              :key="item.text"
              v-has-perms="item.perms"
              :to="item.path"
            >
              <v-list-tile-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                  <v-icon
                    v-if="item.appendIcon"
                    small
                  >
                    {{ item.appendIcon }}
                  </v-icon>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-group
              v-else-if="item.queries && item.queries.length > 0"
              :key="item.text"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              sub-group
              no-action
            >
              <template v-slot:activator>
                <v-list-tile>
                  <v-list-tile-title>
                    {{ item.text }}
                  </v-list-tile-title>
                </v-list-tile>
              </template>
              <v-list-tile
                v-for="(q, i) in item.queries"
                :key="i"
                @click="submitSearch(q.query)"
              >
                <v-list-tile-title v-text="q.text" />
                <v-list-tile-action>
                  <v-icon
                    small
                    @click.stop="deleteSearch(q)"
                    v-text="q.icon"
                  />
                </v-list-tile-action>
              </v-list-tile>
            </v-list-group>

            <v-divider
              v-else-if="item.divider"
              :key="index"
            />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        flat
        class="mb-1"
      >
        <v-toolbar-side-icon
          @click.stop="drawer = !drawer"
        />

        <router-link
          to="/"
          class="toolbar-title"
        >
          <img
            v-if="$config.site_logo_url"
            :src="$config.site_logo_url"
            height="48"
          >
          <v-toolbar-title
            v-else
            class="logo"
          >
            alerta
          </v-toolbar-title>
        </router-link>

        <v-spacer />

        <v-layout fluid>
          <v-text-field
            v-if="$route.name === 'alerts'"
            v-model="query"
            :flat="!hasFocus"
            :label="$t('Search')"
            prepend-inner-icon="search"
            solo
            clearable
            :disabled="Boolean(selected.length)"
            height="44"
            class="pt-2 mr-3 hidden-sm-and-down"
            @focus="hasFocus = true"
            @blur="hasFocus = false"
            @change="submitSearch"
            @click:clear="clearSearch"
          />
          <v-select
            v-model="columnSelected"
            :items="columnsAvailable"
            label=""
            solo
            flat
            item-text="label"
            item-value="value"
            style="width: 20px; margin-top: .56rem;"
            placeholder="Select column"
            @change="queryByColumn"
          />
          <div class="flex-center" style="padding: .4rem;">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  small
                  icon
                >
                  <v-icon
                    :disabled="Boolean(selected.length)"
                    v-on="on"
                    @click="saveSearch"
                  >
                    push_pin
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t('Save') }}</span>
            </v-tooltip>
          </div>
        </v-layout>

        <div
          v-if="$route.name === 'alerts'"
          v-show="isLoggedIn"
        >
          <v-tooltip bottom>
            <v-switch
              slot="activator"
              :input-value="isWatch"
              hide-details
              :disabled="Boolean(selected.length)"
              open-delay="3000"
              @change="toggle('isWatch', $event)"
            />
            <span>{{ $t('Watch') }}</span>
          </v-tooltip>
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <v-btn
            slot="activator"
            icon
          >
            <v-avatar
              size="32px"
            >
              <img
                v-if="avatar && !error"
                :src="avatar"
                @error="error = true"
              >
              <v-icon
                v-else
                v-text="navbar.signin.icon"
              />
            </v-avatar>
          </v-btn>

          <profile-me
            v-if="profile"
            :profile="profile"
            @close="menu = false"
          />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            round
            outline
            color="primary"
            to="/signup"
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            round
            color="primary"
            to="/login"
          >
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>
    </div>

    <v-content>
      <banner />
      <router-view />
      <snackbar />
    </v-content>

    <div v-if="!isKiosk">
      <span class="hidden-sm-and-up">
        <v-btn
          v-show="!isLoggedIn && isSignupEnabled"
          block
          round
          outline
          color="primary"
          to="/signup"
          :disabled="selected.length > 0"
        >
          {{ $t('SignUp') }}
        </v-btn>
        <v-btn
          v-show="!isLoggedIn"
          block
          round
          color="primary"
          to="/login"
          :disabled="selected.length > 0"
        >
          {{ $t('LogIn') }}
        </v-btn>
      </span>
    </div>

    <alert-add-note-dialog
      :id="currentAlertId"
      :is-visible="isNoteDialog"
      :status="currentAlertStatus"
      :is-watched="isWatched(currentAlertTags)"
      :value="isAcking ? 'ack' : 'note'"
      @close="toggleNoteDialog(false); $store.commit('alerts/SET_NOTE_BEFORE_ACK', false)"
      @add-note="addAlertNote"
    />

    <assign-to-dialog
      :is-visible="isAssignTo"
      @assign-to="assignTo"
      @close="isAssignTo = false"
    />
    <alert-change-severity-dialog
      :is-visible="isChangeSeverityDialog"
      @change-severity="changeSeverity"
      @close="isChangeSeverityDialog = false"
    />
    <notes-dialog @delete-note="handleDeleteNote" />
  </v-app>
</template>

<script>
import Banner from '@/components/lib/Banner.vue'
import ProfileMe from '@/components/auth/ProfileMe.vue'
import Snackbar from '@/components/lib/Snackbar.vue'
import AlertAddNote from '@/components/AlertAddNote'
import NotesDialog from '@/components/NotesDialog'
import i18n from '@/plugins/i18n'
import { bus } from '@/common/bus.ts'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    Banner,
    ProfileMe,
    Snackbar,
    NotesDialog,
    AlertAddNoteDialog: AlertAddNote,
    AssignToDialog: () => import('@/components/AssignToDialog.vue'),
    AlertChangeSeverityDialog: () => import('@/components/AlertChangeSeverityDialog.vue'),
  },
  props: [],
  data: () => ({
    hasFocus: false,
    menu: false,
    message: false,
    hints: true,
    dialog: false,
    drawer: false,
    columnSelected: 'Description',
    navbar: {
      signin: { icon: 'account_circle', text: i18n.t('SignIn'), path: '/login' }
    },
    error: false
  }),
  computed: {
    ...mapGetters({
      isGrouped: 'alerts/isAlertGrouped',
    }),
    columnsAvailable() {
      return [{ label: 'Resource', value: 'resource' }, { label: 'Description', value: 'text' }]
    },
    items() {
      return [
        {
          icon: 'list',
          text: i18n.t('Alerts'),
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'expand_less',
          'icon-alt': 'expand_more',
          text: i18n.t('Searches'),
          model: false,
          queries: this.queries
        },
        {
          icon: 'timer',
          text: i18n.t('Heartbeats'),
          path: '/heartbeats',
          perms: 'read:heartbeats',
          show: true
        },
        {
          icon: 'person',
          text: i18n.t('Users'),
          path: '/users',
          perms: 'admin:users',
          show: true
        },
        {
          icon: 'people',
          text: i18n.t('Groups'),
          path: '/groups',
          perms: 'read:groups',
          show: this.$config.provider == 'basic'
        },
        {
          icon: 'domain',
          text: i18n.t('Customers'),
          path: '/customers',
          perms: 'read:customers',
          show: this.$config.customer_views
        },
        {
          icon: 'notifications_off',
          text: i18n.t('Blackouts'),
          path: '/blackouts',
          perms: 'read:blackouts',
          show: true
        },
        {
          icon: 'security',
          text: i18n.t('Permissions'),
          path: '/perms',
          perms: 'read:perms',
          show: true
        },
        {
          icon: 'vpn_key',
          text: i18n.t('APIKeys'),
          path: '/keys',
          perms: 'read:keys',
          show: this.isLoggedIn || !this.isAuthRequired
        },
        {
          icon: 'assessment',
          text: i18n.t('Reports'),
          path: '/reports',
          perms: 'read:alerts',
          show: true
        },
        { divider: true},
        {
          icon: 'account_circle',
          text: i18n.t('Profile'),
          path: '/profile',
          perms: null,
          show: this.isLoggedIn
        },
        {
          icon: 'settings',
          text: i18n.t('Settings'),
          path: '/settings',
          perms: null,
          show: this.isLoggedIn
        },
        // { icon: 'chat_bubble', text: 'Send feedback' },
        {
          icon: 'help',
          text: i18n.t('Help'),
          path: '/help',
          appendIcon: 'open_in_new',
          perms: null,
          show: true
        },
        {
          icon: 'info',
          text: i18n.t('About'),
          path: '/about',
          perms: 'read:management',
          show: true
        }
      ]
    },
    isAcking() {
      return this.$store.state.alerts.isAddNoteBeforeAck
    },
    currentAlertId() {
      return this.$store.state.alerts.alert.id || ''
    },
    currentAlertTags() {
      return this.$store.state.alerts.alert.tags || []
    },
    currentAlertStatus() {
      return this.$store.state.alerts.alert.status || ''
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isWatch() {
      return this.$store.state.alerts.isWatch
    },
    languagePref() {
      return this.$store.getters.getPreference('languagePref')
    },
    isKiosk() {
      return this.$store.state.alerts.isKiosk
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isAuthRequired() {
      return this.$config.auth_required
    },
    isAllowReadonly() {
      return this.$config.allow_readonly
    },
    isSignupEnabled() {
      return this.$config.signup_enabled
    },
    isNoteDialog: {
      get() {
        return this.$store.state.alerts.isNoteDialog
      },
      set(bool) {
        return this.$store.dispatch('alerts/toggleNoteDialog', bool)
      }
    },
    profile() {
      return this.$store.state.auth.payload || {}
    },
    query: {
      get() {
        return this.$store.state.alerts.query.q
          ? this.$store.state.alerts.query.q.includes(':') 
            ? this.$store.state.alerts.query.q.split(':')[1] : this.$store.state.alerts.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    queries() {
      return this.$store.getters.getUserQueries.map(query => (
        {
          icon: 'remove_circle_outline',
          text: query.text,
          path: '/alerts',
          query: query.q,
          perms: 'read:alerts',
          show: true
        }))
    },
    actions() {
      return this.$config.actions
    },
    selected() {
      return this.$store.state.alerts.selected
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    avatar() {
      return this.$store.getters['auth/getAvatar']
    },
    isAssignTo: {
      get() {
        return this.$store.state.alerts.isDisplayAssignDialog
      },
      set(bool) {
        return this.$store.dispatch('alerts/setAssignTo', bool)
      }
    },
    isChangeSeverityDialog: {
      get() {
        return this.$store.state.alerts.isDisplayChangeSeverity
      },
      set(bool) {
        return this.$store.dispatch('alerts/setChangeSeverity', bool)
      }
    }
  },
  watch: {
    isKiosk(val) {
      if (val) {
        this.toggleFullScreen()
      }
    },
    languagePref(val) {
      i18n.locale = val
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.$store.dispatch('getUserPrefs')
      this.$store.dispatch('getUserQueries')
    }

    bus.$on('take-bulk-action', this.takeBulkAction)
    bus.$on('bulk-ack-alert', this.bulkAckAlert)
    bus.$on('bulk-shelve-alert', this.bulkShelveAlert)
    bus.$on('toggle-watch', this.toggleWatch)
    bus.$on('bulk-add-note', this.bulkAddNote)
    bus.$on('bulk-delete-alert', this.bulkDeleteAlert)
    bus.$on('toggle-assign-to', this.toggleAssignTo)
    bus.$on('set-change-severity', this.toggleChangeSeverity)
    bus.$on('group-alerts', this.handleGroupAlerts)
    bus.$on('ungroup-alerts', this.handleUnGroupAlerts)
  },
  
  beforeDestroy() {
    bus.$off('take-bulk-action', this.takeBulkAction)
    bus.$off('bulk-ack-alert', this.bulkAckAlert)
    bus.$off('bulk-shelve-alert', this.bulkShelveAlert)
    bus.$off('toggle-watch', this.toggleWatch)
    bus.$off('bulk-add-note', this.bulkAddNote)
    bus.$off('bulk-delete-alert', this.bulkDeleteAlert)
    bus.$off('toggle-assign-to', this.toggleAssignTo)
    bus.$off('set-change-severity', this.toggleChangeSeverity)
    bus.$off('group-alerts', this.handleGroupAlerts)
    bus.$off('ungroup-alerts', this.handleUnGroupAlerts)
  },
  methods: {
    handleGroupAlerts(data) {
      this.$store.dispatch('alerts/groupAlerts', data)
    },
    handleUnGroupAlerts(data) {
      this.$store.dispatch('alerts/ungroupAlerts', data)
    },
    toggleAssignTo(bool) {
      this.isAssignTo = bool
    },
    toggleChangeSeverity(bool) {
      this.isChangeSeverityDialog = bool
    },
    bulkAddNote() {
      this.toggleNoteDialog(true)
    },
    changeSeverity(data) {
      this.$store.dispatch('alerts/changeSeverity', data).then(() => {
        this.$store.dispatch(
          'notifications/success',
          'Severity changed correctly!',
          { root: true }
        )
      })
    },
    assignTo(data) {
      this.$store.dispatch('alerts/assignAlert', data).then(() => {
        this.$store.dispatch(
          'notifications/success',
          'Alert assigned correctly!',
          { root: true }
        )
      })
    },
    addAlertNote(data) {
      this.selected.length > 1 ? this.bulkAckAlert(data) : this.addSingleNote(data)
    },
    submitSearch(query) {
      if (query) {
        this.$store.dispatch('alerts/updateQuery', { q: `${this.columnSelected.toLowerCase()}:${query}` })
        this.$router.push({
          query: { ...this.$router.query, q: `${this.columnSelected.toLowerCase()}:${query}` },
          hash: this.$store.getters['alerts/getHash']
        })
        this.refresh()
      } else {
        this.$store.dispatch('alerts/updateQuery', {})
        this.$router.push({
          query: { ...this.$router.query },
          hash: this.$store.getters['alerts/getHash']
        })
        this.refresh()
      }
    },
    queryByColumn() {
      this.submitSearch(this.query)
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('alerts/updateQuery', {})
      this.$router.push({
        query: { ...this.$router.query, q: undefined },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    clearSelected() {
      this.$store.dispatch('alerts/updateSelected', [])
    },
    saveSearch() {
      if (this.query) {
        this.$store.dispatch('addUserQuery', {
          text: this.query,
          q: this.query
        })
      }
    },
    deleteSearch(query) {
      this.$store.dispatch('removeUserQuery', query)
    },
    takeBulkAction(action) {
      Promise.all(this.selected.map(a => this.$store.dispatch('alerts/takeAction', [a.id, action, '']))).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      }).then(() => {
        this.$store.dispatch(
          'notifications/success',
          'Bulk action executed correctly!',
          { root: true }
        )
      }).catch(() => {
        this.$store.dispatch(
          'notifications/error',
          'Something wrong happened',
          { root: true }
        )
      })
    },
    addSingleNote({ note, action, id }) {
      try {
        let alertId = id
        if (alertId === '' && this.$store.state.alerts.isAddNoteBeforeAck) {
          alertId = this.selected[0].id
        }

        this.$store.dispatch('alerts/addNote', [alertId, note]).then(() => {
          // Adding notes to child alerts if it is grouped
          if (this.isGrouped({ id: alertId })) {
            this.$store.dispatch('alerts/addNoteToGroupedAlerts', [alertId, note])
          }
        }).then(() => {
          this.$store.dispatch(
            'notifications/success',
            'Note added correctly!',
            { root: true }
          )
        })

        if (this.$store.state.alerts.isAddNoteBeforeAck) {
          this.$store
            .dispatch('alerts/takeAction', [alertId, action, note]).then(() => {
              this.$store.dispatch(
                'notifications/success',
                'Note added correctly!',
                { root: true }
              )
            })
        }
      } finally {
        this.$nextTick(() =>  {
          setTimeout(() => {
            this.getNotes(id)
          }, 200)
        })
      }
    },
    handleDeleteNote(noteId) {
      this.$store.dispatch('alerts/deleteNote', [this.currentAlertId, noteId])
    },
    getNotes(id) {
      this.$store.dispatch('alerts/getNotes', id)
    },
    toggleNoteDialog(bool) {
      this.isNoteDialog = bool
    },
    bulkAckAlert(note) {
      if (!note) {
        alert('To bulk ack this alerts you need to first add a note :)')
        this.$store.dispatch('alerts/setIsAddingNoteBeforeAck', true)
        this.toggleNoteDialog(true)
        return
      }
      
      this.selected.forEach(alert => {
        // Adding notes to child alerts if it is grouped
        if (this.isGrouped({ id: alert.id })) {
          this.$store.dispatch('alerts/addNoteToGroupedAlerts', [alert.id, note])
        }
      })

      this.$store.dispatch('alerts/addBulkNotes', [this.selected, note]).then(() => {

        this.clearSelected()
        this.$store.dispatch(
          'notifications/success',
          'Notes added correctly!',
          { root: true }
        )
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkShelveAlert() {
      Promise.all(this.selected.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'shelve',
            '',
            this.shelveTimeout
          ])
      })).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    isWatched(tags) {
      const tag = `watch:${this.username}`
      return tags ? tags.indexOf(tag) > -1 : false
    },
    toggleWatch() {
      var map
      if (this.selected.some(x => !this.isWatched(x.tags))) {
        map = this.selected.map(a => this.watchAlert(a.id))
      } else {
        map = this.selected.map(a => this.unwatchAlert(a.id))
      }
    
      Promise.all(map).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      }).then(() => {
        this.$store.dispatch(
          'notifications/success',
          'Alerts are being watched!',
          { root: true }
        )
      })
    },
    watchAlert(id) {
      this.$store.dispatch('alerts/watchAlert', id)
    },
    unwatchAlert(id) {
      this.$store.dispatch('alerts/unwatchAlert', id)
    },
    bulkDeleteAlert() {
      confirm(i18n.t('ConfirmDelete')) &&
        Promise.all(this.selected.map(a => {
          if (!this.isGrouped(a)) {
            this.$store.dispatch('alerts/deleteAlert', a.id, false)
          } else {
            this.$store.dispatch('alerts/deleteGroupedAlerts', a.id, false)
          }
        })).then(() => {
          this.clearSelected()
          this.$store.dispatch('alerts/getAlerts')
        })
    },
    toggle(sw, value) {
      this.$store.dispatch('alerts/toggle', [sw, value])
    },
    toggleFullScreen() {
      let elem = document.getElementById('alerta')
      if (!this.isFullscreen()) {
        elem.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    isFullscreen() {
      return document.fullscreenElement
    },
    refresh() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
    }
  }
}
</script>

<style>

@import "./assets/css/fonts.css";

.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}

.logo {
  font-family: "Sonsie One", cursive;
  font-size: 26px;
}

.btn--plain {
  padding: 0;
  opacity: 0.6;
}
.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}
.btn--plain:hover {
  opacity: 1;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
