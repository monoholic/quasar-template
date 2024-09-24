<template>
  <div class="com-code-container">
    <div class="comCode">
      <ComCodeGrp @rowClick="rowClick"></ComCodeGrp>
    </div>
    <div class="comCode">
      <ComCode :selectedGrpId="selectedGrpId"></ComCode>
    </div>
  </div>
</template>

<script>
import ComCodeGrp from './ComCodeGrp.vue';
import ComCode from './ComCode.vue';

export default {
  components: {
    ComCodeGrp,
    ComCode
  },

  data(){
    return{
      selectedGrpId: null,
    }
  },

  methods: {
    rowClick(grpId){
      this.selectedGrpId = grpId;
    },
  }
}
</script>

<style lang="scss" scoped>
.com-code-container {
  display: flex;
  flex-wrap: wrap;
}

.comCode{
  width: 49%;
  margin: 0.5%;
}
</style>