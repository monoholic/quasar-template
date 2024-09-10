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
    component: () => import("layouts/CommonCodeLayout.vue"),
  },
  {
    name: "/roleManage",
    path: "/roleManage",
    component: () => import("layouts/RoleManageLayout.vue"),
  },
  {
    name: "/menuManage",
    path: "/menuManage",
    component: () => import("layouts/MenuManageLayout.vue"),
  },
  {
    name: "/logManage",
    path: "/logManage",
    component: () => import("layouts/LogManageLayout.vue"),
  },
  {
    name: "/userChange",
    path: "/userChange",
    component: () => import("layouts/UserChangeLayout.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
  {
    path: "/login",
    component: () => import("layouts/LoginLayout.vue"),
  },
];

export default routes;
