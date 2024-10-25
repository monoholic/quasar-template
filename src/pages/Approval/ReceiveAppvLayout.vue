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
                label="작성자"
                v-model="search.updNm"
                @keyup.enter="setTableData()"
              />
              <q-select
                class="search-input"
                dense
                color="primary"
                label="결재 분류"
                v-model="search.appvType"
                :options="appvTypeSel"
              />
            </q-card-section>

            <!-- 검색, 작성 버튼 -->
            <q-card-actions align="right">
              <q-btn
                color="primary"
                label="결제 작성"
                @click="formOpen('write')"
              ></q-btn>
              <q-btn
                color="primary"
                label="Search"
                @click="setTableData()"
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

  <!-- 결재 작성 모달 form -->
  <div class="fromDiv" v-show="modalToggle">
    <div class="form-card" ref="formCard">
      <q-card v-show="modalToggle" @mousedown="startDrag">
        <div class="form-container" v-show="formToggle">
          <q-card-actions>
            <q-select
              class="form-node"
              v-model="editedItem.appvType"
              :options="appvTypeSel"
              label="결재 분류"
            />
            <q-select
              class="form-node"
              v-model="editedItem.appvUserId"
              :options="appvUserSel"
              label="승인 담당자"
            />
          </q-card-actions>
          <q-card-actions>
            <q-input class="form-node3" v-model="editedItem.appvTtl" label-slot>
              <template v-slot:label>
                <span>제목</span><span class="requiredLabel"> *</span>
              </template>
            </q-input>
          </q-card-actions>
          <q-card-actions>
            <q-input class="form-node3" v-model="editedItem.appvCn" label-slot>
              <template v-slot:label>
                <span>사유</span>
              </template>
            </q-input>
          </q-card-actions>
          <q-separator />

          <q-card-actions align="right">
            <q-btn color="primary" label="CANCEL" @click="closeModal"></q-btn>
            <q-btn color="primary" label="SAVE" @click="saveData"></q-btn>
          </q-card-actions>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { api } from "src/boot/axios";

