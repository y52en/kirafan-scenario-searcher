<template lang="pug">
span
  v-app
    v-app-bar(app, color="#00695C", dark, height="40px")
      .d-flex.align-center
        v-img.shrink.mr-2(
          :src="require('./assets/favicon.png')",
          width="37",
          contain,
          transition="scale-transition"
        )

      //-   <v-img
      //-     alt="Vuetify Name"
      //-     class="shrink mt-1 hidden-sm-and-down"
      //-     contain
      //-     min-width="100"
      //-     src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
      //-     width="100"
      //-   />
      span シナリオ検索ツール

      v-spacer

      //- v-btn(icon)
      //-   v-icon mdi-open-in-new

    v-main
      router-view(
        v-if="load_status === 'loaded'",
        :scenarioGroupList="scenarioGroupList",
        :scenarioList_obj="scenarioList_obj",
        :storageKey_list="storageKey_list"
      )

      .text-center(v-else-if="load_status === 'loading'")
        v-progress-circular.ma-3(indeterminate, color="primary") 
        p 読み込み中…

      .text-center(v-else-if="load_status === 'downloading'")
        v-progress-circular.ma-3(
          rotate="-90",
          color="primary",
          :value="progressCircular"
        ) 
        p {{ progressStr }}
</template>

<script>
import axios from "axios";
import localforage from "localforage";

export default {
  name: "App",

  components: {
    // HelloWorld,
  },

  data: () => ({
    load_status: "loading", // loading,downloading,loaded

    downloadStatus: {
      downloaded: 0,
      max: 0,
    },
    scenarioList: [],
    scenarioList_obj: {},
    scenarioGroupList: [],
    storageKey_list: [],

    categories: Object.freeze({
      1: { name: "story", path: "Story" },
      2: { name: "event", path: "Event" },
      3: { name: "chara", path: "CharaEvent" },
      4: { name: "chara", path: "CrossEvent" },
      5: { name: "weapon", path: "WeaponEvent" },
      6: { name: "other", path: "Other" },
      7: { name: "writer", path: "Writer" },
    }),
  }),

  computed: {
    progressCircular() {
      const dl_status = this.downloadStatus;
      return (dl_status.downloaded / dl_status.max) * 100;
    },
    progressStr() {
      const dl_status = this.downloadStatus;
      return `${dl_status.downloaded} / ${dl_status.max}`;
    },
  },

  methods: {
    async dl_and_setScenario(scenarioId, url) {
      try {
        const scenario = (await axios.get(url)).data.map((x) => {
          delete x.m_id;
          delete x.m_voiceLabel;
          x.m_text = x.m_text.replaceAll(/<([^>]*?)>|<\/[^>]*?>|\s/g, "");
          return x;
        });
        await localforage.setItem(String(scenarioId), scenario);
      } catch (e) {
        await setTimeout(this.dl_and_setScenario(scenarioId, url), 100);
      }
    },
  },

  async mounted() {
    localforage.config({
      name: "scenario",
    });
    localforage.setItem("version", 1);

    await Promise.all([
      (async () => {
        this.scenarioList = Object.freeze(
          (
            await axios.get("https://database.kirafan.cn/database/ADVList.json")
          ).data
            .filter((x) => x.m_Category !== 5)
            .map((x) => {
              x.m_Title = x.m_Title.replaceAll(/\n/g, " ");
              return x;
            })
        );
      })(),
      (async () => {
        const output = {};
        (
          await axios.get(
            "https://database.kirafan.cn/database/ADVLibraryList.json"
          )
        ).data.forEach((x) => {
          x.m_ListName = x.m_ListName.replaceAll(/\n/g, " ");
          output[x.m_LibraryListID] = x;
        });
        this.scenarioGroupList = Object.freeze(output);
      })(),
    ]);

    this.storageKey_list = await localforage.keys();

    this.downloadStatus.max = this.scenarioList.length;
    this.load_status = "downloading";

    const getScenario_prom = this.scenarioList.map(async (scenario) => {
      const scenarioId = scenario.m_AdvID;
      if (this.storageKey_list.indexOf(String(scenarioId)) === -1) {
        const category_id = scenario.m_Category;
        if (scenario.m_ScriptTextName) {
          const url =
            // "https://database-asset.kirafan.cn/advscript/" +
            "https://advscript-asset.kirafan.cn/" +
            this.categories[category_id].name +
            "/ADVScriptText_" +
            this.categories[category_id].path +
            "_" +
            scenario.m_ScriptTextName +
            ".json";
          await this.dl_and_setScenario(scenarioId, url);
        }
      }
      this.downloadStatus.downloaded++;
    });
    await Promise.all(getScenario_prom);
    this.scenarioList.forEach((x) => {
      this.scenarioList_obj[x.m_AdvID] = x;
    });
    this.storageKey_list = await localforage.keys();
    this.load_status = "loaded";
  },
};
</script>
