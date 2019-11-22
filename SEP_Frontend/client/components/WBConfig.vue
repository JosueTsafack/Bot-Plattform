<template>
  <div>
    <div id="grau">
      <div id="editdiv">
        <v-text-field :placeholder="lang.botRespPlaceH" append-icon="done" class="input-group--focused" v-model="bot"
          :append-icon-cb="editNode" id="editNode" @keyup.enter="editNode"></v-text-field>
      </div>
      <div id="suggWrapper">
        <div v-for="entry in suggestions" :key="entry" id="suggestions" @click="choose(entry)" >
          <span @click="choose(entry)">"{{entry}}"</span>
        </div>
      </div>
    </div>
    <v-btn flat color="primary" @click.native="cancel" id="cancel">{{ lang.backBtn }}</v-btn>
    <v-btn color="primary" dark @click.native="saveConf" id="save">
      {{ lang.saveConfBtn }}
    </v-btn>
  </div>
</template>


<script>
import Arboreal from "../helpers/Arboreal.js";
export default {
  data: function() {
    return {
      id: ""
    };
  },
  methods: {
    cancel() {
      this.$router.push("/overview");
    },
    choose(entry) {
      this.bot = entry;
    },
    saveConf() {
      if (this.currName === "") {
        this.$store.commit("error", "Name cannot be empty");
        return;
      }
      var tree = this.parse();
      this.$store.commit("setNewConfig", tree);
      this.$store.dispatch("saveConfig");
    },
    getNodes() {
      return this.$store.getters.getBot;
    },
    parse() {
      var conf = this.getNodes().config;
      var tree = null;
      if (conf) {
        if ("depth" in conf) {
          tree = conf;
        } else {
          tree = Arboreal.parse(this.getNodes().config, "children");
        }
        return tree;
      }
    },
    saveConf() {
      if (this.currName === "") {
        this.$store.commit("error", "Name cannot be empty");
        return;
      }
      this.$store.dispatch("saveConfig");
    },

    editNode() {
      var tree = this.parse();
      if (tree.find(this.currId)) {
        tree.find(this.currId).data.bot = this.bot;
        this.$store.commit("setNewConfig", tree);
      }
    }
  },
  computed: {
    lang() {
      return this.$store.getters.getLang;
    },
    currName() {
      return this.$store.getters.getCurrName;
    },
    suggestions() {
      var responses = [];
      this.parse()
        .toArray()
        .forEach(node => {
          if (node.data.bot) {
            if (!responses.includes(node.data.bot)) {
              responses.push(node.data.bot);
            }
          }
        });
      return responses;
    },
    loading() {
      return this.$store.getters.loading;
    },
    bot: {
      get() {
        return this.$store.getters.getBotInput;
      },
      set(val) {
        this.$store.commit("bot", val);
      }
    },
    currId: {
      get() {
        return this.$store.getters.getCurrNodeId;
      },
      set(id) {
        this.$store.commit("setNodeId", id);
      }
    },
    currName: {
      get() {
        return this.$store.getters.getCurrName;
      },
      set(val) {
        this.$store.commit("currentName", val);
      }
    }
  }
};
</script>

<style scoped>
#save {
  margin-left: 163px;
  margin-right: 0px;
}

#grau {
  background-color: #e4e4e4;
  width: 350px;
  word-break: break-all;
  padding: 10px;
  border-radius: 3px;
  margin-left: 25px;
}

#suggWrapper {
  margin-top: 5px;
  height: 250px;
  overflow: auto;
  width: 335px;
}

#editdiv {
  height: 40px;
  border-radius: 12px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 5px;
  padding-bottom: 5px;
  background: white !important;
}

#editdiv > div {
  padding-top: 0px;
}

input {
  max-height: 50px;
  max-width: 100%;
}

#suggestions {
  border-bottom: solid 2px #e0e0e0;
  margin-top: 5px;
  margin-left: 15px;
  margin-right: 30px;
}

#suggestions > span {
  font-size: 12pt;
  font-style: italic;
}

.input-group {
  display: block;
}

#botSelectType,
#botSelectDescription {
  border: 1px solid black;
}
</style>
