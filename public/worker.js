"use strict";
(() => {
  importScripts("./localforage.min.js");

  const message = (type, value) => {
    return { type, value };
  };

  localforage.config({
    name: "scenario",
  });

  self.addEventListener(
    "message",
    async function(e) {
      const { type, value } = e.data;
      switch (type) {
        case "init":
          self.postMessage(message("inited", value));
          break;
        case "search":
          main(value.name, value.str);
          break;
        default:
          throw Error("not found");
      }
    },
    false
  );

  async function main(name, str) {
    await localforage.iterate(function(value, key) {
      if (key !== "version") {
        for (let i = 0; i < value.length; i++) {
          const val = value[i];
          let name_index = 0;
          let str_index = 0;
          if (name) name_index = val.m_charaName.indexOf(name);
          if (str) str_index = val.m_text.indexOf(str);
          if (name_index !== -1 && str_index !== -1) {
            self.postMessage(
              message("found", {value: val, key: key })
            );
            break;
          }
        }
        self.postMessage(message("next", undefined));
      }
    });
    self.postMessage(message("fin", undefined));
  }
})();
