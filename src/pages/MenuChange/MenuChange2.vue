<template>
  <div style="display: flex; width: 100%">
    <div style="flex: 1; padding: 10px">
      <table border="1">
        <thead>
          <tr>
            <th>메뉴 ID</th>
            <th>메뉴 이름</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="menu in menuList"
            :key="menu.menuId"
            v-on:click="getMenuDetail(menu)"
          >
            <td>{{ menu.menuId }}</td>
            <td>{{ menu.menuNm }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-show="isDetail"
      style="flex: 1; padding: 10px; border-left: 1px solid #ccc"
    >
      <div :key="menuDetail.menuId">
        <label>메뉴 ID:</label>
        <input type="text" v-model="menuDetail.menuId" readonly />
        <br />

        <label>메뉴 이름:</label>
        <input type="text" v-model="menuDetail.menuNm" />
        <br />

        <label>URL:</label>
        <input type="text" v-model="menuDetail.url" />
        <br />

        <label>Route 여부:</label>
        <select v-model="menuDetail.routeYn">
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
        <br />

        <label>메뉴 설명:</label>
        <input type="text" v-model="menuDetail.menuDesc" />
      </div>
    </div>
  </div>
</template>
<script>
import { api } from "boot/axios";

export default {
  name: "MainLayout",
  data() {
    return {
      menuList: [],
      isDetail: false,
      menuDetail: {
        menuId: "",
        menuLvl: "",
        url: "",
        routeYn: "",
        menuDesc: "",
      },
    };
  },
  created() {
    api
      .get("/menu/menuList")
      .then((res) => {
        if (res.data.code === 200) {
          this.menuList = res.data.data.sort((a, b) => {
            return a.menuId - b.menuId; // 숫자 오름차순 정렬
          });
          console.log(this.menuList);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        console.log("항상 마지막에 실행");
      });
  },
  methods: {
    getMenuDetail(menu) {
      console.log("선택한 메뉴:", menu);
      this.menuDetail = menu;
      this.isDetail = true;
    },
  },
};
</script>
