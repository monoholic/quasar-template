<script setup>
import { ref, computed } from "vue";

// 부모로부터 "model"을 props로 받음
const props = defineProps({
  model: Object,
});

// 이벤트를 사용해 부모에게 데이터 변경 요청
const emit = defineEmits(["update:model"]);

const isOpen = ref(false);
const isFolder = computed(() => {
  return props.model.children && props.model.children.length;
});

function toggle() {
  isOpen.value = !isOpen.value;
}

function changeType() {
  if (!isFolder.value) {
    // "children" 배열을 부모에 알려서 업데이트 요청
    emit("update:model", {
      ...props.model,
      children: [{ name: "new stuff" }],
    });
    isOpen.value = true;
  }
}

function addChild() {
  // 새로운 자식을 추가하도록 부모에게 요청
  const updatedChildren = [...props.model.children, { name: "new stuff" }];
  emit("update:model", {
    ...props.model,
    children: updatedChildren,
  });
}
</script>

<template>
  <li>
    <div :class="{ bold: isFolder }" @click="toggle" @dblclick="changeType">
      {{ model.name }}
      <span v-if="isFolder">[{{ isOpen ? "-" : "+" }}]</span>
    </div>
    <ul v-show="isOpen" v-if="isFolder">
      <!-- TreeItem을 재귀적으로 렌더링 -->
      <TreeItem
        class="item"
        v-for="(childModel, index) in model.children"
        :model="childModel"
        :key="index"
        @update:model="
          (updatedChild) => {
            const updatedChildren = [...model.children];
            updatedChildren[index] = updatedChild;
            emit('update:model', { ...model, children: updatedChildren });
          }
        "
      />
    </ul>
  </li>
</template>
