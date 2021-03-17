<template lang="pug">
span
  v-app
    v-app-bar(app, color="primary", dark)
      .d-flex.align-center
      //-   <v-img
      //-     alt="Vuetify Logo"
      //-     class="shrink mr-2"
      //-     contain
      //-     src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
      //-     transition="scale-transition"
      //-     width="40"
      //-   />

      //-   <v-img
      //-     alt="Vuetify Name"
      //-     class="shrink mt-1 hidden-sm-and-down"
      //-     contain
      //-     min-width="100"
      //-     src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
      //-     width="100"
      //-   />

      v-spacer

      v-btn(icon)
        v-icon mdi-open-in-new

  v-main
    router-view
</template>

<script>
// import HelloWorld from "./components/HelloWorld";

export default {
  name: "App",

  components: {
    // HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>
