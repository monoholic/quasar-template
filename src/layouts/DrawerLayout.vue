<template>
  <q-scroll-area class="fit">
    <q-list>
      <q-item-label header> Menu Bar </q-item-label>
      <div v-for="menu in state.menuList" :key="menu.menuId">
        <q-expansion-item
          expand-separator
          :icon="menu.menuIcon"
          :label="menu.menuNm"
        >
          <div v-for="subMenu in state.subMenuList" :key="subMenu.menuId">
            <q-expansion-item
              :header-inset-level="1"
              :icon="subMenu.menuIcon"
              :label="subMenu.menuNm"
              v-if="
                menu.menuId === subMenu.uppMenuId && subMenu.routeYn === 'Y'
              "
            >
              <div
                v-for="thirdMenu in state.thirdMenuList"
                :key="thirdMenu.menuId"
              >
                <q-item
                  :inset-level="2"
                  :label="thirdMenu.menuNm"
                  v-if="subMenu.menuId === thirdMenu.uppMenuId"
                  v-on:click="pageMove(thirdMenu.url)"
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon :name="thirdMenu.menuIcon" />
                  </q-item-section>
                  <q-item-section> {{ thirdMenu.menuNm }} </q-item-section>
                </q-item>
              </div>
            </q-expansion-item>

            <q-item
              :inset-level="1"
              :label="subMenu.menuNm"
              v-else-if="
                menu.menuId === subMenu.uppMenuId && subMenu.routeYn === 'N'
              "
              v-on:click="pageMove(subMenu.url)"
              clickable
            >
              <q-item-section avatar>
                <q-icon :name="subMenu.menuIcon" />
              </q-item-section>
              <q-item-section> {{ subMenu.menuNm }} </q-item-section>
            </q-item>
          </div>
        </q-expansion-item>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script>
import { onMounted, reactive } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    onMounted(async () => {
      getMenuList();
    });

    const state = reactive({
      menuList: [],
      subMenuList: [],
      thirdMenuList: [],
    });

    const getMenuList = () => {
      api
        .get("/menu/menuList")
        .then((res) => {
          if (res.data.code === 200) {
            menuAppend(res.data.data);
          }
        })
        .catch((error) => {})
        .finally(() => {
          console.log("항상 마지막에 실행");
        });
    };

    const pageMove = (pagePath) => {
      router.push({ name: pagePath });
    };

    const menuAppend = (data) => {
      state.menuList = data.filter((menu) => menu.menuLvl === "1");
      state.subMenuList = data.filter((menu) => menu.menuLvl === "2");
      state.thirdMenuList = data.filter((menu) => menu.menuLvl === "3");
    };

    return {
      getMenuList,
      pageMove,
      menuAppend,
      state,
    };
  },
};
</script>
