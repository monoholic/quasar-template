<script setup>
import { ref, onMounted } from "vue"; // Vue 3 Composition API 사용
import { api } from "boot/axios"; // axios 인스턴스 임포트
import TreeItem from "./TreeItem.vue"; // 트리 아이템 컴포넌트 임포트

// 트리 데이터 및 기타 상태 관리
const menuList = ref([]);
const treeData = ref({
  name: "Menu",
  children: [],
});
const isDetail = ref(false); // 상세보기 제어용 변수

// 메뉴 리스트 데이터를 가져오는 함수
const getMenuList = () => {
  api
    .get("/menu/menuList")
    .then((res) => {
      if (res.data.code === 200) {
        menuAppend(res.data.data); // 메뉴 데이터를 처리하는 로직
      }
    })
    .catch((error) => {
      console.error(error); // 에러 처리
    })
    .finally(() => {
      console.log("항상 마지막에 실행");
    });
};

// 부모 메뉴를 찾고 children에 추가하는 함수
const findParentAndAppendChild = (parentId, childMenu, parentList) => {
  for (let menu of parentList) {
    if (menu.menuId === parentId) {
      if (!menu.children) {
        menu.children = []; // children 배열이 없으면 생성
      }
      menu.children.push(childMenu);
      return true; // 추가했으니 true 반환
    } else if (menu.children && menu.children.length > 0) {
      if (findParentAndAppendChild(parentId, childMenu, menu.children)) {
        return true;
      }
    }
  }
  return false; // 부모 메뉴를 찾지 못한 경우
};

// 메뉴 데이터를 트리 구조로 추가하는 함수
const menuAppend = (data) => {
  const rootMenus = data.filter((menu) => !menu.uppMenuId); // 상위 메뉴가 없는 루트 메뉴들

  rootMenus.forEach((menu) => {
    treeData.value.children.push({
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
      findParentAndAppendChild(
        menu.uppMenuId,
        childMenu,
        treeData.value.children
      );
    }
  });

  console.log(treeData.value.children); // 트리 구조 확인
};

// 컴포넌트가 마운트될 때 메뉴 리스트를 불러오는 로직
onMounted(() => {
  getMenuList();
});

// 디버깅용 함수 (트리 데이터를 확인)
const test = () => {
  console.log(treeData.value.children);
};
</script>

<template>
  <ul>
    <!-- 트리 아이템 컴포넌트에 데이터 바인딩 및 클릭 이벤트 처리 -->
    <TreeItem class="item" :model="treeData" @click="test" />
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
