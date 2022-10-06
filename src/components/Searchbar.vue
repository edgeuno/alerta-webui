<template>
  <v-layout
    v-if="$route.name === 'alerts'"
    row
  >
    <v-flex xs2>
      <v-select
        v-model="statusSelected"
        :items="statusAvailable"
        solo
        :placeholder="$t('Status')"
        height="44"
        :hint="$t('Status')"
        multiple
        flat
        item-text="label"
        item-value="value"
        :disabled="Boolean(selected.length)"
        :label="$t('Status')"
        class="pt-2 mr-2 hidden-sm-and-down"
      >
        <template v-slot:selection="{ item, index }">
          <v-chip v-if="index === 0">
            <span>{{ item.label }}</span>
          </v-chip>
          <span
            v-if="index === 1"
            class="grey--text caption"
          >(+{{ statusSelected.length - 1 }})</span>
        </template>
      </v-select>
    </v-flex>
    <v-flex xs10>
      <v-text-field
        v-model="searchValue"
        flat
        :label="$t('Search')"
        prepend-inner-icon="search"
        solo
        clearable
        :disabled="Boolean(selected.length)"
        height="44"
        class="pt-2 mr-3 hidden-sm-and-down"
        @focus="hasFocus = true"
        @blur="hasFocus = false"
        @click:clear="clearSearch"
        @keyup.enter.prevent="handleChange"
      >
        <template v-slot:append-outer>
          <v-tooltip  
            bottom
          >
            <template v-slot:activator="{ on }">
              <v-icon
                :disabled="Boolean(selected.length)"
                v-on="on"
                @click="saveSearch"
              >
                push_pin
              </v-icon>
            </template>
            <span>{{ $t('Save') }}</span>
          </v-tooltip>
        </template>
      </v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data: () => ({
    statusSelected: ['open'],
    searchValue: '',
    hasFocus: false,
    menu: false,
  }),
  computed: {
    selected() {
      return this.$store.state.alerts.selected
    },
    columns() {
      return this.$config.columns
    },
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
        }
      ]
    },
    query: {
      get() {
        return this.$store.state.alerts.query
          ? this.$store.state.alerts.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    }
  },
  methods: {
    handleChange(e) {
      const value = e.target.value
      const [statusCol, ...cols] = this.columns
      let selectedStatus = `status:${this.statusSelected.join(',')}`
      const searchHash = `${selectedStatus};${cols.map(col => `${col}:${value}`).join(';')}`
      
      console.log(searchHash)
      this.submitSearch(searchHash)
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
    saveSearch() {
      if (this.query) {
        this.$store.dispatch('addUserQuery', {
          text: this.query,
          q: this.query
        })
      }
    },
    submitSearch(query) {
      this.$store.dispatch('alerts/updateQuery', { q: query })
      this.$router.push({
        query: { q: query },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    refresh() {
      this.$emit('refresh')
    }
  }
}
</script>