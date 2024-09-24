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
        @row-click="rowClick"
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
              <q-select class="search-select2" v-model="search.useYn" :options="useYnOpts" label="사용 유무" />
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
    <div class="form-card" ref="formCard">
      <q-card v-show="modalToggle" @mousedown="startDrag">
        <div class="form-container" v-show="formToggle">
          <q-card-actions>
            <q-input class="form-node" v-model="editedItem.roleId" label-slot :readonly="readonly">
              <template v-slot:label>
                <span>권한 코드</span><span class="requiredLabel"> *</span>
              </template>
            </q-input>
            <q-space/>
            <q-input class="form-node" v-model="editedItem.roleNm" label-slot>
              <template v-slot:label>
                <span>권한명</span><span class="requiredLabel"> *</span>
              </template>
            </q-input>
            <q-space/>
            <q-input class="form-node" v-model="editedItem.roleDesc" label-slot>
              <template v-slot:label>
                <span>권한 설명</span><span class="requiredLabel"> *</span>
              </template>
            </q-input>

            <q-select class="form-node" v-model="editedItem.useYn" :options="useYnOpts2" label-slot>
              <template v-slot:label>
                <span>사용 구분</span><span class="requiredLabel"> *</span>
              </template>
            </q-select>
            
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
            <q-btn color="primary" label="CHECK_LIST" @click="checkDeleteItemToggle = !checkDeleteItemToggle"></q-btn>
          </q-card-actions>
          
          <q-separator inset />

          <q-card-section v-show="checkDeleteItemToggle">
            {{ deleteItem }}
          </q-card-section>
        </div>
      </q-card>
    </div>
  </div>

</template>

<script>
import { api } from 'src/boot/axios';

