<template>
  <div class="role-mng-container">
    <div class="role-components">
      <ComRole @rowClick = "rowClick"></ComRole>
    </div>
    <div class="role-components">
      <UserRole :selectedRoleId = "selectedRoleId"></UserRole>
    </div>
  </div>
</template>

<script>
import ComRole from './ComRole.vue';
import UserRole from './UserRole.vue';

export default {
  components: {
    ComRole,
    UserRole
  },

  data() {
    return {
      selectedRoleId: null,
    }
  },

  methods: {
    rowClick(roleId){
      this.selectedRoleId = roleId;
    }
  }
}
</script>

<style lang="scss" scoped>
.role-mng-container {
  display: flex;
  flex-wrap: wrap;
}

.role-components {
  width: 49%;
  margin: 0.5%;
}
</style>