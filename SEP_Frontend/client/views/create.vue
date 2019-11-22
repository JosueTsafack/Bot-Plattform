<template>
  <div class="create-view" height="100vh">
    <v-stepper v-model="e1">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="e1 > 1">{{ lang.spinner1 }}</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2">{{ lang.spinner2 }}</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <div class="creation">
            <div class="col-xs-6" id="creator">
              <div>
                <div class="col-xs-6">
                  <div id="Welcome_Bot" @click="select('Welcome_Bot')"></div>
                  <div id="WBCard">
                    <div class="col-xs-5" id="picture">
                      <img src="/static/Welcome_Bot.png">
                    </div>
                    <div class="col-xs-7" id="description">
                      <h5>{{ lang.wb }}</h5>
                      {{ lang.wbDesc }}
                    </div>
                  </div>
                </div>
                <div class="col-xs-6">
                  <div id="Welcome_Bot_Intent" @click="select('Welcome_Bot_Intent')"></div>
                  <div id="notImp">{{ lang.notImp }}</div>

                  <div id="WBICard">
                    <div class="col-xs-5" id="picture">
                      <img src="/static/Welcome_Bot_Intent.png">
                    </div>
                    <div class="col-xs-7" id="description">
                      <h5>{{ lang.wbi }}</h5>
                     {{ lang.wbiDesc }}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="col-xs-6">
                  <div id="FAQ_Bot"  @click="select('FAQ_Bot')"></div>
                  <div id="FAQBCard">
                    <div class="col-xs-5" id="picture">
                      <img src="/static/FAQ_Bot.png">
                    </div>
                    <div class="col-xs-7" id="description">
                      <h5>{{ lang.faq }}</h5>
                     {{ lang.faqDesc }}
                    </div>
                  </div>
                </div>
                <div class="col-xs-6">
                  <div id="Task_Bot"  @click="select('Task_Bot')"></div>
                  <div id="notImp">{{ lang.notImp }}</div>
                  <div id="TBCard">
                    <div class="col-xs-5" id="picture">
                      <img src="/static/Task_Bot.png">
                    </div>
                    <div class="col-xs-7" id="description">
                      <h5>{{ lang.task }}</h5>
                      {{ lang.taskDesc }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <v-btn flat color="secondary" @click.native="cancel" id="cancerCreate">{{lang.cancelBtn}}</v-btn>
          <v-btn color="primary" @click.native="chooseType" id="createNext">{{lang.nextBtn}}</v-btn>
        </v-stepper-content>
        <v-stepper-content step="2">
          <div id="configDetails">
            <div id="configDetailsPicture" class="col-xs-4">
              <img v-if="currType" :src="'/static/' + currType + '.png'" :alt="currType">
              <div id="typeField">
                {{currType.replace(/_/g, " ")}}
              </div>
            </div>
            <div id="configDetailsValues" class="col-xs-8">
              <div id="details">
                <div id="nameField">
                  Name:
                  <input id="name" v-model="currName"></input>
                </div>
                <v-select label="Tag your Bot" chips tags solo append-icon="" clearable v-model="currChips">
                  <template slot="selection" slot-scope="data">
                    <v-chip close @input="remove(data.item)" :selected="data.selected">
                      <a>{{ data.item }}</a>
                    </v-chip>
                  </template>
                </v-select>
              </div>
              <div v-if="saveBoolean">
                <div id="blur"></div>
                <v-card id="saveCard">
                  <div>{{ lang.forwarding }}</div>
                  <v-btn color="primary" @click="returnToOverview" id="toOverview">{{ lang.overview }}</v-btn>
                  <v-btn color="secondary" @click="toConfig" id="toConfig">{{ lang.config }}</v-btn>
                </v-card>
              </div>
            </div>
          </div>
          <v-btn flat @click.native="e1 = 1" id="cancerFinal">{{ lang.backBtn }}</v-btn>
          <v-btn color="primary" id="saveFinal" @click.native="newBot">{{ lang.saveBtn }}</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
import config from "./config.vue";

export default {
  components: {
    config
  },
  data: function() {
    return {
      currConf: "",
      e1: 0,
      type: "",
      saveBoolean: false,
      botID: 0
    };
  },
  methods: {
    chooseType() {
      if (this.type !== "") {
        this.$store.commit("currentType", this.type);
        console.log(this.currType);
        this.e1 = 2;
        this.$store.commit("setChips", [
          this.currType,
          this.$store.getters.loggedInName
        ]);
      } else {
        console.log("Please select a type");
      }
    },
    select(name) {
      if (this.type === name) {
        this.chooseType();
      }
      while (document.querySelector("div.active")) {
        document.querySelector("div.active").classList.value = "none";
      }
      document.querySelector("#" + name).classList.value = "active";
      this.type = name;
    },
    toConfig() {
      this.$store.dispatch("getAllBotStatus").then(
        response => {
          this.$router.push({ path: "/config/" + this.botID });
          this.saveBoolean = false;
          console.log("finished");
        },
        error => {
          console.log("kaputt");
        }
      );
    },

    remove(item) {
      this.currChips.splice(this.currChips.indexOf(item), 1);
      this.currChips = [...this.currChips];
    },

    returnToOverview() {
      this.$router.push({ path: "/overview" });
    },

    newBot() {
      if (!this.currName) {
        this.$store.commit("error", "Name cannot be empty!");
        return;
      }
      if (!this.currType) {
        this.$store.commit("error", "Type cannot be empty!");
        return;
      }
      this.$store.dispatch("postNewBot").then(
        response => {
          this.botID = response.data.BotId;
          this.$store.commit("editBot", response.data.BotId);
        },
        error => {
          console.error("vom promise: ", error);
        }
      );
      this.saveBoolean = true;
    },
    getCurrConf() {
      var decycle = require("json-decycle").decycle;
      var conf = this.$store.getters.getCurrConf;
      var dc = JSON.parse(JSON.stringify(conf, decycle()));
      var f = function(n) {
        n.user = n.data.user;
        n.bot = n.data.bot;
        delete n.parent;
        delete n.depth;
        delete n.id;
        delete n.data;
        for (var j = 0; j < n.children.length; j++) {
          f(n.children[j]);
        }
      };
      f(dc);
      this.currConf = dc;
    },

    fieldEmpty() {
      if (!this.currName || !this.currType) {
        this.$store.commit("error", "One of the field was empty");
        return;
      }
      this.e1++;
    },

    cancel() {
      this.$router.push({
        path: "/overview"
      });
    },

    saveConfig() {
      //POST request
      this.$router.push({
        path: "/overview"
      });
    },

    /**
       * Clears Error/Success Messages at top of the screen
       */
    clear() {
      this.$store.commit("clearError");
      this.$store.commit("clearSuccess");
    }
  },
  beforeMount() {
    if (!this.loggedIn) {
      this.$router.push({
        path: "/login"
      });
    }
    this.$store.commit("currentName", "");
    this.$store.commit("currentType", "");

    this.clear();
  },
  computed: {
    lang() {
      return this.$store.getters.getLang;
    },
    loggedIn() {
      return this.$store.getters.loggedInState;
    },
    botTypes() {
      return this.$store.getters.botTypes;
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
    currType: {
      get() {
        return this.$store.getters.getCurrType;
      },
      set(val) {
        this.$store.commit("currentType", val);
      }
    },
    currChips: {
      get() {
        return this.$store.getters.getCurrChips;
      },
      set(val) {
        this.$store.commit("setChips", val);
      }
    }
  }
};
</script>


<style scoped>
#saveCard {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  text-align: center;
  min-width: 240px;
  min-height: 120px;
  width: 240px;
  height: 120px;
  position: fixed;
  left: calc(50% - 120px);
  top: 300px;
  z-index: 50;
}

#blur {
  background-color: rgba(35, 35, 35, 0.2);
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100%;
  z-index: 49;
}

