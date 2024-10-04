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
        wrap-cells
      >
        <!-- 탑 버튼 -->
        <template v-slot:top>
          <q-card style="width: 100%">
            <!-- 검색 영역 -->
            <q-card-section class="search-section" align="left">
              <q-input
                class="search-input"
                dense
                color="primary"
                label="사용자ID 검색"
                v-model="search.userId"
                @keyup:enter="setTableData()"
              />

              <!-- 시작일 -->
              <q-input
                class="search-date"
                readonly
                dense
                v-model="search.dateFrom"
                mask="date"
                :rules="['date']"
                label="시작일"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="search.dateFrom"
                        :options="dateFromRange"
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <!-- 종료일 -->
              <q-input
                class="search-date"
                readonly
                dense
                v-model="search.dateTo"
                mask="date"
                :rules="['date']"
                label="종료일"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="search.dateTo" :options="dateToRange">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-card-section>

            <!-- 검색 버튼 -->
            <q-card-actions align="right">
              <q-btn
                color="primary"
                label="Search"
                @click="setTableData()"
              ></q-btn>
              <q-space />
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
</template>

<script>
import { api } from "src/boot/axios";

export default {
  data() {
    return {
      // 화면 메인 타이틀
      mainTitle: "로그 관리",

      // 테이블 헤더
      columns: [
        {
          name: "index",
          label: "#",
          field: "index",
          headerStyle: "width:2%",
        },
        {
          name: "menuId",
          required: true,
          label: "메뉴아이디",
          align: "center",
          field: "menuId",
          sortable: true,
          headerStyle: "width:10%",
        },
        {
          name: "gubun",
          align: "center",
          label: "구분",
          field: "gubun",
          sortable: true,
          headerStyle: "width:8%",
        },
        {
          name: "gubunDet",
          align: "center",
          label: "상세구분",
          field: "gubunDet",
          sortable: true,
          headerStyle: "width:10%",
        },
        {
          name: "sqlTxt",
          align: "center",
          label: "SQL",
          field: "sqlTxt",
          sortable: true,
          headerStyle: "width:25%",
        },
        {
          name: "params",
          align: "center",
          label: "파라미터",
          field: "params",
          sortable: true,
          headerStyle: "width:20%",
        },
        {
          name: "userId",
          align: "center",
          label: "접근사용자",
          field: "userId",
          sortable: true,
          headerStyle: "width:10%",
        },
        {
          name: "accessTime",
          align: "center",
          label: "접근시간",
          field: "accessTime",
          sortable: true,
          headerStyle: "width:15%",
        },
      ],

      // 테이블 데이터
      rows: [],

      // 검색쿼리
      search: {
        userId: null,
        dateFrom: null,
        dateTo: null,
      },

      // 테이블 내용변경(sort, page)
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0,
      },

      today: null,
    };
  },

  methods: {
    // 테이블 초기 데이터 세팅
    setTableData() {
      // 종료일 +1 작업
      let date = new Date(this.search.dateTo);
      let date2 = new Date(date.setDate(date.getDate() + 1));

      const year = date2.getFullYear();
      let month = date2.getMonth() + 1;
      let day = date2.getDate();

      if (month < 10) month = "0" + month;
      if (day < 10) day = "0" + day;

      const dateTo = year + "/" + month + "/" + day;

      const params = {
        sortBy: this.pagination.sortBy,
        descending: this.pagination.descending === true ? "dc" : "ac",
        page: this.pagination.page,
        numOfRows: this.pagination.rowsPerPage,
        userId: this.search.userId,
        dateFrom: this.search.dateFrom,
        dateTo: dateTo,
      };

      api
        .post("/logManage/getLogList", params)
        .then((res) => {
          this.rows = res.data.data.resList;
          console.log(res.data.data.resList);
          this.pagination.rowsNumber = res.data.data.total;
          this.rowsSet();
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.rowsSet();
        });
    },

    // 데이터에 값 추가
    rowsSet() {
      this.rows.forEach((row, index) => {
        row.index = index + 1;
        for (const [key, value] of Object.entries(row)) {
          if (`${value}` === "null") {
            row[`${key}`] = "-";
          }
        }
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

    // 오늘 날짜 세팅
    todaySet() {
      const date = new Date();
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (month < 10) month = "0" + month;
      if (day < 10) day = "0" + day;

      this.today = year + "/" + month + "/" + day;

      this.search.dateFrom = this.search.dateTo = this.today;
    },

    // 시작일 제한
    dateFromRange(date) {
      return date <= this.search.dateTo;
    },

    // 종료일 제한
    dateToRange(date) {
      return date >= this.search.dateFrom && date <= this.today;
    },
  },

  computed: {
    // 페이지 길이
    pageLength() {
      return Math.ceil(
        this.pagination.rowsNumber / this.pagination.rowsPerPage
      );
    },

    // 현재 페이지
    curPageSet() {
      return this.pagination.page;
    },
  },

  created() {
    this.todaySet();
    this.setTableData();
  },
};
</script>

<style lang="scss" scoped>
.main-title {
  font-size: 50px;
  margin: 0.5%;
}

.search-section {
  display: flex;
}

.search-input {
  width: 20%;
}

.search-date {
  margin-left: 2%;
  width: 10%;
}
</style>