export default {
  data() {
    return {
      // 화면 메인 타이틀
      mainTitle: "결재상신",

      // 테이블 헤더
      columns: [
        {
          name: "index",
          label: "No.",
          align: "center",
          field: "index",
          style: "width:1%",
        },
        {
          name: "updId",
          align: "center",
          label: "작성자",
          field: "updNm",
          style: "width:5%",
          sortable: true,
        },
        {
          name: "updDate",
          align: "center",
          label: "작성일",
          field: "updDate",
          style: "width:10%",
          sortable: true,
        },
        {
          name: "appvType",
          required: true,
          align: "center",
          label: "분류",
          field: "appvType",
          style: "width:5%",
          sortable: true,
        },
        {
          name: "appvTtl",
          required: true,
          align: "center",
          label: "제목",
          field: "appvTtl",
          style: "width:44%",
          sortable: true,
        },
        {
          name: "appvUserId",
          required: true,
          label: "승인 담당자",
          align: "center",
          field: "appvUserNm",
          style: "width:5%",
          sortable: true,
        },
        {
          name: "appvStus",
          align: "center",
          label: "상태",
          field: "appvStus",
          style: "width:5%",
          sortable: true,
        },
        {
          name: "regId",
          align: "center",
          label: "등록자",
          field: "regNm",
          style: "width:5%",
          sortable: true,
        },
        {
          name: "regDate",
          align: "center",
          label: "등록일",
          field: "regDate",
          style: "width:10%",
          sortable: true,
        },
      ],

      // 테이블 데이터
      rows: [],

      // 모달창 토글
      modalToggle: false,

      // 추가, 수정 모달창 토글
      formToggle: false,

      // 수정
      editedItem: {},
      defaultItem: {},
      readonly: false,

      // 결재 분류
      appvTypeSel: [],
      // 승인 담당자 - user table에서 불러올 것
      appvUserSel: [],
      // 검색쿼리
      search: {
        updNm: null,
        appvType: null,
      },

      // 테이블 내용변경(sort, page)
      pagination: {
        sortBy: null,
        descending: false,
        page: 1,
        rowsPerPage: 20,
        rowsNumber: 0,
      },

      // 모달창 이동
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      modalOffsetX: 0,
      modalOffsetY: 0,
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
        updNm: this.search.updNm,
        appvType: this.search.appvType,
      };

      console.log("params ::: ", params);

      api
        .post("/receiveApproval/list", params)
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
        row.index = index + 1;
        for (const [key, value] of Object.entries(row)) {
          if (`${value}` === "null") {
            row[`${key}`] = "-";
          }
        }
      });
    },

    setTypeData() {
      console.log("결재 분류");
      api
        .post("/receiveApproval/typeList")
        .then((res) => {
          const list = res.data.data;
          // let obj = {};
          for (let i = 0; i < list.length; i++) {
            // if (list[i].appvType == "TYPE1") {
            //   obj = { label: "선결", value: list[i].appvType };
            // }
            // if (list[i].appvType == "TYPE2") {
            //   obj = { label: "대결", value: list[i].appvType };
            // }
            // if (list[i].appvType == "TYPE3") {
            //   obj = { label: "후결", value: list[i].appvType };
            // }
            // if (list[i].appvType == "TYPE4") {
            //   obj = { label: "공람", value: list[i].appvType };
            // }
            // this.appvTypeSel.push(obj);
            this.appvTypeSel.push(list[i].appvType);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    setUserData() {
      console.log("승인 담당자");
      api
        .post("/receiveApproval/userList")
        .then((res) => {
          const list = res.data.data;
          let obj = {};
          for (let i = 0; i < list.length; i++) {
            obj = { label: list[i].userNm, value: list[i].userId };
            this.appvUserSel.push(obj);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 결제 작성 버튼
    formOpen(event) {
      this.modalToggle = true;
      this.formToggle = true;
      console.log("모달오픈");
    },

    // 모달창 닫기
    closeModal() {
      this.editedItem = this.$_.cloneDeep(this.defaultItem);
      this.deleteItem = [];
      this.readonly = false;
      this.modalToggle = false;
      this.formToggle = false;
      this.delteFormToggle = false;
      this.checkDeleteItemToggle = false;
      this.replaceModal();
    },

    // 추가된 데이터 저장
    saveData() {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const editItem = this.editedItem;

      if (editItem.appvType == null || editItem.appvType == "") {
        alert("결재 분류를 선택해주세요.");
        return;
      }
      if (editItem.appvUserId == null || editItem.appvUserId == "") {
        alert("승인 담당자를 선택해주세요.");
        return;
      }
      if (editItem.appvTtl == null || editItem.appvTtl == "") {
        alert("제목을 작성해주세요.");
        return;
      }
      const params = {
        appvUserId: editItem.appvUserId.value,
        appvType: editItem.appvType,
        appvTtl: editItem.appvTtl,
        appvCn: editItem.appvCn,
        appvStus: "미승인",
        appvStep: "보류",
        delYn: "N",
        updId: userInfo.userId,
        regId: userInfo.userId,
      };

      console.log("params ::: ", params);

      // 서버통신
      api
        .post("/receiveApproval/addApproval", params)
        .then(() => {
          alert("결재가 등록되었습니다.");
          this.setTableData();
          this.closeModal();
        })
        .catch((err) => {
          console.log(err);
        });

      // 수신자 메일 조회
      api
        .post("/receiveApproval/mailAddress", params)
        .then((res) => {
          const data = res.data.data;
          for (let i = 0; i < data.length; i++) {
            params.email = data[i].email;
          }
          console.log("mail ===> " + params.email);
          //this.sendMail(params);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 메일 발송
    sendMail(params) {
      const data = {
        address: params.email,
        title: params.appvTtl,
        content: "안녕하세요.\n" + params.appvTtl + "건 승인 부탁드립니다.\n\n",
      };
      console.log(
        "data === >" + data.address + "/" + data.title + "/" + data.content
      );

      api
        .post("/receiveApproval/sendMail", data)
        .then(() => {
          console.log("메일 발송 성공");
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
    replaceModal() {
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.modalOffsetX = 0;
      this.modalOffsetY = 0;
      const formCard = this.$refs.formCard;
      formCard.style.transform = `translate(0px, 0px)`;
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
    this.setTableData();
    this.setTypeData();
    this.setUserData();
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
  font-size: 1em;
}

.form-node {
  width: 45%;
  margin-right: 2%;
}

.form-node2 {
  width: 20%;
  font-size: 1em;
}

.form-node3 {
  width: 100%;
}
</style>
