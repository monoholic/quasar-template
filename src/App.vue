<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Title
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      show-if-above
      bordered
      v-if="showMenu"
    >
      <DrawerLayout />
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script setup></script>

<script>
import DrawerLayout from "./layouts/DrawerLayout.vue";

export default {
  components: { DrawerLayout },
  data() {
    return {
      leftDrawerOpen: false,
      showMenu: false,
      userInfo: "",
    };
  },

  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    pageMove() {
      this.$router.push("/login");
    },
  },
  computed() {
    this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log(this.userInfo);
    if (this.userInfo == null) {
      console.log(this.userInfo);
      console.log(this.showMenu);
      this.showMenu = false;
    } else if (this.userInfo !== null) {
      console.log(this.userInfo);
      console.log(this.showMenu);
      this.showMenu = true;
    }
  },
  watch: {
    $route(to, from) {
      // Route 변화 시 실행
      this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
      this.showMenu = this.userInfo !== null;
    },
  },
};
</script>