export default {
  data() {
    return {
      // 화면 메인 타이틀
      mainTitle: "역할 관리",

      // 테이블 헤더
      columns: [
        {
          name: 'index',
          label: '#',
          field: 'index'
        },
        {
          name: 'roleId',
          required: true,
          label: '권한 코드',
          align: 'center',
          field: 'roleId',
          sortable: true
        },
        { name: 'roleNm', align: 'center', label: '권한명', field: 'roleNm', sortable: true },
        { name: 'roleDesc', align: 'center', label: '권한 설명', field: 'roleDesc', sortable: true },
        { name: 'useYn', align: 'center', label: '사용구분', field: 'useYn', sortable: true },
        { name: 'uptId', align: 'center', label: '수정자', field: 'uptId', sortable: true },
        { name: 'uptDate', align: 'center', label: '수정일자', field: 'uptDate', sortable: true },
        { name: 'regId', align: 'center', label: '등록자', field: 'regId', sortable: true },
        { name: 'regDate', align: 'center', label: '등록일자', field: 'regDate', sortable: true },
        { name: 'edit', align: 'center', label: 'Edit', field: 'edit', sortable: false }
      ],

      // 테이블 데이터
      rows: [],

      // 테이블 체크된 리스트
      selected: [],
      // 삭제 아이템
      deleteItem: [],

      // 모달창 토글
      modalToggle: false,

      // 추가, 수정 모달창 토글
      formToggle: false,

      // 삭제 모달창 토글
      delteFormToggle: false,
      // 삭제 아이템 리스트창 토글
      checkDeleteItemToggle: false,

      // 수정
      editedItem: {
        roleId: null,
        roleNm: null,
        roleDesc: null,
        useYn: {
          label: '사용',
          value: 'Y'
        },
        addMod: 'A'
      },
      defaultItem: {
        roleId: null,
        roleNm: null,
        roleDesc: null,
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
          label: '권한 코드',
          value: 'roleId'
        },
        {
          label: '권한명',
          value: 'roleNm'
        },
        {
          label: '권한 설명',
          value: 'roleDesc'
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
      this.selected = [];

      const params = {
          sortBy:  this.pagination.sortBy
        , descending: (this.pagination.descending === true)? 'dc' : 'ac'
        , page: this.pagination.page
        , numOfRows: this.pagination.rowsPerPage
        , searchTxt: (this.search.txt !== null && this.search.txt !== "")? this.search.txt : null
        , searchOpt : this.search.opt.value
        , searchUseYn : this.search.useYn.value
      }

      api.post("/roleMng/getRoleList", params)
      .then((res) => {
        this.rows = res.data.data.resList;
        this.pagination.rowsNumber = res.data.data.total;
        this.rowsSet();
      })
      .catch((err) => {
        console.log(err);
      })
    },

    // 데이터에 값 추가
    rowsSet() {
      this.rows.forEach((row, index) => {
        row.index = index+1;
        for(const [key, value] of Object.entries(row)){
          if(`${value}` === 'null'){
            row[`${key}`] = '-'
          } 
        }
      })
    },

    // 수정 버튼 
    editMethod(item){
      this.editedItem = this.$_.cloneDeep(item.row);
      this.readonly = true;
      this.editedItem.addMod = 'M';
      if(this.editedItem.useYn === 'Y') this.editedItem.useYn = {label: '사용', value: 'Y'}
      else this.editedItem.useYn = {label: '미사용', value: 'N'}
      this.formOpen();
    },

    // 추가 버튼
    formOpen(event) {
      this.modalToggle = true;
      this.formToggle = true;
    },

    // 추가, 수정, 삭제 모달창 닫기
    closeModal(){
      this.editedItem = this.$_.cloneDeep(this.defaultItem);
      this.deleteItem = [];
      this.readonly = false;  
      this.modalToggle = false;    
      this.formToggle = false;
      this.delteFormToggle = false;
      this.checkDeleteItemToggle = false;
      this.replaceModal();
    },

    // 추가, 수정된 데이터 저장
    saveData() {
      const roleId = this.editedItem.roleId;
      const roleNm = this.editedItem.roleNm;
      const roleDesc = this.editedItem.roleDesc;
      if( (roleId === null || roleId === "")
        || (roleNm === null || roleNm === "")
        || (roleDesc === null || roleDesc === "")
      ){
        alert("필수 값들을 입력해 주세요.");
        return
      }

      this.editedItem.useYn = this.editedItem.useYn.value;
      
      api.post("/roleMng/roleAddMod", this.editedItem)
      .then((res) => {
        alert('저장완료');
        this.setTableData();
        this.closeModal();
      })
      .catch((err) => {
        if(this.editedItem.useYn === 'Y') this.editedItem.useYn = {label: '사용', value: 'Y'}
        else this.editedItem.useYn = {label: '미사용', value: 'N'}
        
        if(err.code === 'ERR_BAD_RESPONSE') alert('이미 중복된 권한코드가 있습니다.');
      })
      
    },

    // 삭제 버튼
    removeMethod() {
      if(this.selected.length === 0){
        alert("선택된 데이터가 없습니다");
      } else{
        this.selected.forEach((item) => {
          this.deleteItem.push(item.roleId);
        });
        this.modalToggle = true;
        this.delteFormToggle = true;
      }
    },

    // 삭제 확인
    delteData() {
      api.post("/roleMng/roleDel", this.deleteItem)
      .then((res) => {
        alert('삭제완료');
        this.setTableData();
        this.closeModal();
      })
      .catch((err) => {
        console.log(err);
      })
    },

    // 페이지 변화에 따른 작용
    changePage(){
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

      const clientX = event.clientX;
      const clientY = event.clientY;

      // 초기 드래그 시작 지점과 모달의 현재 위치 계산
      this.dragStartX = clientX - this.modalOffsetX;
      this.dragStartY = clientY - this.modalOffsetY;

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
    },
    onDrag(event) {
      if (!this.isDragging) return;

      const clientX = event.clientX;
      const clientY = event.clientY;

      // 현재 마우스 위치에 따라 모달의 새로운 좌표 계산
      this.modalOffsetX = clientX - this.dragStartX;
      this.modalOffsetY = clientY - this.dragStartY;

      const formCard = this.$refs.formCard;
      formCard.style.transform = `translate(${this.modalOffsetX}px, ${this.modalOffsetY}px)`;
    },
    stopDrag() {
      this.isDragging = false;

      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    },
    // 모달창 가운데 정렬
    replaceModal(){
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.modalOffsetX = 0;
      this.modalOffsetY = 0;
      const formCard = this.$refs.formCard;
      formCard.style.transform = `translate(0px, 0px)`;
    },

    // 행 클릭 이벤트
    rowClick(evt, row, index){
      this.$emit("rowClick", row.roleId);
    }
  },

  computed: {
    // 페이지 길이
    pageLength() {
      return Math.ceil(this.pagination.rowsNumber / this.pagination.rowsPerPage) 
    },

    // 현재 페이지
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
  width: 49%;
}

.search-select {
  width: 32%;
  font-size: 1em;
}

.search-select2 {
  width: 19%;
  font-size: 1em;
}

.requiredLabel{
  color: red;
}
</style>