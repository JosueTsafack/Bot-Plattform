<template>
  <div class="overview-wrapper">
    <!-- Toggle the reloading of the bot array -->
    <div id="reloadToggle">
      <form>
        <v-switch v-model="reloadToggles" label="Auto Reload" color="secondary"></v-switch>
      </form>
    </div>
    <br>

    <!-- loading animation while waiting for bots -->
    <v-progress-circular :size="70" id="progress" v-if="loading && !reloadToggles" indeterminate color="primary" />

    <!-- if there are no bots dont show the list -->
    <div v-if="allBots.length==0 && !loading">
      <div id="emptyRow">
        {{ lang.noBot }}
      </div>
      <br>
      <router-link to="create" class="Config">
        <a id="Plus">+</a>
        <a id="firstBot">{{ lang.firstBot }}</a>
      </router-link>
      <br>
    </div>

    <!-- Filter for chips and the state of bots -->
    <v-container fluid grid-list-md v-if="allBots.length>0" id="Container">
       <v-layout row wrap>
         <v-flex d-flex md4 xs8 id="Filter">
           <!-- Chip selection -->
          <v-text-field v-model="query" name="search" :label="lang.search" id="search" />
        </v-flex>
        <v-flex d-flex md4 xs8>
          <v-card flat id="radio">
            <v-card-text id="radio">
              <!-- state selection -->
              <v-radio-group v-model="radios" row id="radio">
                <v-radio :label="lang.radioAll" light value="all" color="grey" id="rad" />
                <v-radio :label="lang.radioRna" value="runnable" color="grey" id="rad" />
                <v-radio :label="lang.radioRun" value="running" color="green" id="rad" />
                <v-radio :label="lang.radioErr" value="stopped" color="red" id="rad" />
              </v-radio-group>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- header of bottable -->
    <div v-if="allBots.length>0" class="col-xs-12" id="botTable">
      <div class="col-xs-5"> {{ lang.name }}</div>
      <div class="col-xs-1" id="status"> {{ lang.status }}</div>
      <!-- Buttons -->
      <div class="col-xs-5" id="buttons">
        <!-- disabled buttons when no row is selected -->
        <div v-if="!status">
          <v-btn round disabled id="disabledStart" color="white">
            <v-icon dark>play_arrow</v-icon>
          </v-btn>
          <v-btn round disabled id="disabledEdit" color="white">
            <v-icon dark>edit</v-icon>
          </v-btn>
          <v-btn round disabled id="disabledDelete" color="white">
            <v-icon dark>delete</v-icon>
          </v-btn>
        </div>
        <div v-else>
          <!-- buttons for the state of the selected row -->
          <v-btn v-if="status === 'runnable'" round @click="startBot" id="start" color="white">
            <v-icon dark>play_arrow</v-icon>
          </v-btn>
          <v-btn v-if="status === 'stopped'" round @click="startBot" id="retry" color="white">
            <v-icon dark>settings_backup_restore</v-icon>
          </v-btn>
          <v-btn v-if="status === 'building'" disabled round id="disabledStop" color="white">
            <v-icon dark>pause</v-icon>
          </v-btn>
          <v-btn v-if="status === 'running'" round @click="stopBot" id="stop" color="white">
            <v-icon dark>pause</v-icon>
          </v-btn>
          <v-btn v-if="status === 'running'" round disabled id="disabledEdit" color="white">
            <v-icon dark>edit</v-icon>
          </v-btn>
          <v-btn v-else round @click="editBot" id="edit" color="white">
            <v-icon dark>edit</v-icon>
          </v-btn>
          <v-btn v-if="status === 'running' || status === 'building'" round disabled id="disabledDelete" color="white">
            <v-icon dark>delete</v-icon>
          </v-btn>
          <v-btn v-else round @click="deleteBot" id="delete" color="white" slot="activator">
            <v-icon dark>delete</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <br>
    <!-- main list of bots -->
    <div id="scroll" class="col-xs-12">
      <transition-group name="list" mode="out-in">
        <div v-for="Bot in Bots" :key="Bot.BotId" :id="'botTableRow' + Bot.BotId">
          <div id="row" @click="selectLine(Bot.BotId, Bot.status)">
            <!-- Bot icons -->
            <div class="col-xs-1" id="icons">
              <img alt="icon" :src="'/static/' + Bot.type + '.png'" height="50px" id="bottype" :title="Bot.type">
            </div>
            <!-- Bot name -->
            <div class="col-xs-4 col-md-auto" id="Botname">{{Bot.name}}</div>
            <!-- Bot state -->
            <div class="col-xs-1">
              <div v-if="Bot.status == 'running'" title="running" id="runningID">
                <svg>
                  <circle cx="25" cy="25" r="10" fill="green" />
                </svg>
              </div>
              <div v-if="Bot.status == 'runnable' || Bot.status == 'building'" title="runnable" id="runnableID">
                <svg>
                  <ellipse :id="'circ'+Bot.BotId" cx="25" cy="25" rx="10" ry="10" fill="#d3d3d3" stroke="grey" stroke-width="2.5" />
                  <animate v-if="Bot.status == 'building'" title="loading" attributeName="ry" :href="'#circ' + Bot.BotId" attributeType="XML" values="10; 0; 10" dur="2s"
                           repeatCount="indefinite" id="loadingID"/>
                </svg>
              </div>
              <div v-if="Bot.status == 'stopped'" title="stopped" id="stoppedID">
                <svg>
                  <path stroke="#df2511" d="M15 15 L35 35" stroke-width="6" />
                  <path stroke="#df2511" d="M35 15 L15 35" stroke-width="6" />
                </svg>
              </div>
            </div>
            <div class="col-xs-5" id="date">
              {{ Bot.prettyDate }}
            </div>
          </div>
        </div>
      </transition-group>
      <!-- delete card -->
      <div v-if="deleteBoolean" id="deletDiv">
        <div id="blur"></div>
        <v-card id="deleteCard" >
          <div>Do you really want to
            <br> delete bot with ID: {{ botID }}
          </div>
          <v-btn color="primary" @click="reallyDeleteBot()" id="confirmDelete">yes</v-btn>
          <v-btn color="secondary" @click="dontDelete()" id="abortDelete">no</v-btn>
        </v-card>
      </div>
    </div>
    <!-- no entry fits all your Filters -->
    <div v-if="Bots.length == 0 && allBots.length>0" id="noBots">
      {{ lang.nofitting }}
    </div>
    <chat />
  </div>
