<script>
export default {
  name: "TreeItem",
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isOpen: false, // 트리의 열림/닫힘 상태를 관리
    };
  },
  computed: {
    isFolder() {
      return this.model.children && this.model.children.length;
    },
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
      this.$emit("menu-selected", this.model);
    },
    selectMenu() {
      // 메뉴 선택 시 부모 컴포넌트에 선택된 메뉴를 전달
    },
  },
};
</script>

<template>
  <li>
    <!-- 트리 항목. 클릭 시 열림/닫힘, 더블 클릭 시 메뉴 선택 -->
    <div :class="{ bold: isFolder }" @click="toggle" @dblclick="selectMenu">
      {{ model.name }}
      <span v-if="isFolder">[{{ isOpen ? "-" : "+" }}]</span>
    </div>

    <!-- 하위 트리 항목을 재귀적으로 렌더링 -->
    <ul v-show="isOpen" v-if="isFolder">
      <TreeItem
        class="item"
        v-for="(childModel, index) in model.children"
        :model="childModel"
        :key="index"
        @menu-selected="$emit('menu-selected', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.bold {
  font-weight: bold;
}
</style>
