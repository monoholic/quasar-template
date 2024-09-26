<template>
  <q-page-container>
    <q-btn
      unelevated
      color="black"
      size="lg"
      class="full-width"
      label="로그아웃"
      v-on:click="logout()"
    />
    <q-btn
      unelevated
      color="black"
      size="lg"
      class="full-width"
      label="재발급"
      v-on:click="reissue()"
    />
  </q-page-container>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {
      id: "",
      password: "",
    };
  },
  methods: {
    test() {
      // localStorage에 저장된 key,Value를 꺼내는 방법
      let userInfo = JSON.parse(localStorage.getItem("userInfo"));

      console.log("===> ", userInfo.userId);
    },
    logout() {
      this.$api
        .post("/logout", null, {
          withCredentials: true,
        })
        .then((response) => {
          console.log(response);
        });
      localStorage.setItem("userInfo", null);
      console.log("===> ", localStorage.getItem("userInfo"));
      alert("로그아웃 되었습니다.");
      this.$router.push("/login");
    },
    reissue() {
      this.$api
        .post("/reissue", null, {
          withCredentials: true,
        })
        .then((response) => {
          alert("재발급되었습니다.");
          console.log(response);
        });
    },
  },
};
</script>