</template>

<script>
import * as JsSearch from "js-search";
import chat from "../components/chat.vue";

export default {
  components: {
    chat
  },
  data: function() {
    return {
      deleteBoolean: false,
      dialog: false,
      botID: 0,
      dialogContent: "test",
      intervalID: -1,
      status: null,
      lineId: -1,
      query: "",
      selected: [],
      radios: "all",
    };
  },
  methods: {
    /**
     * add the "active" class to the clicked row
     */
    selectLine(id, stat) {
      while (document.querySelector("div.active")) {
        document.querySelector("div.active").classList.value = "none";
      }
      document.querySelector("#botTableRow" + id).classList.value = "active";
      this.status = stat;
      this.lineId = id;
    },
    clear() {
      this.$store.commit("clearError");
    },
    startBot() {
      this.$store.dispatch("startBot", this.lineId).then(
        response => {
          this.status = "running";
        },
        error => {
          this.status = "runnable";
        }
      );
    },
    stopBot() {
      this.$store.dispatch("stopBot", this.lineId).then(
        response => {
          this.status = "runnable";
        },
        error => {
          this.status = "running";
        }
      );
    },
    editBot() {
      // this.$store.commit("", this.lineId);
      this.$router.push({
        path: "config/" + this.lineId
      });
    },
    deleteBot() {
      this.reloadBots().then(
        response => {
          var newbot = this.Bots.find(bot => {
            return this.lineId == bot.BotId;
          });
          if (newbot.status === "running" || newbot.status === "building") {
            this.$store.commit("error", "Running Bots cannot be deleted");
            return;
          }
          this.botID = newbot.BotId;
          this.deleteBoolean = true;
        },
        error => {
          console.error("vom promise: ", error);
        }
      );
    },
    reloadBots() {
      return this.$store.dispatch("getAllBotStatus");
    },
    reallyDeleteBot() {
      this.$store.dispatch("deleteBot", this.botID);
      this.dontDelete();
      this.status = null;
    },
    dontDelete() {
      this.deleteBoolean = false;
      this.botID = "";
    },
    createHandler(divisor, noun, restOfString) {
      var plural = this.lang.plural;
      return function(diff) {
        var n = Math.floor(diff / divisor);
        var pluralizedNoun = noun + (n > 1 ? plural : "");
        return "" + n + " " + pluralizedNoun + " " + restOfString;
      };
    }
  },
  beforeMount() {
    if (!this.loggedIn) {
      this.$router.push({
        path: "/login"
      });
    } else {
      this.$store.dispatch("getAllBotStatus");
    }
  },
  computed: {
    lang() {
      return this.$store.getters.getLang;
    },
    reloadToggles: {
      get() {
        return this.$store.getters.getIntervalId > 0;
      },
      set(val) {
        if (val) {
          this.$store.dispatch("getAllBotStatus");
          this.$store.commit(
            "setIntervalId",
            setInterval(() => {
              this.$store.dispatch("getAllBotStatus");
            }, this.$store.getters.interval)
          );
        } else {
          clearInterval(this.$store.getters.getIntervalId);
          this.$store.commit("setIntervalId", -1);
        }
      }
    },
    allChips() {
      return this.$store.getters.getAvaliableChips;
    },
    loggedIn() {
      return this.$store.getters.loggedInState;
    },

    /**
     * @returns all bots that apply to the filter (if it´s set)
     */
    Bots() {
      var allBots = this.$store.getters.getBots;
      var filtered = allBots.filter(bot => {
        //filter out bots with the wrong state
        if (this.radios != "all") {
          return bot.status === this.radios;
        } else {
          return true;
        }
      });

      if (this.query && this.query != "") {
        var search = new JsSearch.Search("BotId");
        search.addIndex("name");
        search.addIndex("chips");
        search.addIndex(["config", "bot"]);
        search.addIndex("status");
        search.addDocuments(filtered);
        filtered = search.search(this.query);
      }
       var formatters = [
        {
          threshold: 1,
          handler: () => {
            return "just now";
          }
        },
        {
          threshold: 60,
          handler: this.createHandler(1, this.lang.sec, this.lang.ago)
        },
        {
          threshold: 3600,
          handler: this.createHandler(60, this.lang.min, this.lang.ago)
        },
        {
          threshold: 86400,
          handler: this.createHandler(3600, this.lang.hour, this.lang.ago)
        },
        {
          threshold: 172800,
          handler: () => {
            return this.lang.yest;
          }
        },
        {
          threshold: 604800,
          handler: this.createHandler(86400, this.lang.day, this.lang.ago)
        },
        {
          threshold: 2592000,
          handler: this.createHandler(604800, this.lang.week, this.lang.ago)
        },
        {
          threshold: 31536000,
          handler: this.createHandler(2592000, this.lang.month, this.lang.ago)
        },
        {
          threshold: Infinity,
          handler: this.createHandler(31536000, this.lang.year, this.lang.ago)
        }
      ]
      filtered.forEach(bot => {
        var date = new Date(bot.date);
        var diff = (new Date().getTime() - date.getTime()) / 1000;
        for (var i = 0; i < formatters.length; i++) {
          if (diff < formatters[i].threshold) {
            bot.prettyDate = formatters[i].handler(diff);
            return;
          }
        }
      });
      return filtered;
    },
    allBots() {
      return this.$store.getters.getBots;
    },
    loading() {
      return this.$store.getters.loading;
    },
    statsAll() {
      return this.$store.getters.stats;
    }
  }
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.15s;
}

