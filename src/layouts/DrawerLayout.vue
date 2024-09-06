<template>
  <q-scroll-area class="fit">
    <q-list>
      <q-item-label header> Menu Bar </q-item-label>
      <div v-for="menu in menuList" :key="menu.menuId">
        <q-expansion-item expand-separator icon="mail" :label="menu.menuNm">

          <div v-for="subMenu in subMenuList" :key="subMenu.menuId">
            <q-expansion-item
              :header-inset-level="1"
              icon="receipt"
              :label="subMenu.menuNm"
              v-if="menu.menuId === subMenu.uppMenuId"
            >
              <q-item clickable :label="subMenu.menuNm">
                  <q-item-section avatar>
                    <q-icon :name="subMenu.menuIcon" />
                  </q-item-section>
                <q-item-section> {{subMenu.menuDesc}} </q-item-section>
              </q-item>
            </q-expansion-item>

          </div>
        </q-expansion-item>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
  components: {},
  data() {
    return {

      menuList: [],
      subMenuList: [],

      isLoading: false,
      fullPage: true,
    };
  },

  created () {
    this.getMenuList();
  },

  methods: {
    pageMove(route) {
      this.$router.push(route);
    },
    getMenuList() {

      this.$api
        .get("/menu/menuList")
        .then((res) => {
          if (res.data.code === 200) {

            console.log('====> res : ', JSON.stringify(res.data.data));

            this.menuAppend(res.data.data);
            // this.menuList = res.data.data;

          } else {
            console.log("err =====> ", res.data.code)
          }
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(" error ==>", error);
          this.isLoading = false;
        })
        .finally(() => {
          console.log("항상 마지막에 실행");
        });

        console.log('======> ',localStorage.getItem('token'));

        localStorage.removeItem('token');

    },

    menuAppend(menuList){

      this.menuList = menuList.filter(menu => menu.menuLvl === '1');
      this.subMenuList = menuList.filter(menu => menu.menuLvl !== '1');

      // let subMenuList = [];

      // for(var i =0; i<menuList.length; i++){

      //   if(menuList[i].menuLvl === '1'){
      //     console.log('menuList ===> ', JSON.stringify(menuList[i]));
      //     this.menuList.push(menuList[i]);
      //   }

      //   for(var j = 0;j<menuList.length; j++){
      //     if(menuList[j].menuLvl === '2' && menuList[j].uppMenuId === menuList[i].menuId){
      //       console.log('=> ', JSON.stringify(menuList[j]));
      //       subMenuList.push(menuList[j]);
      //       console.log(' subMenuList ==> ', JSON.stringify(subMenuList));
      //     }

      //     this.menuList.fill(subMenuList);
      //   }
      // }

      console.log('final =====> ', JSON.stringify(this.menuList));

    }
  },
});
</script>