#configDetails {
  height: 250px;
  background-color: #d3d3d3;
}

#configDetailsPicture {
  padding: 0px;
  height: 100%;
  padding: 10px;
}

#configDetailsPicture > img {
  height: 87%;
  padding-left: calc(50% - 100px);
}

#details {
  padding: 15px;
}

#nameField {
  margin-bottom: 15px;
  height: 33px;
}

#typeField {
  text-align: center;
  width: 100%;
}

#name {
  background-color: white;
  border-radius: 12px;
  text-indent: 5px;
  width: calc(100% - 70px);
  max-width: 500px;
  height: 33px;
}

.stepper,
.stepper__header,
.card {
  box-shadow: 0 0px 0px 0px rgba(0, 0, 0, 0.2), 0 0px 0px 0 rgba(0, 0, 0, 0.14),
    0 0px 0px 0 rgba(0, 0, 0, 0.12);
  -webkit-box-shadow: 0 0px 0px 0px rgba(0, 0, 0, 0.2),
    0 0px 0px 0 rgba(0, 0, 0, 0.14), 0 0px 0px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
}

#createNext,
#saveFinal {
  position: absolute;
  right: 30px;
}

#WBCard,
#WBICard,
#FAQBCard,
#TBCard {
  background-color: white;
  height: 36.5vh;
  border: 27px solid #d3d3d3;
  border-radius: 43px;
  overflow: hidden;
}

