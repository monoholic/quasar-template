<script>
import { api } from "boot/axios";
import { onMounted, ref } from "vue";
import TreeItem from "./TreeItem.vue";

export default {
  name: "MenuComponent", // 컴포넌트 이름
  components: {
    TreeItem, // TreeItem 컴포넌트 등록
  },
  setup() {
    // 메뉴 리스트를 담을 ref
    const menuList = ref([]);

    // 메뉴 데이터를 가져오는 함수
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

    // 트리 데이터를 ref로 선언
    const treeData = ref({
      name: "Menu",
      children: [],
    });

    // 컴포넌트가 마운트될 때 데이터 로드
    onMounted(() => {
      getMenuList();
    });

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
            return true; // 재귀적으로 검색 후 추가
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

    // setup 함수에서 리턴할 값
    return {
      menuList,
      treeData,
      menuAppend,
    };
  },
};
</script>

<template>
  <ul>
    <TreeItem class="item" :model="treeData"></TreeItem>
  </ul>
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
