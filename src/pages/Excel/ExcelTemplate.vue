<template>
  <div class="main-title">
    {{ mainTitle }}
  </div>

  <q-card class="table-card" title="테이블">
    <q-card-section>
      <!-- 테이블 -->
      <q-table
        flat
        bordered
        title="Treats"
        :rows="rows"
        :columns="columns"
        row-key="index"
        separator="vertical"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[20]"
      >
        <!-- 탑 버튼 -->
        <template v-slot:top>
          <q-card style="width: 100%">
            <!-- 검색 영역 -->
            <q-card-section class="search-section">
              <q-input
                class="search-input"
                dense
                color="primary"
                label="사원 ID"
                v-model="search.sawonNo"
                @keyup.enter="setTableData()"
              />
              <q-input
                class="search-input"
                dense
                color="primary"
                label="사원 이름"
                v-model="search.sawonNm"
                @keyup.enter="setTableData()"
              />
            </q-card-section>

            <!-- 검색, 엑셀 폼, 업로드, 다운로드 버튼 -->
            <q-card-actions align="right">
              <q-btn
                color="primary"
                label="Search"
                @click="setTableData()"
              ></q-btn>
              <q-space />
              <q-btn
                color="primary"
                label="Template"
                @click="templateMethod"
              ></q-btn>
              <q-btn
                color="primary"
                label="Upload"
                @click="uploadOpen()"
              ></q-btn>
              <q-btn
                color="primary"
                label="Download"
                @click="downloadMethod"
              ></q-btn>
            </q-card-actions>
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
    </q-card-section>
  </q-card>

  <div class="fromDiv" v-show="modalToggle">
    <q-card
      class="form-card"
      v-show="modalToggle"
      @mousedown="startDrag"
      @touchstart="startDrag"
      id="formCard"
    >
      <q-card-actions align="center">
        <div>
          <input
            type="file"
            @change="handleFileUpload"
            accept=".xlsx, .xls"
            method="POST"
            enctype="multipart/form-data"
          />
          <q-card-actions align="right">
            <q-btn color="primary" label="UPLOAD" @click="uploadData"></q-btn>
            <q-btn color="primary" label="CANCEL" @click="closeModal"></q-btn>
          </q-card-actions>
        </div>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { api } from "src/boot/axios";
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      // 화면 메인 타이틀
      mainTitle: "근무 기록",

      // 테이블 헤더
      columns: [
        {
          name: "index",
          align: "center",
          label: "No",
          field: "rn",
          style: "width:1%",
        },
        {
          name: "sawonNo",
          align: "center",
          label: "사원ID",
          field: "sawonNo",
          style: "width:14%",
          sortable: true,
        },
        {
          name: "sawonNm",
          align: "center",
          label: "사원명",
          field: "sawonNm",
          style: "width:14%",
          sortable: true,
        },
        {
          name: "startDate",
          align: "center",
          label: "날짜",
          field: "startDate",
          style: "width:14%",
          sortable: true,
        },
        {
          name: "startTime",
          align: "center",
          label: "출근",
          field: "startTime",
          style: "width:14%",
          sortable: true,
        },
        {
          name: "endTime",
          align: "center",
          label: "퇴근",
          field: "endTime",
          style: "width:14%",
          sortable: true,
        },
        {
          name: "cause",
          align: "center",
          label: "사유",
          field: "cause",
          style: "width:29%",
          sortable: true,
        },
      ],

      // 테이블 데이터
      rows: [],

      // 모달창 토글
      modalToggle: false,

      // 검색쿼리
      search: {
        sawonNo: null,
        sawonNm: null,
      },

      // 테이블 내용변경(sort, page)
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0,
      },

      excelLogs: [
        {
          sawonNo: "1234567",
          sawonNm: "홍길동",
          startDate: "240927",
          startTime: "080000",
          endTime: "170000",
          cause: "TEST",
        },
      ],

      list: null,
      file: null,
    };
  },

  methods: {
    // 테이블 초기 데이터 세팅
    setTableData() {
      console.log("테이블데이터 세팅");
      const params = {
        sortBy: this.pagination.sortBy,
        descending: this.pagination.descending === true ? "dc" : "ac",
        page: this.pagination.page,
        numOfRows: this.pagination.rowsPerPage,
        sawonNo: this.search.sawonNo,
        sawonNm: this.search.sawonNm,
        /*         startDate: this.pagination.startDate,
        startTime: this.pagination.startTime,
        endTime: this.pagination.endTime,
        cause: this.pagination.cause, */
      };

      console.log("params ::: ", params);

      api
        .post("/excel/list", params)
        .then((res) => {
          this.rows = res.data.data.resList;
          this.pagination.rowsNumber = res.data.data.total;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 업로드 버튼
    uploadOpen() {
      this.modalToggle = true;
    },

    // 모달창 닫기
    closeModal() {
      this.editedItem = this.$_.cloneDeep(this.scope);
      this.readonly = false;
      this.modalToggle = false;
    },

    handleFileUpload(event) {
      this.file = event.target.files[0];
    },

    // 엑셀 폼 다운로드
    // 다운로드
    templateMethod() {
      var excelData = XLSX.utils.json_to_sheet(this.excelLogs); // excel data
      var workBook = XLSX.utils.book_new(); // new sheet
      XLSX.utils.book_append_sheet(workBook, excelData, "근무 기록"); // data, sheet name
      XLSX.writeFile(workBook, "근무 기록 템플릿.xlsx"); // excel file
    },

    // 업로드
    async uploadData(evt) {
      if (!this.file) {
        alert("파일을 업로드 해주세요.");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.file);

      try {
        const response = await api.post("excel/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error uploading data:", error);
      }
    },

    // 다운로드
    downloadMethod() {
      const params = {
        sawonNo: this.search.sawonNo,
        sawonNm: this.search.sawonNm,
      };

      api
        .post("/excel/download", params)
        .then((res) => {
          this.list = res.data.data.resList;
          var excelData = XLSX.utils.json_to_sheet(this.list); // excel data
          var workBook = XLSX.utils.book_new(); // new sheet
          XLSX.utils.book_append_sheet(workBook, excelData, "근무 기록"); // data, sheet name
          XLSX.writeFile(workBook, "근무 기록.xlsx"); // excel file
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 페이지 변화에 따른 작용
    changePage() {
      console.log("페이지변화");
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
      return Math.ceil(
        this.pagination.rowsNumber / this.pagination.rowsPerPage
      );
    },

    curPageSet() {
      return this.pagination.page;
    },
  },

  created() {
    this.setTableData();
  },
};
</script>

<style lang="scss" scoped>
.main-title {
  font-size: 50px;
  margin: 0.5%;
}

.delete-text {
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

.search-section {
  display: flex;
}

.search-input {
  width: 20%;
  margin-right: 2%;
}
</style>
