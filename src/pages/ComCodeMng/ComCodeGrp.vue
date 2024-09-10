<template>

  <div class="main-title">
    {{ mainTitle }}
  </div>

  <q-card class="table-card" title="테이블">
    <q-card-section>
      <!-- 테이블 -->
      <q-table
        flat bordered
        title="Treats"
        :rows="rows"
        :columns="columns"
        row-key="index"
        separator="vertical"
        selection="multiple"
        v-model:selected="selected"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[20]"
      >

        <!-- 탑 버튼 -->
        <template v-slot:top>
          <q-card style="width:100%">
            <!-- 검색 영역 -->
            <q-card-section class="search-section">
              <q-select class="search-select" v-model="search.opt" :options="searchOpts" label="검색 조건" />
              &nbsp;&nbsp;&nbsp;
              <q-input class="search-input" color="primary" label="검색" v-model="search.txt" @keyup.enter="setTableData()"/>
              &nbsp;&nbsp;&nbsp;
              <q-select class="search-select" v-model="search.useYn" :options="useYnOpts" label="사용 유무" />
            </q-card-section>

            <!-- 검색, 추가, 삭제 버튼 -->
            <q-card-actions align='right'>
              <q-btn color="primary" label="Search" @click="setTableData()"></q-btn>
              <q-space />
              <q-btn color="primary" label="Add" @click="formOpen()"></q-btn>
              <q-btn color="primary" label="Remove" @click="removeMethod"></q-btn>
            </q-card-actions>
          </q-card>
        </template>

        <!-- 수정 버튼 -->
        <template v-slot:body-cell-edit="item">
          <q-td :props="item">
            <div>
              <q-icon name="edit" size="1.5em" @click="editMethod(item)" style="cursor: pointer;"></q-icon>
            </div>
          </q-td>
        </template>

        <!-- 페이지 네이션 -->
        <template v-slot:pagination>
          <q-pagination
            v-model="pagination.page"
            :max="pageLength"
            :max-pages="5"
            :ellipses="false"
            :boundary-numbers="false"
            direction-links
            boundary-links
            :model-value="curPageSet"
            @update:model-value="changePage"
          />
        </template>

      </q-table>
    </q-card-section>
  </q-card>

  <!-- 추가, 수정 모달 form -->
  <div class="fromDiv" v-show="modalToggle">
    <q-card class="form-card" v-show="modalToggle" @mousedown="startDrag" @touchstart="startDrag" id="formCard">
      <div class="form-container" v-show="formToggle">
        <q-card-actions>
          <q-input class="form-node" v-model="editedItem.codeGrpId" label="공통코드 그룹 ID" :readonly="readonly" />
          <q-space/>
          <q-input class="form-node" v-model="editedItem.codeGrpNm" label="공통코드 그룹명" />
          <q-space/>
          <q-input class="form-node" v-model="editedItem.codeGrpEngNm" label="공통코드 영문명" />
          
          <q-input class="form-node" v-model="editedItem.codeGrpDesc" label="공통코드 그룹 설명" />
          <q-space/>
          <q-input class="form-node" v-model="editedItem.sortOrd" label="정렬순서" />
          <q-space/>
          <q-select class="form-node" v-model="editedItem.useYn" :options="useYnOpts2" label="사용 구분" />
        </q-card-actions>

        <q-card-actions align="right">
          <q-btn color="primary" label="CANCEL" @click="closeModal"></q-btn>
          <q-btn color="primary" label="SAVE" @click="saveData"></q-btn>
        </q-card-actions>
      </div>

      <div class="form-container" v-show="delteFormToggle">
        <q-card-section class="delete-text">
          선택한 데이터를 지우시겠습니까??
        </q-card-section>
        <q-card-actions align="center">
          <q-btn color="primary" label="CANCEL" @click="closeModal"></q-btn>
          <q-btn color="primary" label="CONFIRM" @click="delteData"></q-btn>
        </q-card-actions>
      </div>
    </q-card>
  </div>

</template>

<script>
import { api } from 'src/boot/axios';