#notImp {
  position: absolute;
  left: 35px;
  top: 120px;
  z-index: 14;
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}

#Welcome_Bot,
#FAQ_Bot {
  height: calc(100% - 54px);
  width: calc(100% - 84px);
  position: absolute;
  left: 42px;
  top: 27px;
  background-color: rgba(218, 218, 218, 0);
  z-index: 15;
  border-radius: 16px;
}

#Welcome_Bot.active,
#FAQ_Bot.active {
  height: calc(100% - 54px);
  width: calc(100% - 84px);
  position: absolute;
  left: 42px;
  top: 27px;
  background-color: rgba(255, 255, 255, 0);
  z-index: 15;
  border-radius: 16px;
  border: 3px solid #ff720b;
}

#Welcome_Bot_Intent,
#Task_Bot {
  height: calc(100% - 54px);
  width: calc(100% - 84px);
  position: absolute;
  left: 42px;
  top: 27px;
  background-color: rgba(218, 218, 218, 0.4);
  z-index: 15;
  border-radius: 16px;
}

#Welcome_Bot_Intent.active,
#Task_Bot.active {
  height: calc(100% - 54px);
  width: calc(100% - 84px);
  position: absolute;
  left: 42px;
  top: 27px;
  background-color: rgba(218, 218, 218, 0.4);
  z-index: 15;
  border-radius: 16px;
  border: 3px solid #ff720b;
}

#picture {
  padding: 0px;
  height: 95%;
}

#picture > img {
  top: 0px;
  bottom: 0px;
  left: -10px;
  right: 0px;
  position: absolute;
  margin: auto;
  width: 87%;
}

#description {
  padding-top: 20px;
}

ul {
  list-style-type: none;
  padding-top: 10px;
}

li {
  margin-top: 18px;
  text-indent: 8px;
  font-size: 12pt;
  word-break: normal;
}

#description > h5 {
  width: 100%;
  background-color: #d3d3d3;
  padding: 5px;
  font-size: 12pt;
  text-indent: 7px;
}

a {
  color: black;
}

.create-view {
  width: 100%;
  margin: auto;
  min-height: 600px;
  margin: 0px;
  padding-top: 50px;
}

.create-header {
  background-color: #d3d3d3;
  height: 50px;
  padding: 5px;
  margin-bottom: 20px;
  border-left: 10px solid white;
  border-right: 10px solid white;
  border-radius: 12px;
}

.create-header > h4 {
  margin: 0px;
}

.creation {
  height: 75vh;
  width: 100vw;
  min-height: 320px;
}

#creator {
  background-color: #d3d3d3;
  height: 75vh;
  width: 95vw;
  min-height: 300px;
  min-width: 360px;
  padding: 10px;
  margin-bottom: 10px;
}

#creator > input {
  max-height: 50px;
}

.input-group {
  display: block;
}

#botSelectType,
#botNameInput {
  border: 1px solid black;
  margin-top: 22px;
  margin-left: 10px;
}

#botSelectType {
  -webkit-appearance: menulist;
  margin-top: 22px;
  margin-left: 10px;
}
</style>
