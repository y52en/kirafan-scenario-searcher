<template lang="pug">
span
  v-row.mx-n1
    v-col(cols="6")
      v-text-field(label="テキスト", v-model="str")
    v-col.mx-n3(cols="4")
      v-text-field(label="キャラ名", v-model="name")
    v-col(cols="1")
      v-btn.ml-0.mt-3(
        v-if="searching",
        dark,
        color="black",
        width="1",
        @click="killWorker"
      ) 
        v-icon(color="white") mdi-close
      v-btn.ml-0.mt-3(v-else, dark, color="black", width="1", @click="search") 
        v-icon(color="white") mdi-magnify

  v-row.ml-3.mt-n10.mb-0(v-if="!searching")
    v-checkbox(v-model="delay_showList", label="検索が終わってから検索結果を表示する") 

  v-row.ml-3.mb-4.mt-n4
    v-col(cols="6") 検索完了数: {{ searchingIndex }} / {{ storageKey_list.length - 1 }}
    v-col(cols="6") {{ foundList.length }} 件見つかりました

  v-row
    v-card.mx-auto(width="90vw", tile)
      v-list 
        v-list-item-group(v-if="delay_showList && searching")
        v-list-item-group(v-else)
          v-list-item(
            v-for="item in foundList",
            :href="'https://wiki.kirafan.moe/#/scenario/' + item.key",
            target="_blank",
            :key="item.key"
          )
            v-list-item-content 
              v-list-item-title(v-text="item.title")
              v-list-item-subtitle(
                v-text="item.value.m_charaName + ' : ' + item.value.m_text"
              )
</template>

<script>
export default {
  name: "Home",

  props: ["scenarioGroupList", "scenarioList_obj", "storageKey_list"],

  data: () => ({
    worker: undefined,
    searching: false,

    searchingIndex: 0,
    foundList: [],

    delay_showList: false,

    str: "",
    name: "",

    // progressStr:0,
  }),

  methods: {
    workerInit() {
      return new Promise((resolve) => {
        this.worker = new Worker("./worker.js");
        this.worker.addEventListener(
          "message",
          async (e) => {
            const { type, value } = e.data;
            switch (type) {
              case "inited":
                resolve();
                break;
              case "next":
                this.searchingIndex++;
                break;
              case "found":
                var base_scenarioData = this.scenarioList_obj[value.key];
                value.title =
                  (this.scenarioGroupList[base_scenarioData.m_LibraryID]
                    ?.m_ListName ?? "") +
                  " 「" +
                  base_scenarioData.m_Title +
                  "」";
                this.foundList.push(value);
                break;
              case "fin":
                this.searching = false;
                break;
              default:
                throw Error("not found");
            }
          },
          false
        );
        this.worker.postMessage(this.message("init", {}));
      });
    },
    message(type, value) {
      return { type, value };
    },

    async search() {
      if (this.name || this.str) {
        this.searching = true;
        this.searchingIndex = 0;
        this.foundList = [];
        if (!this.worker) {
          await this.workerInit();
        }
        this.worker.postMessage(
          this.message("search", {
            name: this.name,
            str: this.str,
          })
        );
      }
    },
    killWorker() {
      this.worker.terminate();
      this.worker = undefined;
      this.searching = false;
    },
  },

  async mounted() {
    await this.workerInit();
  },
};
</script>