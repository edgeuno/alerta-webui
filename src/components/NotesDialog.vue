<template>
  <v-dialog
    v-model="visibility"
    width="520"
    persistent
    lazy
  >
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Notes
      </v-card-title>
      <v-card-text>
        <v-list two-line>
          <template v-for="(item, index) in notes">
            <div :key="index + item.text">
              <v-list-tile-content>
                <v-list-tile-title>
                  <strong>
                    {{ item.user }}
                  </strong>
                </v-list-tile-title>
                <v-list-tile-title class="mb-2">
                  Added a note ({{ item.createTime | timeago }}):
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <span class="heading">{{ item.text }}</span>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                  icon 
                  ripple 
                  @click="deleteNote(item.id)"
                >
                  <v-icon color="grey lighten-1">
                    delete
                  </v-icon>
                </v-btn>
              </v-list-tile-action>
            </div>
            <div 
              :key="item.text + index" 
              class="my-3"
            >
              <v-divider
                v-if="index !== notes.length - 1"
              />
            </div>
          </template>
        </v-list>
        <v-btn 
          color="green darken-1"
          flat="flat"
          block
          @click="close"
        >
          {{ $t('Close') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  computed: {
    visibility: {
      get() {
        return this.$store.state.alerts.isDisplayNotes
      },
      set(bool) {
        return this.$store.dispatch('alerts/displayNotes', bool)
      }
    },
    notes() {
      let t = this.$store.state.alerts.notes
      return t
    }
  },
  methods: {
    deleteNote(id) {
      this.$emit('delete-note', id)
    },
    close() {
      this.visibility = false
    }
  }
}
</script>