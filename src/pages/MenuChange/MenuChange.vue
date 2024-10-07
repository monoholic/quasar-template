<template>
  <div class="menu-component">
    <div class="container">
      <!-- 트리 컴포넌트 -->
      <div class="tree-section">
        <ul>
          <tree-item
            class="item"
            :model="treeData"
            @menu-selected="handleMenuSelect"
          ></tree-item>
        </ul>
      </div>

      <!-- 선택된 메뉴의 상세 정보를 보여주는 부분 -->
      <div class="details-section" v-if="selectedMenu">
        <h3>메뉴 상세 정보</h3>
        <label>메뉴 ID:</label>
        <input type="text" v-model="selectedMenu.menuId" readonly />
        <br />

        <label>메뉴 이름:</label>
        <input type="text" v-model="selectedMenu.name" />
        <br />

        <label>URL:</label>
        <input type="text" v-model="selectedMenu.url" />
        <br />

        <label>Route 여부:</label>
        <select v-model="selectedMenu.routeYn">
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
        <br />

        <label>메뉴 설명:</label>
        <input type="text" v-model="selectedMenu.description" />
      </div>
    </div>
  </div>
</template>

<script>
import TreeItem from "./TreeItem.vue"; // 트리 아이템 컴포넌트 임포트
import { api } from "boot/axios"; // axios 인스턴스

export default {
  name: "MenuComponent", // 컴포넌트 이름
  components: {
    TreeItem, // TreeItem 컴포넌트 등록
  },
  data() {
    return {
      treeData: {
        name: "Menu",
        children: [], // 트리 구조 데이터
      },
      selectedMenu: null, // 선택된 메뉴의 상세 정보
    };
  },
  mounted() {
    this.getMenuList(); // 컴포넌트가 마운트되면 메뉴 리스트를 가져옴
  },
  methods: {
    // 메뉴 데이터를 API로 가져옴
    getMenuList() {
      api
        .get("/menu/menuList")
        .then((res) => {
          if (res.data.code === 200) {
            this.menuAppend(res.data.data); // 메뉴 데이터를 처리
          }
        })
        .catch((error) => {
          console.error(error); // 에러 처리
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
          url: menu.url,
          routeYn: menu.routeYn,
          description: menu.description,
          children: [],
        });
      });

      data.forEach((menu) => {
        if (menu.uppMenuId) {
          const childMenu = {
            menuId: menu.menuId,
            name: menu.menuNm,
            url: menu.url,
            routeYn: menu.routeYn,
            description: menu.description,
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
    },

    // 트리에서 선택된 메뉴의 상세 정보 가져오기
    handleMenuSelect(selectedMenu) {
      this.selectedMenu = selectedMenu;
    },
  },
};
</script>

<style scoped>
.menu-component {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  border: 1px solid #ccc;
}

.tree-section {
  flex: 1;
  padding: 10px;
  border-right: 1px solid #ccc;
  overflow-y: auto; /* 트리 메뉴가 길어질 경우 스크롤 가능하게 */
}

.details-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* 상세 정보가 많아질 경우 스크롤 가능하게 */
}

.item {
  cursor: pointer;
  line-height: 1.5;
}
</style>
