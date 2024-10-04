<template>
  <q-page class="window-height window-width row justify-center items-center">
    <div class="column">
      <div class="row">
        <h5 class="text-h5 text-white q-my-md">Company & Co</h5>
      </div>
      <div class="row">
        <q-card square bordered class="q-pa-lg shadow-1">
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                square
                filled
                clearable
                v-model="id"
                type="userId"
                label="ID"
              />
              <q-input
                square
                filled
                clearable
                v-model="password"
                type="password"
                label="password"
              />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn
              unelevated
              color="black"
              size="lg"
              class="full-width"
              label="Login"
              v-on:click="login()"
            />
          </q-card-actions>
          <q-card-section class="text-center q-pa-none">
            <p class="text-grey-6">Not reigistered? Created an Account</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "LoginLayout",
  data() {
    return {
      id: "",
      password: "",
    };
  },
  methods: {
    //localStorage에 저장된 key,Value를 꺼내는 방법
    //let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    //console.log("===> ", userInfo.userId);
    login() {
      let id = this.id;
      let password = this.password;
      if (id === "") {
        alert("아이디를 입력하세요.");
        return null;
      } else if (password === "") {
        alert("비밀번호를 입력하세요.");
        return null;
      }
      this.$api
        .post("/login", null, {
          withCredentials: true,
          params: { username: id, password: password },
        })
        .then((response) => {
          if (response.status == 200) {
            console.log(response);
            this.getUserInfo();
            this.$router.push("/home");
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            alert("로그인에 실패했습니다. 관리자에게 문의하세요.");
          }
          console.log(" error ==>", error);
          this.isLoading = false;
        })
        .finally(() => {
          console.log("항상 마지막에 실행");
        });
    },
    getUserInfo() {
      let id = this.id;
      console.log(id);
      this.$api
        .post("/getUserInfo", {
          userId: id,
        })
        .then((res) => {
          localStorage.setItem("userInfo", JSON.stringify(res.data.data));
        });
    },
  },
};
</script>

<style>
.q-card {
  width: 360px;
}
</style>
