const routes = [
  {
    name: "",
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },
  {
    name: "list",
    path: "/list",
    component: () => import("layouts/ListLayout.vue"),
  },
  {
    name: "/approval",
    path: "/approval",
    component: () => import("layouts/ApprovalLayout.vue"),
  },
  {
    name: "/receiveApproval",
    path: "/receiveApproval",
    component: () => import("layouts/ReceiveApprLayout.vue"),
  },
  {
    name: "/commonCode",
    path: "/commoncode",
    component: () => import("/src/pages/ComCodeMng/ComCodeMng.vue"),
  },
  {
    name: "/roleManage",
    path: "/roleManage",
    component: () => import("/src/pages/Role/RoleMng.vue"),
  },
  {
    name: "/userMng",
    path: "/userMng",
    component: () => import("/src/pages/Users/UserMng.vue"),
  },
  {
    name: "/menuManage",
    path: "/menuManage",
    component: () => import("layouts/MenuManageLayout.vue"),
  },
  {
    name: "/logManage",
    path: "/logManage",
    component: () => import("/src/pages/LogAPI/LogAPi.vue"),
  },
  {
    name: "/excel",
    path: "/excel",
    component: () => import("/src/pages/Excel/ExcelTemplate.vue"),
  },
  {
    name: "/menuChange",
    path: "/menuChange",
    component: () => import("/src/pages/MenuChange/MenuChange.vue"),
  },
  {
    name: "/menuRole",
    path: "/menuRole",
    component: () => import("/src/pages/MenuChange/MenuRole.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
  {
    path: "/login",
    component: () => import("layouts/LoginLayout.vue"),
  },
  {
    path: "/home",
    component: () => import("pages/MainPage.vue"),
  },
];

export default routes;
