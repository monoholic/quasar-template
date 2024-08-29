<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> Vue Template </q-toolbar-title>
        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>
        <q-expansion-item expand-separator icon="mail" label="Inbox">
          <q-expansion-item
            :header-inset-level="1"
            expand-separator
            icon="receipt"
            label="Receipts"
            default-opened
            v-on:click="pageMove"
          >
          </q-expansion-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>
    <router-view />
  </q-layout>
</template>

<script setup></script>

<script>
export default {
  components: {},
  data() {
    return {
      leftDrawerOpen: false,
    };
  },

  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    pageMove() {
      this.$router.push('/list');
    },
  },
};
</script>
