import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: import_vue("Home"),
    },
  ],
});

const import_vue = (path) =>(() => import("./views/" + path));

