<template>

<!-- 
  deptNm 에 관해 서버에서 deptCd로 수정 필요
  추가 수정 시 서버에서 RED_ID, UPT_ID 수정
-->


  <div class="main-title">
    {{ mainTitle }}
  </div>

  <q-card class="table-card" title="테이블">
    <q-card-section>
      <!-- 테이블 -->
      <q-table
        flat bordered
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
              <q-input class="search-input" dense color="primary" label="사용자ID" v-model="search.userId" @keyup.enter="setTableData()"/>
              <q-input class="search-input" dense color="primary" label="사용자명" v-model="search.userNm"  @keyup.enter="setTableData()"/>
              <q-select class="search-input" dense color="primary" label="사용여부" v-model="search.useYn" :options="useYnOption"/>
            </q-card-section>
            
            <!-- 검색, 추가, 삭제 버튼 -->
            <q-card-actions align='right'>
              <q-btn color="primary" label="Search" @click="setTableData()"></q-btn>
              <q-space />
              <q-btn color="primary" label="Add" @click="formOpen()"></q-btn>
              <q-btn v-if="rows.length !== 0" class="q-ml-sm" color="primary" label="Remove" @click="removeMethod"></q-btn>
            </q-card-actions>
          </q-card>
        </template>

        <!-- 수정 버튼 -->
        <template v-slot:body-cell-edit="item">
          <q-td>
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

  <!-- 추가 수정 삭제 form 영역 -->
  <div class="fromDiv" v-show="modalToggle">
    <q-card class="form-card" v-show="modalToggle" @mousedown="startDrag" @touchstart="startDrag" id="formCard">
      <div class="form-container" v-show="formToggle">
        <q-card-actions>
          
          <q-input v-model="editedItem.userId" label-slot :readonly="readonly">
            <template v-slot:label>
              <span>사용자ID</span><span class="requiredLabel"> *</span>
            </template>
          </q-input>
          <q-space/>
          <q-input v-model="editedItem.userNm" label-slot>
            <template v-slot:label>
              <span>사용자명</span><span class="requiredLabel"> *</span>
            </template>
          </q-input>
          <q-space/>
          <q-input v-model="editedItem.useYn" label-slot>
            <template v-slot:label>
              <span>사용여부</span><span class="requiredLabel"> *</span>
            </template>
          </q-input>

          <q-input v-model="editedItem.telNo" label="전화번호" />
          <q-space/>
          <q-input v-model="editedItem.email" label="이메일" />
          <q-space/>
          <q-input v-model="editedItem.gender" label="성별" />
          
          <q-input v-model="editedItem.deptNm" label="부서" />
          <q-space/>
          <q-input v-model="editedItem.jikgyub" label="직급" />
          <q-space/>
          <q-input v-model="editedItem.role" label="역할" />
        </q-card-actions>

        <q-card-actions align="right">
          <q-btn color="primary" :label="pwBtnLabel" @click="pwModal"></q-btn>
          <q-space/>
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
          <q-btn color="primary" label="CHECK_LIST" @click="checkDeleteItem"></q-btn>
        </q-card-actions>

        <q-separator inset />

        <q-card-section v-show="checkDeleteItemToggle">
          {{ deleteItem }}
        </q-card-section>
      </div>

      <div class="form-container" v-show="pwFromToggle">
        <q-card-section class="pw-text">
          {{ pwBtnLabel }}
        </q-card-section>
        <q-card-actions>
          <q-input v-model="editedItem.password" style="width: 100%;" label-slot>
            <template v-slot:label>
              <span>비밀번호</span><span class="requiredLabel"> *</span>
            </template>
          </q-input>
          <q-input v-model="passwordCheck" style="width: 100%;" label-slot>
            <template v-slot:label>
              <span>비밀번호 확인</span><span class="requiredLabel"> *</span>
            </template>
          </q-input>
        </q-card-actions>
        <q-card-actions align="right">
          <q-btn color="primary" label="CANCEL" @click="closePwModal"></q-btn>
          <q-btn color="primary" label="SAVE" @click="savePwData"></q-btn>
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
      mainTitle: '사용자 관리',

      // 테이블 헤더
      columns: [
        {
          name: 'index',
          label: '순서',
          field: 'index',
          align: 'center',
          style: 'width:1%'
        },
        {
          name: 'userId',
          required: true,
          label: '사용자ID',
          field: 'userId',
          align: 'center',
          style: 'width:8%',
          sortable: true,
        },
        { name: 'userNm', align: 'center', label: '사용자명', field: 'userNm', style: 'width:6%', sortable: true },
        { name: 'deptNm', align: 'center', label: '부서', field: 'deptNm', style: 'width:5%', sortable: true },
        { name: 'jikgyub', align: 'center', label: '직급', field: 'jikgyub', style: 'width:3%', sortable: true },
        { name: 'role', align: 'center', label: '역할', field: 'role', style: 'width:3%', sortable: true },
        { name: 'email', align: 'center', label: '이메일', field: 'email', style: 'width:15%', sortable: true },
        { name: 'telNo', align: 'center', label: '전화번호', field: 'telNo', style: 'width:10%', sortable: true },
        { name: 'gender', align: 'center', label: '성별', field: 'gender', style: 'width:0.5%', sortable: true },
        { name: 'useYn', align: 'center', label: '사용여부', field: 'useYn', style: 'width:0.5%', sortable: true },
        { name: 'regId', align: 'center', label: '등록자', field: 'regId', style: 'width:8%', sortable: true },
        { name: 'regDate', align: 'center', label: '등록일자', field: 'regDate', style: 'width:10%', sortable: true },
        { name: 'uptId', align: 'center', label: '수정자', field: 'uptId', style: 'width:8%', sortable: true },
        { name: 'uptDate', align: 'center', label: '수정일자', field: 'uptDate', style: 'width:10%', sortable: true },
        { name: 'edit', align: 'center', label: 'Edit', field: 'edit', sortable: false }
      ],

      // 테이블 데이터
      // rows: [],
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

      // 비밀번호 토글
      pwFromToggle: false,

      // 수정
      editedItem: {
        userId: null,
        userNm: null,
        deptNm: null,
        jikgyub: null,
        role: null,
        email: null,
        telNo: null,
        gender: null,
        useYn: null,
        password: null,
        addMod: 'A',
      },
      defaultItem: {
        userId: null,
        userNm: null,
        deptNm: null,
        jikgyub: null,
        role: null,
        email: null,
        telNo: null,
        gender: null,
        useYn: null,
        password: null,
        addMod: 'A',
      },
      passwordCheck: null,
      readonly: false,

      // 검색쿼리
      search: {
        userId: null,
        userNm: null,
        useYn: {
            label: '전체',
            value: null
          }
      },
      useYnOption: [
          {
            label: '전체',
            value: null
          },
          {
            label: 'Y',
            value: 'Y'
          },
          {
            label: 'N',
            value: 'N'
          }
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
      console.log('테이블세팅');
      this.selected = [];
      this.editedItem = this.$_.cloneDeep(this.defaultItem);
      this.passwordCheck = null;
      const params = {
          sortBy:  this.pagination.sortBy
        , descending: (this.pagination.descending === true)? 'dc' : 'ac'
        , page: this.pagination.page
        , numOfRows: this.pagination.rowsPerPage
        , userId : this.search.userId
        , userNm : this.search.userNm
        , useYn : this.search.useYn.value
      }

      api.post("/userMng/list", params)
      .then((res) => {
        this.rows = res.data.data.resList;
        this.pagination.rowsNumber = res.data.data.total;
        this.rowsSet();
      })
      .catch((err) => {
        console.log(err);
      });

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
      this.formOpen();
    },

    // 추가 버튼
    formOpen(event) {
      this.modalToggle = true;
      this.formToggle = true
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
      if(this.editedItem.userId === null ||
        this.editedItem.userNm === null ||
        this.editedItem.useYn === null ||
        (this.editedItem.password === null && this.editedItem.addMod === 'A')
      ) {
        alert("필수값들을 입력해주세요");
        return;
      }
      // 서버통신
      api.post("/userMng/addMod", this.editedItem)
      .then((res) => {
        alert('저장완료');
        this.setTableData();
        this.closeModal();
      })
      .catch((err) => {
        if(err.code === 'ERR_BAD_REQUEST') alert('이미 아이디가 있습니다.');
      })
    },

    // 패스워드 모달
    pwModal(){
      this.formToggle = false;
      this.pwFromToggle = true;
    },

    // 패스워드 확인
    savePwData(){
      if(this.editedItem.addMod === 'A'){
        if(this.editedItem.password === null || this.passwordCheck === null){
          alert("입력칸을 채워주세요")
        } else{
          if(this.editedItem.password != this.passwordCheck){
            alert("비밀번호가 일치하지 않습니다.");
          } else {
            this.formToggle = true;
            this.pwFromToggle = false;
          }
        }
      }
    },

    // 패스워드 닫기
    closePwModal() {
      this.editedItem.password = null;
      this.passwordCheck = null;
      this.formToggle = true;
      this.pwFromToggle = false;
    },

    // 삭제 버튼
    removeMethod() {
      if(this.selected.length === 0){
        alert("선택된 데이터가 없습니다");
      } else {
        this.selected.forEach((item) => {
          this.deleteItem.push(item.userId);
        });
        this.modalToggle = true;
        this.delteFormToggle = true;
      }
    },

    // 삭제 확인
    delteData() {
      // 서버통신
      api.post("/userMng/del", this.deleteItem)
      .then((res) => {
        alert('삭제완료');
        this.setTableData();
        this.closeModal();
      })
      .catch((err) => {
        console.log(err);
      })
    },

    // 삭제 목록 조회
    checkDeleteItem(){
      this.checkDeleteItemToggle = !this.checkDeleteItemToggle;
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
    // 페이지 길이
    pageLength() {
      return Math.ceil(this.pagination.rowsNumber / this.pagination.rowsPerPage) 
    },

    // 현재 페이지
    curPageSet() {
      return this.pagination.page
    },

    // 패스워드 라벨
    pwBtnLabel(){
      let str = (this.editedItem.addMod === 'A')? '비밀번호 설정' : '비밀번호 변경';
      return str;
    },

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

.search-section{
  display: flex;
}

.search-input {
  width: 20%;
  margin-right: 2%;
}

.requiredLabel{
  color: red;
}
</style>