export default {
  data() {
    return {
      // 화면 메인 타이틀
      mainTitle: "공통코드 그룹 관리",

      // 테이블 헤더
      columns: [
        {
          name: 'index',
          label: '#',
          field: 'index'
        },
        {
          name: 'codeGrpId',
          required: true,
          label: '공통코드 그룹 ID',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'codeGrpNm', align: 'left', label: '공통코드 그룹명', field: 'codeGrpNm', sortable: true },
        { name: 'codeGrpEngNm', align: 'center', label: '공통코드 영문명', field: 'codeGrpEngNm', sortable: true },
        { name: 'codeGrpDesc', label: '공통코드 그룹 설명', field: 'codeGrpDesc', sortable: true },
        { name: 'sortOrd', label: '정렬순서', field: 'sortOrd', sortable: true },
        { name: 'useYn', label: '사용구분', field: 'useYn', sortable: true },
        { name: 'updId', label: '수정자', field: 'updId', sortable: true },
        { name: 'updDate', label: '수정일자', field: 'updDate', sortable: true },
        { name: 'regId', label: '등록자', field: 'regId', sortable: true },
        { name: 'regDate', label: '등록일자', field: 'regDate', sortable: true },
        { name: 'edit', align: 'center', label: 'Edit', field: 'edit', sortable: false }
      ],

      // 테이블 데이터
      rows: [],

      // 테이블 체크된 리스트
      selected: [],

      // 모달창 토글
      modalToggle: false,

      // 추가, 수정 모달창 토글
      formToggle: false,

      // 삭제 모달창 토글
      delteFormToggle: false,

      // 수정
      editedItem: {
        codeGrpId: null,
        codeGrpNm: null,
        codeGrpEngNm: null,
        codeGrpDesc: null,
        sortOrd: null,
        useYn: {
          label: '사용',
          value: 'Y'
        },
        addMod: 'A'
      },
      defaultItem: {
        codeGrpId: null,
        codeGrpNm: null,
        codeGrpEngNm: null,
        codeGrpDesc: null,
        sortOrd: null,
        useYn: {
          label: '사용',
          value: 'Y'
        },
        addMod: 'A'
      },
      readonly: false,
      useYnOpts2: [
        {
          label: '사용',
          value: 'Y'
        },
        {
          label: '미사용',
          value: 'N'
        },
      ],

      // 검색쿼리
      search: {
        txt: null,
        opt: {
          label: '검색항목 선택',
          value: null
        },
        useYn: {
          label: '전체',
          value: null
        },
      },
      searchOpts: [
        {
          label: '검색항목 선택',
          value: null
        },
        {
          label: '공통코드 그룹 ID',
          value: 'codeGrpId'
        },
        {
          label: '공통코드 그룹명',
          value: 'codeGrpNm'
        },
        {
          label: '공통코드 그룹 설명',
          value: 'codeGrpDesc'
        },
      ],
      useYnOpts:[
        {
          label: '전체',
          value: null
        },
        {
          label: '사용',
          value: 'Y'
        },
        {
          label: '미사용',
          value: 'N'
        },
      ],

      // 테이블 내용변경(sort, page)
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0
      },

      // 모달창 이동
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      modalOffsetX: 0,
      modalOffsetY: 0,

    }
  },

  methods: {
    // 테이블 초기 데이터 세팅
    setTableData(){
      const params = {
          sortBy:  this.pagination.sortBy
        , descending: (this.pagination.descending === null)? 'ac' : 'dc'
        , page: this.pagination.page
        , searchTxt: this.search.txt
        , searchOpt : this.search.opt
        , searchUseYn : this.search.useYn
      }

      // 서버 통신
      this.rowsSet();
    },

    // 데이터에 값 추가
    rowsSet() {
      this.rows.forEach((row, index) => {
        row.index = index+1;
      })
    },

    // 수정 버튼 
    editMethod(item){
      this.editedItem = this.$_.cloneDeep(item.row);
      this.readonly = true;
      this.formOpen();
    },

    // 추가 버튼
    formOpen(event) {
      this.modalToggle = true;
      this.formToggle = true
      console.log('모달오픈');
    },

    // 추가, 수정 모달창 닫기
    closeModal(){
      this.editedItem = this.$_.cloneDeep(this.defaultItem);
      this.readonly = false;  
      this.modalToggle = false;    
      this.formToggle = false;
      this.delteFormToggle = false;
    },

    // 추가, 수정된 데이터 저장
    saveData() {
      // 서버통신
      console.log(this.editedItem);
      this.setTableData();
    },

    // 삭제 버튼
    removeMethod() {
      this.modalToggle = true;
      this.delteFormToggle = true;
      console.log('삭제모달');
    },

    // 삭제 확인
    delteData() {
      // 서버통신
      if(this.selected.length === 0){
        alert("선택된 데이터가 없습니다");
        this.closeModal();
      } else{
        console.log(this.selected);
        this.setTableData();
      }
    },

    // 페이지 변화에 따른 작용
    changePage(){
      console.log('페이지변화');
      this.setTableData();
    },

    // 요청에 따른 메소드(정렬)
    onRequest(props) {
      this.pagination = props.pagination;
      this.setTableData();
    },

    // 모달창 이동
    startDrag(event) {
      this.isDragging = true;

      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;

      // 초기 드래그 시작 지점과 모달의 현재 위치 계산
      this.dragStartX = clientX - this.modalOffsetX;
      this.dragStartY = clientY - this.modalOffsetY;

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchmove", this.onDrag);
      document.addEventListener("touchend", this.stopDrag);
    },
    onDrag(event) {
      if (!this.isDragging) return;

      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;

      // 현재 마우스 위치에 따라 모달의 새로운 좌표 계산
      this.modalOffsetX = clientX - this.dragStartX;
      this.modalOffsetY = clientY - this.dragStartY;

      const formCard = document.getElementById("formCard");
      formCard.style.transform = `translate(${this.modalOffsetX}px, ${this.modalOffsetY}px)`;
    },
    stopDrag() {
      this.isDragging = false;

      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchmove", this.onDrag);
      document.removeEventListener("touchend", this.stopDrag);
    },
  },

  computed: {
    pageLength() {
      return Math.ceil(this.pagination.rowsNumber / this.pagination.rowsPerPage) 
    },

    curPageSet() {
      return this.pagination.page
    }
  },

  created () {
    this.setTableData();
  },
}
</script>

<style lang="scss" scoped>
.main-title{
  font-size: 50px;
  margin: 0.5%;
}

.delete-text{
  font-size: 30px;
}

.fromDiv {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

  /* dimmed */
.form-card {
  position: absolute;
  top: 50%;
  left: 50%;
}
/* modal or popup */
.form-container {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 600px;
  background: #fff;
  padding: 20px;
  box-sizing: border-box;
  cursor: move;
}
.form-node {
  width: 30%;
}

.search-section{
  display: flex;
}

.search-input {
  width: 70%;
}

.search-select {
  width: 30%;
}
</style>