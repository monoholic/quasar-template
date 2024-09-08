<template>
  <q-btn title="JOIN" v-on:click="join()">Join</q-btn>
  <q-btn title="LOGIN" v-on:click="login()">Login</q-btn>
  <q-btn title="LOGIN" v-on:click="getMenuList()">MenuList</q-btn>
</template>

<script>
import { defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  setup() {
    return {};
  },
  components: {},
  data() {
    return {
      isLoading: false,
      fullPage: true,
    };
  },

  methods: {
    join() {
      let id = "aa";
      let password = "12345";

      this.$api
        .post("/join", null, { params: { userId: id, password: password } })
        .then((res) => {
          if (res.data.code === 200) {
            console.log("res =====> ", res.data.code);
          } else {
            console.log("err =====> ", res.data.code);
          }
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(" error ==>", error);
          this.isLoading = false;
        })
        .finally(() => {
          console.log("항상 마지막에 실행");
        });
    },
    login() {
      let id = "a";
      let password = "1234";

      this.$api
        .post("/login", null, { params: { username: id, password: password } })
        .then((res) => {
          if (res.data.code === 200) {
            localStorage.setItem("token", JSON.stringify(res.data));

            console.log("res =====> ", res.data.code);
          } else {
            console.log("err =====> ", res.data.code);
          }
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(" error ==>", error);
          this.isLoading = false;
        })
        .finally(() => {
          console.log("항상 마지막에 실행");
        });

      console.log("======> ", localStorage.getItem("token"));

      localStorage.removeItem("token");
    },
  },
});
</script>
