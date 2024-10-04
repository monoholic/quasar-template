<script>
import { api } from "boot/axios"; // axios 인스턴스 임포트
import TreeItem from "./TreeItem.vue"; // 트리 아이템 컴포넌트 임포트

export default {
  name: "MenuComponent", // 컴포넌트 이름
  components: {
    TreeItem, // TreeItem 컴포넌트 등록
  },
  data() {
    return {
      menuList: [],
      treeData: {
        name: "Menu",
        children: [],
      },
      isDetail: false, // 상세보기 제어용 변수
    };
  },
  mounted() {
    this.getMenuList(); // 컴포넌트가 마운트되면 메뉴 리스트를 가져옴
  },
  methods: {
    // 메뉴 데이터를 가져옴
    getMenuList() {
      api
        .get("/menu/menuList")
        .then((res) => {
          if (res.data.code === 200) {
            this.menuAppend(res.data.data); // 메뉴 데이터를 처리하는 로직
          }
        })
        .catch((error) => {
          console.error(error); // 에러 처리
        })
        .finally(() => {
          console.log("항상 마지막에 실행");
        });
    },

    // 부모 메뉴를 찾고 children에 추가
    findParentAndAppendChild(parentId, childMenu, parentList) {
      for (let menu of parentList) {
        if (menu.menuId === parentId) {
          if (!menu.children) {
            menu.children = []; // children 배열이 없으면 생성
          }
          menu.children.push(childMenu);
          return true; // 추가했으니 true 반환
        } else if (menu.children && menu.children.length > 0) {
          if (
            this.findParentAndAppendChild(parentId, childMenu, menu.children)
          ) {
            return true;
          }
        }
      }
      return false; // 부모 메뉴를 찾지 못한 경우
    },

    // 메뉴 데이터를 트리 구조로 추가
    menuAppend(data) {
      const rootMenus = data.filter((menu) => !menu.uppMenuId); // 상위 메뉴가 없는 루트 메뉴들

      rootMenus.forEach((menu) => {
        this.treeData.children.push({
          menuId: menu.menuId,
          name: menu.menuNm,
          menuLvl: menu.menuLvl,
          children: [],
        });
      });

      data.forEach((menu) => {
        if (menu.uppMenuId) {
          const childMenu = {
            menuId: menu.menuId,
            name: menu.menuNm,
            menuLvl: menu.menuLvl,
            children: [],
          };

          // 상위 메뉴를 찾아서 children에 추가
          this.findParentAndAppendChild(
            menu.uppMenuId,
            childMenu,
            this.treeData.children
          );
        }
      });
      console.log(this.treeData.children); // 트리 구조 확인
    },
    test() {
      console.log(this.treeData.children);
    },
  },
};
</script>

<template>
  <ul>
    <TreeItem class="item" :model="treeData" v-on:click="test"></TreeItem>
  </ul>
  <div
    v-show="isDetail"
    style="flex: 1; padding: 10px; border-left: 1px solid #ccc"
  >
    <div>
      <label>메뉴 ID:</label>
      <input type="text" readonly />
      <br />

      <label>메뉴 이름:</label>
      <input type="text" />
      <br />

      <label>URL:</label>
      <input type="text" />
      <br />

      <label>Route 여부:</label>
      <select>
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      <label>메뉴 설명:</label>
      <input type="text" />
    </div>
  </div>
</template>

<style>
.item {
  cursor: pointer;
  line-height: 1.5;
}
.bold {
  font-weight: bold;
}
</style>
