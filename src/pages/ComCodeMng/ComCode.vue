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
              <q-input class="search-input" dense color="primary" label="Dessert(100g serving)" v-model="search.name"/>
              <q-input class="search-input" dense color="primary" label="Calories" v-model="search.calories"/>
              <q-input class="search-input" dense color="primary" label="1"/>
              <q-input class="search-input" dense color="primary" label="2"/>
              <q-input class="search-input" dense color="primary" label="3"/>
            </q-card-section>

            <q-card-section class="search-section">
              <q-input class="search-input" dense color="primary" label="4"/>
              <q-input class="search-input" dense color="primary" label="5"/>
              <q-input class="search-input" dense color="primary" label="6"/>
              <q-input class="search-input" dense color="primary" label="7"/>
              <q-input class="search-input" dense color="primary" label="8"/>
            </q-card-section>
            
            <!-- 검색, 추가, 삭제 버튼 -->
            <q-card-actions align='right'>
              <q-btn color="primary" label="Search" @click="setTableData()"></q-btn>
              <q-space />
              <q-btn color="primary" label="Add" @click="formOpen('add')"></q-btn>
              <q-btn v-if="rows.length !== 0" class="q-ml-sm" color="primary" label="Remove" @click="removeMethod"></q-btn>
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

          <q-input v-model="editedItem.name" label="Dessert (100g serving)" :readonly="readonly" />
          <q-space/>
          <q-input filled v-model="editedItem.calories" label="Calories" />
          <q-space/>
          <q-input outlined v-model="editedItem.fat" label="Fat (g)" />
          
          <q-input standout v-model="editedItem.carbs" label="Carbs (g)" />
          <q-space/>
          <q-input standout v-model="editedItem.protein" label="Protein (g)" />
          <q-space/>
          <q-space/>
          <q-space/>
          <q-space/>
          <q-space/>
          <q-space/>

        </q-card-actions>

        <q-separator/>

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
      mainTitle: "수정",

      // 테이블 헤더
      columns: [
        {
          name: 'index',
          label: '#',
          field: 'index'
        },
        {
          name: 'name',
          required: true,
          label: 'Dessert (100g serving)',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'calories', align: 'left', label: 'Calories', field: 'calories', sortable: true },
        { name: 'fat', align: 'center', label: 'Fat (g)', field: 'fat', sortable: true },
        { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
        { name: 'protein', label: 'Protein (g)', field: 'protein' },
        { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
        { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
        { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
        { name: 'edit', align: 'center', label: 'Edit', field: 'edit', sortable: false }
      ],

      // 테이블 데이터
      rows: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: '14%',
          iron: '1%'
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          sodium: 129,
          calcium: '8%',
          iron: '1%'
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          sodium: 337,
          calcium: '6%',
          iron: '7%'
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          sodium: 413,
          calcium: '3%',
          iron: '8%'
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          sodium: 327,
          calcium: '7%',
          iron: '16%'
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          sodium: 50,
          calcium: '0%',
          iron: '0%'
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          sodium: 38,
          calcium: '0%',
          iron: '2%'
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          sodium: 562,
          calcium: '0%',
          iron: '45%'
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          sodium: 326,
          calcium: '2%',
          iron: '22%'
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          sodium: 54,
          calcium: '12%',
          iron: '6%'
        },

        {
          name: 'Frozen Yogurt2',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: '14%',
          iron: '1%'
        },
        {
          name: 'Ice cream sandwich2',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          sodium: 129,
          calcium: '8%',
          iron: '1%'
        },
        {
          name: 'Eclair2',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          sodium: 337,
          calcium: '6%',
          iron: '7%'
        },
        {
          name: 'Cupcake2',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          sodium: 413,
          calcium: '3%',
          iron: '8%'
        },
        {
          name: 'Gingerbread2',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          sodium: 327,
          calcium: '7%',
          iron: '16%'
        },
        {
          name: 'Jelly bean2',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          sodium: 50,
          calcium: '0%',
          iron: '0%'
        },
        {
          name: 'Lollipop2',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          sodium: 38,
          calcium: '0%',
          iron: '2%'
        },
        {
          name: 'Honeycomb2',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          sodium: 562,
          calcium: '0%',
          iron: '45%'
        },
        {
          name: 'Donut2',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          sodium: 326,
          calcium: '2%',
          iron: '22%'
        },
        {
          name: 'KitKat2',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          sodium: 54,
          calcium: '12%',
          iron: '6%'
        },

        {
          name: 'Frozen Yogurt3',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: '14%',
          iron: '1%'
        },
        {
          name: 'Ice cream sandwich3',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          sodium: 129,
          calcium: '8%',
          iron: '1%'
        },
        {
          name: 'Eclair3',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          sodium: 337,
          calcium: '6%',
          iron: '7%'
        },
        {
          name: 'Cupcake3',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          sodium: 413,
          calcium: '3%',
          iron: '8%'
        },
        {
          name: 'Gingerbread3',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          sodium: 327,
          calcium: '7%',
          iron: '16%'
        },
        {
          name: 'Jelly bean3',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          sodium: 50,
          calcium: '0%',
          iron: '0%'
        },
        {
          name: 'Lollipop3',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          sodium: 38,
          calcium: '0%',
          iron: '2%'
        },
        {
          name: 'Honeycomb3',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          sodium: 562,
          calcium: '0%',
          iron: '45%'
        },
        {
          name: 'Donut3',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          sodium: 326,
          calcium: '2%',
          iron: '22%'
        },
        {
          name: 'KitKat3',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          sodium: 54,
          calcium: '12%',
          iron: '6%'
        },
      ],

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
        name: null,
        calories: null,
        fat: null,
        carbs: null,
        protein: null,
      },
      defaultItem: {
        name: null,
        calories: null,
        fat: null,
        carbs: null,
        protein: null,
      },
      readonly: false,

      // 검색쿼리
      search: {
        name: null,
        calories: null,
      },

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
      console.log('테이블데이터 세팅');
      const params = {
          sortBy:  this.pagination.sortBy
        , descending: (this.pagination.descending === null)? 'ac' : 'dc'
        , page: this.pagination.page
        , search: {
            name : this.search.name
          , calories : this.search.calories
        }
      }

      console.log('params ::: ', params);
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
      console.log(item.row);
      this.editedItem = item.row;
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
      this.editedItem = this.defaultItem;
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

.search-section{
  display: flex;
}

.search-input {
  width: 20%;
  margin-right: 2%;
}
</style>