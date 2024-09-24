<template>

<!-- 
  deptNm 에 관해 서버에서 deptCd로 수정 필요
  추가 수정 시 서버에서 RED_ID, UPT_ID 수정
-->

  <q-card class="table-card" title="테이블">
      <!-- 테이블 -->
      <q-table
        flat bordered
        :rows="rows"
        :columns="columns"
        row-key="index"
        separator="vertical"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[10]"
        @row-dblclick="rowDblclick"
      >

        <!-- 탑 버튼 -->
        <template v-slot:top>
          <q-card style="width:100%">
            <!-- 검색 영역 -->
            <q-card-section class="search-section">
              <q-input class="search-input" dense color="primary" label="사용자ID" v-model="search.userId" @keyup.enter="setTableData()"/>
              <q-input class="search-input" dense color="primary" label="사용자명" v-model="search.userNm"  @keyup.enter="setTableData()"/>
              <q-select class="search-input" dense color="primary" label="사용여부" v-model="search.useYn" :options="useYnOption"/>
              <q-space/>
              <q-card-actions align='right'>
                <q-btn color="primary" label="Search" @click="setTableData()"></q-btn>
                <q-btn color="primary" label="Close" @click="CloseUserListModal()"></q-btn>
              </q-card-actions>
            </q-card-section>
          </q-card>
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
  </q-card>

</template>

<script>
import { api } from 'src/boot/axios';


export default {

  data() {
    return {

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
        { name: 'email', align: 'center', label: '이메일', field: 'email', style: 'width:15%', sortable: true },
        { name: 'telNo', align: 'center', label: '전화번호', field: 'telNo', style: 'width:10%', sortable: true },
        { name: 'gender', align: 'center', label: '성별', field: 'gender', style: 'width:0.5%', sortable: true },
        { name: 'useYn', align: 'center', label: '사용여부', field: 'useYn', style: 'width:0.5%', sortable: true },
      ],

      // 테이블 데이터
      rows: [],

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
            label: '사용',
            value: 'Y'
          },
          {
            label: '미사용',
            value: 'N'
          }
        ],

      // 테이블 내용변경(sort, page)
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
    }
  },

  methods: {
    // 테이블 초기 데이터 세팅
    setTableData(){
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

    // 페이지 변화에 따른 작용
    changePage(){
      this.setTableData();
    },

    // 요청에 따른 메소드(정렬)
    onRequest(props) {
      this.pagination = props.pagination;
      this.setTableData();
    },

    // 행 더블클릭
    rowDblclick(evt, row, index){
      this.CloseUserListModal();
      this.$emit("selectedUserId", row.userId);
    },

    // 창 닫기
    CloseUserListModal(){
      this.$emit("CloseUserListModal")
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

.search-section{
  display: flex;
}

.search-input {
  width: 24%;
  margin-right: 2%;
}
</style>