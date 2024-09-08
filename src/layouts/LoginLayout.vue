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
    login() {
      let id = this.id;
      let password = this.password;
      console.log("test");
      console.log(id);
      console.log(password);

      this.$api
        .post("/login", null, { params: { username: id, password: password } })
        .then((response) => {
          console.log(response.status);

          console.log("Access Token from Header:", response.headers);
        })
        .catch((error) => {
          console.log(" error ==>", error);
          this.isLoading = false;
        })
        .finally(() => {
          console.log("항상 마지막에 실행");
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
