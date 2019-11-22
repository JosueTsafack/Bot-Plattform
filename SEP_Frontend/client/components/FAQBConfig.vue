<template>
  <div id="wraper">
    <div id="intentsList" class="col-xs-4">
      <ul id="intentList">
        <li v-for="(intent, id) in intents" :key="id" @click="fillConfig(id)">
          {{ intent.intent }}
        </li>
      </ul>
      <v-btn id="addIntent" round color="primary" @click="addIntent">
        <v-icon>add</v-icon>
      </v-btn>
    </div>

    <div id="intentsConfig" class="col-xs-8">
      <input class="botConfig" :placeholder="lang.IntPlaceH" v-model="intent" id="intentInput" @keyup.enter="editNode">
      <br>
      <textarea class="botConfig" :placeholder="lang.BotPlaceH" v-model="botAnswer" id="answerInput" @keyup.enter="editNode" @keyup="textAreaAdjust()"></textarea>
      <br>
      <v-btn color="primary" dark :loading="loading" @click.native="saveIntent" :disabled="loading" id="save">
        {{ lang.SaveAnsBtn }}
      </v-btn>
      <v-btn color="primary" dark :loading="loading" @click.native="saveConf" :disabled="loading" id="save">
        {{ lang.SaveConfBtn }}
      </v-btn>
    </div>
  </div>
</template>


<script>
export default {
  data: function() {
    return {
      intent: "",
      botAnswer: "",
      selectedID: "",
      currBot: "",
      intents: []
    };
  },
  methods: {
    textAreaAdjust() {
      var area = document.getElementById("answerInput");
      area.style.height = "1px";
      area.style.height = 25 + area.scrollHeight + "px";
    },

    addIntent() {
      var addedIntent = {
        intent: "",
        answer: ""
      };
      this.intents.push(addedIntent);
    },

    fillConfig(id) {
      this.intent = this.intents[id].intent;
      this.botAnswer = this.intents[id].answer;
      this.selectedID = id;
    },

    saveIntent(id) {
      this.intents[this.selectedID].intent = this.intent;
      this.intents[this.selectedID].answer = this.botAnswer;
    },

    saveConf() {
      if (this.currName === "") {
        this.$store.commit("error", "Name cannot be empty");
        return;
      }
      this.$store.commit("setNewConfig", this.intents);
      this.$store.dispatch("saveConfig");
      // .then(response => {
      //     this.$store.dispatch("buildBot", this.getNodes().id);
      // });
    },

    botConfig() {
      this.currBot = this.$store.getters.getBot;
      if (this.currBot.config) {
        this.intents = JSON.parse(this.currBot.config);
      }
    }
  },

  beforeMount() {
    this.botConfig();
  },
  computed: {
    lang() {
      return this.$store.getters.getLang;
    },
    currName: {
      get() {
        return this.$store.getters.getCurrName;
      },
      set(val) {
        this.$store.commit("currentName", val);
      }
    },

    loading() {
      return this.$store.getters.loading;
    },
    currName: {
      get() {
        return this.$store.getters.getCurrName;
      },
      set(val) {
        this.$store.commit("currentName", val);
      }
    },
    user: {
      get() {
        return this.$store.getters.getUserInput;
      },
      set(val) {
        this.$store.commit("user", val);
      }
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
      }
    }
  }
};
</script>

<style scoped>
#addIntent {
  min-width: 36px;
  min-height: 36px;
  width: 36px;
  height: 36px;
  position: relative;
  left: Calc(100% - 36px);
}

#intentsList,
#intentsConfig {
  background-color: #ededed;
  border-radius: 40px;
  border: 20px #fafafa solid;
  min-height: 500px;
  overflow: auto;
  display: block;
}

#intentList {
  text-decoration: underline;
  position: relative;
  left: 20px;
}

#intentList > li:hover {
  color: #f68b1f;
  text-decoration: underline;
  text-decoration-color: #f68b1f;
}

#wraper {
  min-width: 100%;
  max-width: 100%;
  position: absolute;
  top: 200px;
}

input {
  max-height: 50px;
  max-width: 100%;
}
input:focus,
textarea:focus {
  outline: 0;
}

#intentInput,
#answerInput {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  margin-top: 15px;
  text-indent: 10px;
  word-break: break-all;
}

textarea {
  resize: none;
}

.input-group {
  display: block;
}

#botSelectType,
#botSelectDescription {
  border: 1px solid black;
}
</style>
