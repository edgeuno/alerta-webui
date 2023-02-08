import AlertsApi from '@/services/api/alert.service'

import moment from 'moment'
import utils from '@/common/utils'

const namespaced = true

const state = {
  isLoading: false,
  isSearching: false,

  alerts: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  services: [],
  groups: [],
  alertsGrouped: {},
  tags: [],

  alert: {},
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  isNoteDialog: false,
  isDisplayNotes: false,
  isAddNoteBeforeAck: false,
  isDisplayAssignDialog: false,
  isDisplayChangeSeverity: false,
  displayDensity: 'comfortable', // 'comfortable' or 'compact'

  // query, filter and pagination
  query: {}, // URLSearchParams
  filter: {
    // local defaults
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'default',
    descending: false,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state): any {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query): any {
    state.isSearching = true
    state.query = query
  },
  SET_ALERTS(state, [alerts, total, pageSize]): any {
    state.isLoading = false
    state.isSearching = false
    state.alerts = alerts
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  RESET_LOADING(state): any {
    state.isLoading = false
    state.isSearching = false
  },
  SET_KIOSK(state, isKiosk): any {
    state.isKiosk = isKiosk
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  SET_ALERT(state, alert): any {
    state.alert = alert
  },
  SET_NOTES(state, notes): any {
    state.notes = notes
  },
  SET_ENVIRONMENTS(state, environments): any {
    state.environments = environments
  },
  SET_SERVICES(state, services): any {
    state.services = services
  },
  SET_GROUPS(state, groups): any {
    state.groups = groups
  },
  SET_TAGS(state, tags): any {
    state.tags = tags
  },
  SET_SETTING(state, {s, v}) {
    state[s] = v
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_PANEL(state, panel) {
    state.showPanel = panel
  },
  TOGGLE_NOTE_DIALOG(state, bool) {
    state.isNoteDialog = bool
  },
  SET_NOTE_BEFORE_ACK(state, bool) {
    state.isAddNoteBeforeAck = bool
  },
  DISPLAY_NOTES(state, bool) {
    state.isDisplayNotes = bool
  },
  DISPLAY_ASSIGN_TO(state, bool) {
    state.isDisplayAssignDialog = bool
  },
  DISPLAY_CHANGE_SEVERITY(state, bool) {
    state.isDisplayChangeSeverity = bool
  },
  SET_ALERT_GROUP(state, group) {
    state.alertsGrouped = Object.assign({}, state.alertsGrouped, group)
  },
  REMOVE_ALERT_GROUP(state, groupId) {
    const grouped = Object.assign({}, state.alertsGrouped)
    delete grouped[groupId]
    state.alertsGrouped = grouped
  }
}

const actions = {
  addAlert({dispatch}, data) {
    return AlertsApi.addAlert(data).then(_ => dispatch('getAlerts'))
  },
  getAlerts({rootGetters, commit, state}) {
    commit('SET_LOADING')
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.environment && params.append('environment', state.filter.environment)
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // add server-side sorting
    let sortBy = state.pagination.sortBy
    if (sortBy === 'default' || !sortBy) {
      sortBy = rootGetters['getConfig']('sort_by')
    }

    if (typeof sortBy === 'string') {
      params.append('sort-by', (state.pagination.descending ? '-' : '') + sortBy)
    } else {
      sortBy.map(sb => params.append('sort-by', sb))
    }

    // need notes from alert history if showing notes icons
    if (rootGetters.getPreference('showNotesIcon')) {
      params.append('show-history', 'true')
    }

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // apply any date/time filters
    if (state.filter.dateRange[0] > 0) {
      params.append(
        'from-date',
        moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[0] < 0) {
      params.append(
        'from-date',
        moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
      )
    }
    if (state.filter.dateRange[1] > 0) {
      params.append(
        'to-date',
        moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[1] < 0) {
      params.append(
        'to-date',
        moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
      )
    }

    return AlertsApi.getAlerts(params)
      .then(({alerts, total, pageSize}) => commit('SET_ALERTS', [alerts, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },
  updateKiosk({commit}, isKiosk) {
    commit('SET_KIOSK', isKiosk)
  },
  updateSelected({commit}, selected) {
    commit('SET_SELECTED', selected)
  },

  toggleNoteDialog({commit}, bool) {
    commit('TOGGLE_NOTE_DIALOG', bool)
  },

  getAlert({commit}, alertId) {
    return AlertsApi.getAlert(alertId).then(({alert}) => {
      commit('SET_ALERT', alert)
    })
  },

  watchAlert({commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.tagAlert(alertId, {tags: [tag]})
  },
  unwatchAlert({commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.untagAlert(alertId, {tags: [tag]})
  },
  takeAction({commit, dispatch}, [alertId, action, text, timeout]) {
    return AlertsApi.actionAlert(alertId, {
      action: action,
      text: text,
      timeout: timeout
    })
  },
  tagAlert({commit, dispatch}, [alertId, tags]) {
    return AlertsApi.tagAlert(alertId, tags)
  },
  untagAlert({commit, dispatch}, [alertId, tags]) {
    return AlertsApi.untagAlert(alertId, tags)
  },
  displayNotes({commit}, bool) {
    commit('DISPLAY_NOTES', bool)
  },

  setChangeSeverity({commit}, bool) {
    commit('DISPLAY_CHANGE_SEVERITY', bool)
  },

  async changeSeverity({commit}, {alerts, severity}: {alerts: Array<{id: string}>; severity: string}) {
    for (let alert of alerts) {
      await AlertsApi.setSeverity({alert_id: alert.id, severity}).then(res => {
        if (alerts.length <= 1) {
          commit('SET_ALERT', res.alert)
        }
      })
    }
  },

  setAssignTo({commit}, bool) {
    commit('DISPLAY_ASSIGN_TO', bool)
  },

  async assignAlert({commit}, {alerts, assignedTo}: {alerts: Array<{id: string}>; assignedTo: string}) {
    for (let alert of alerts) {
      await AlertsApi.assignTo({alert_id: alert.id, assign_to: assignedTo}).then(res => {
        if (alerts.length <= 1) {
          commit('SET_ALERT', res.alert)
        }
      })
    }
  },

  async createTicket({dispatch}, alertId) {
    await AlertsApi.createTicket(alertId).then(() => {
      dispatch('notifications/success', 'Ticket created correctly!', {root: true})
    })
  },

  async addBulkNotes({dispatch, state}, [alerts, {note}]) {
    try {
      for (let alert of alerts) {
        if (alert) {
          if (state.isAddNoteBeforeAck) dispatch('takeAction', [alert.id, 'ack', note])
          else dispatch('addNote', [alert.id, note])
        }
      }

      dispatch('alerts/setIsAddingNoteBeforeAck', false)
    } catch (err) {
      console.error(err)
    } finally {
      dispatch('getAlerts')
      dispatch('updateSelected', [])
    }
  },
  setIsAddingNoteBeforeAck({commit}, bool) {
    commit('SET_NOTE_BEFORE_ACK', bool)
  },
  addNote({commit, dispatch}, [alertId, text]) {
    return AlertsApi.addNote(alertId, {
      text
    }).then(response => dispatch('getAlerts'))
  },
  getNotes({commit}, alertId) {
    return AlertsApi.getNotes(alertId).then(({notes}) => {
      commit('SET_NOTES', notes)
    })
  },
  updateNote({commit, dispatch}, [alertId, noteId, note]) {
    return AlertsApi.updateNote(alertId, noteId, {
      note: note
    }).then(response => dispatch('getNotes'))
  },
  deleteNote({commit, dispatch}, [alertId, noteId]) {
    return AlertsApi.deleteNote(alertId, noteId).then(response => dispatch('getNotes', [alertId]))
  },

  deleteAlert({commit, dispatch}, alertId) {
    return AlertsApi.deleteAlert(alertId)
  },

  getEnvironments({commit, state}) {
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // apply any date/time filters
    if (state.filter.dateRange[0] > 0) {
      params.append(
        'from-date',
        moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[0] < 0) {
      params.append(
        'from-date',
        moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
      )
    }
    if (state.filter.dateRange[1] > 0) {
      params.append(
        'to-date',
        moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[1] < 0) {
      params.append(
        'to-date',
        moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
      )
    }

    return AlertsApi.getEnvironments(params).then(({environments}) => commit('SET_ENVIRONMENTS', environments))
  },
  getServices({commit}) {
    return AlertsApi.getServices({}).then(({services}) => commit('SET_SERVICES', services))
  },
  getGroups({commit}) {
    return AlertsApi.getGroups({}).then(({groups}) => commit('SET_GROUPS', groups))
  },
  getTags({commit}) {
    return AlertsApi.getTags({}).then(({tags}) => commit('SET_TAGS', tags))
  },

  toggle({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  },
  set({commit}, [s, v]) {
    commit('SET_SETTING', {s, v})
  },
  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit, rootState}) {
    commit('SET_FILTER', rootState.config.filter)
  },
  setPagination({commit}, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  setPanel({commit}, panel) {
    commit('SET_PANEL', panel)
  },

  async groupAlerts({commit, dispatch, getters, state}, data) {
    // Parent will be the one selected first, and the other ones their 'child'
    let parent = data[0]
    // We group 'child' alerts
    const group = {[parent.id]: data.filter(item => item.id !== parent.id)}
    commit('SET_ALERT_GROUP', group)
    
    // We set selected to none, so bulk actions panel closes
    dispatch('updateSelected', [])
    
    // We need to removed grouped alerts from general alerts array
    const alerts = state.alerts.filter(alert => !getters.groupedAlerts.includes(alert.id))
    commit('SET_ALERTS', [alerts, alerts.length, state.pagination.rowsPerPage])
  },

  async ungroupAlerts({commit, dispatch, state}, data) {
    // Parent will be the one selected first, and the other ones their 'child'
    let parent = data[0].id
    // Removing grouped alerts
    commit('REMOVE_ALERT_GROUP', parent)
    // We set selected to none, so bulk actions panel closes
    dispatch('updateSelected', [])
    // Updating alerts list
    dispatch('getAlerts')
  },
}

const getters = {
  alerts: (state, getters, rootState) => {
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      const alerts = state.alerts.filter(a => a.tags.includes(tag))
      // We should check for any grouped alerts
      if (getters.groupedAlerts) return alerts.filter(alert => !getters.groupedAlerts.includes(alert.id))
      return alerts
    } else {
      // We should check for any grouped alerts
      if (getters.groupedAlerts) return state.alerts.filter(alert => !getters.groupedAlerts.includes(alert.id))
      return state.alerts
    }
  },
  groupedAlertsParents: state => {
    return Object.keys(state.alertsGrouped)
  },
  groupedAlerts: state => {
    let keys = Object.keys(state.alertsGrouped)
    if (!keys.length) return []

    return keys
      .map(key => state.alertsGrouped[key])
      .flat(1)
      .map(item => item.id)
  },
  environments:
    (state, getters, rootState) =>
    (showAllowedEnvs = true) => {
      if (showAllowedEnvs) {
        return [
          ...new Set([...(rootState.config.environments || []), ...state.environments.map(e => e.environment)])
        ].sort()
      }
      return state.environments.map(e => e.environment).sort()
    },
  counts: state => {
    return state.environments.reduce(
      (grp, e) => {
        grp[e.environment] = e.count
        grp['ALL'] = grp['ALL'] + e.count
        return grp
      },
      {ALL: 0}
    )
  },
  services: state => {
    return state.services.map(s => s.service).sort()
  },
  groups: state => {
    return state.groups.map(g => g.group).sort()
  },
  tags: state => {
    return state.tags.map(t => t.tag).sort()
  },
  getHash: state => {
    let filterHash = utils.toHash(state.filter)
    let sortBy = state.pagination.sortBy ? state.pagination.sortBy : 'default'
    let descending = state.pagination.descending ? 1 : 0
    let paginationHash = `sb:${sortBy};sd:${descending}`
    let asiHash = `asi:${state.showPanel ? 1 : 0}`
    return `#${filterHash};${paginationHash};${asiHash}`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