.list-leave-to {
  opacity: 0;
  transform: translateX(300px);
}

.list-enter {
  opacity: 0;
  transform: translateX(-300px);
}

.list-move {
  transition: transform 0.2s;
}

#progress {
  z-index: 100 !important;
}

#status {
  transform: translate(-60px, 0);
}

button:focus:active {
  outline: 0px;
}

#reloadToggle {
  position: fixed;
  padding-top: 60px;
  padding-right: 10px;
  width: 200px;
  right: 0px;
}

.card {
  background-color: rgba(255, 255, 255, 0.955);
}

p {
  margin-top: 50px;
  margin-left: 50px;
}

.v-layout {
  margin-left: 30px;
  margin-right: 30px;
}

.overview-wrapper {
  margin-right: 30px;
  padding-top: 20px;
}

#bottype {
  background-color: white;
  border: 3px solid white;
  width: 60px;
  height: 60px;
  border-radius: 12px;
}

svg {
  padding-top: 5px;
  width: 50px;
  height: 50px;
  display: block;
  margin: auto;
}

#start,
#stop,
#disabledStart,
#pause,
#edit,
#delete,
#disabledDelete,
#disabledEdit,
#retry {
  max-width: 20%;
  min-width: 36px;
}

#buttons {
  margin-top: -10px;
  padding-left: 14%;
}

