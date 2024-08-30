<template>
  <q-scroll-area class="fit">
    <q-list>
      <q-item-label header> Menu Bar </q-item-label>
      <q-expansion-item expand-separator icon="mail" label="Inbox">
        <q-expansion-item
          :header-inset-level="1"
          expand-separator
          icon="receipt"
          label="Receipts"
        >
          <q-item clickable v-on:click="getLoadData()">
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>
            <q-item-section> Inbox </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-expansion-item>
    </q-list>
  </q-scroll-area>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      isLoading: false,
      fullPage: true,
    };
  },

  methods: {
    getLoadData() {
      let id = "hkjung";
      let password = "1";

      this.$api
        .post("/api/getMenuList", {
          userId: id,
          passwd: password,
        })
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
  },
};
</script>
