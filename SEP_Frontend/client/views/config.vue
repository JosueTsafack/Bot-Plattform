<template>
  <div class="config-view">
    <v-container class="config-header" fluid grid-list-md>
      <v-layout row wrap>
        <v-flex xs3>
          <v-text-field
            v-model="currName"
            class="botConfig"
            id="name"
            prefix="Bot name:"
            placeholder="Name"
            hide-details
          ></v-text-field>
        </v-flex>
        <v-flex xs3 offset-xs5>
          <v-text-field
            v-model="skillId"
            append-icon="info"
            :append-icon-cb="showDialog"
            id="skill"
            prefix="Skill ID:"
            hide-details
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-select label="Tag your Bot" chips tags solo append-icon="" clearable v-model="chips">
            <template slot="selection" slot-scope="data">
              <v-chip close @input="remove(data.item)">
                <a>{{ data.item }}</a>
              </v-chip>
            </template>
          </v-select>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{ lang.skillIDCardHeader }}</v-card-title>
        <v-card-text>{{ lang.skillIDCardBody }} </v-card-text>
      </v-card>
    </v-dialog>


    <v-layout id="container" v-if="botType === 'Welcome_Bot'">
      <v-flex d-flex xs6 sm5 lg4 xl3 id="configurator">
        <wbconfig></wbconfig>
      </v-flex>
      <v-flex d-flex xs6 sm7 lg8 xl9 id="flowchart">
        <flowchart></flowchart>
      </v-flex>
    </v-layout>
    <div v-if="botType === 'FAQ_Bot'" class="configuration">
      <faqbconfig></faqbconfig>
    </div>
    <!-- reference your future bot configs here -->
    <div v-if="botType === 'Welcome_Bot_Intent'" class="configuration">
      <div id="lootbox">
        {{ lang.notIncluded1 }}
        <br>
        <a target="_blank" id="buyHere" href="https://www.origin.com/deu/de-de/store/star-wars/star-wars-battlefront-2/standard-edition">{{ lang.notIncluded2 }}</a>
      </div>
    </div>
    <!-- reference your future bot configs here -->
    <div v-if="botType === 'Task_Bot'" class="configuration">
      <div id="lootbox">
        {{ lang.notIncluded1 }}
        <br>
        <a target="_blank" id="buyHere" href="https://www.origin.com/deu/de-de/store/star-wars/star-wars-battlefront-2/standard-edition">{{ lang.notIncluded2 }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import flowchart from "../components/Flowchart.vue";
import wbconfig from "../components/WBConfig.vue";
import faqbconfig from "../components/FAQBConfig.vue";

export default {
  components: {
    flowchart,
    wbconfig,
    faqbconfig
  },
  data: function() {
    return {
      dialog: false
    };
  },
  methods: {
    showDialog() {
      this.dialog = true;
    },
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1);
      this.chips = [...this.chips];
    },
    urlId() {
      if (this.$route.params.id) {
        this.$store.commit("editBot", this.$route.params.id);
      }
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
    this.urlId();
    this.clear();
  },

  computed: {
    lang() {
      return this.$store.getters.getLang;
    },
    skillId: {
      get() {
        return this.$store.getters.getBot.skillId;
      },
      set(val) {
        this.$store.commit("setSkillId", val);
      }
    },
    loggedIn() {
      return this.$store.getters.loggedInState;
    },
    botType() {
      return this.$store.getters.getCurrType;
    },
    chips: {
      get() {
        return this.$store.getters.getBot.chips;
      },
      set(val) {
        this.$store.commit("setChips", val);
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
#skillLabel {
  margin-left: calc(100% - 550px);
}
#skill {
  width: 122px;
}
#container {
  min-width: 700px;
}

#configurator {
  margin-right: 0px;
  width: 300px;
}

#flowchart {
  width: calc(100% - 300px);
}

#lootbox {
  margin-left: 15px;
}

.config-view {
  margin: auto;
  min-height: 600px;
  margin: 0px;
}

.config-header {
  border-radius: 4px !important;
  margin-top: 80px;
  background-color: #d3d3d3;
  height: 120px;
  width: 96%;
  padding: 8px;
  margin-bottom: 20px;
  margin-left: 25px;
  margin-right: 25px;
  border-radius: 12px;
}

div.flex > * {
  padding: 2px;
}

.configuration {
  height: 100%;
  min-height: 300px;
}

input {
  font-size: 18pt;
  height: 30px;
  margin-bottom: 13px;
}

#botSelectType,
#botSelectDescription {
  border: 1px solid black;
}
</style>