#deleteCard {
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

#progress {
  position: fixed;
  margin-left: 47vw;
  margin-top: 20vh;
}

#row {
  border-radius: 12px;
  background-color: #e5e5e5;
  height: 70px;
  margin-top: 8px;
  padding-top: 2.5px;
  border: 2px solid white;
  border-left: 3px solid white;
  border-right: 3px solid white;
}

#emptyRow {
  margin-top: 80px;
  width: calc(98vw - 80px);
  min-width: 1000px;
  border-radius: 12px;
  background-color: #e5e5e5;
  height: 70px;
  margin-left: 30px;
  padding: 18px;
}

#Plus {
  border-radius: 12px;
  border: 3px solid #f68b1f;
  font-size: 30pt;
  padding-left: 12px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-right: 12px;
  margin-left: 30px;
}

a {
  text-decoration: none !important;
}

#firstBot {
  position: relative;
  top: -7px;
  color: #444444;
  margin: 10px;
  padding-bottom: 10px;
}

.active > #row,
#row:hover {
  padding-top: 1.5px;
  border: 3px solid #ff720b;
}

#scroll {
  margin-left: 15px;
  max-height: calc(100vh - 260px);
  width: calc(98vw - 30px);
  overflow: auto;
  overflow-x: hidden;
  min-width: 1000px;
}

#botTable {
  border-radius: 12px;
  padding-top: 20px;
  height: 70px;
  background-color: #c1c1c1;
  margin-top: 20px;
  margin-left: 30px;
  width: calc(98vw - 60px);
  min-width: 1000px;
}

#botTable > * {
  font-weight: bold;
  margin-right: 5px;
}

#icons {
  width: 80px;
}

#date,
#Botname {
  padding-top: 15px;
  vertical-align: middle;
}

#date {
  color: #777777;
  text-align: right;
  padding-right: 200px;
}

#Container {
  margin-top: 10px;
  padding-bottom: 0px;
  padding-top: 0px;
  margin-bottom: 0px;
}

#Filter {
  max-width: 350px;
  margin-top: 5px;
  margin-left: 30px !important;
}

#radio {
  width: 450px;
  margin-top: 0px;
  height: 40px;
  background-color: #f8f8f8;
  top: -7px;
  position: relative;
}

div[role="radio"] {
  margin-top: 15px !important;
  padding-left: 25px;
}

#rad {
  height: 30px !important;
}

label {
  padding-left: 0px !important;
}

#noBots {
  color: #f68b1f;
  padding: 20px;
  margin-left: 80px;
}

.card {
  margin-top: 50px;
}
</style>
