<template>
  <v-app>
    <div id="app">
      <div id="header" class="row" v-if="loggedIn">
        <div id="left">
          <router-link to="/overview" id="headerMargin"><img src="/static/Logo-LP.png"/></router-link>
        </div>
        <div id="middle">
          <div id="Create">
            <router-link to="/create" id="routeCreate">
              <div :id="path==='/create'?'orange':'gray'">
                {{lang.create}}
              </div>
            </router-link>
          </div>
          <div id="Overview">
            <router-link to="/overview" id="routeOverview">
              <div :id="path==='/overview'?'orange':'gray'">
                {{lang.overview}}
              </div>
            </router-link>
          </div>
        </div>
        <div id="right">
          <v-menu v-if="loggedIn" offset-x
                  :close-on-content-click="false"
                  :nudge-width="200">
            <v-btn slot="activator" id="menu" flat>{{login}}</v-btn>
            <v-card>
              <v-list>
                <v-list-tile avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{loginAccID}}</v-list-tile-title>
                    <v-list-tile-title>{{login}}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
              <v-divider />
              <div id="localization" @click="changeLanguage">
                <span id="german" :class="getLang==='de'?'bold':''">
                  DE
                </span>
                <span>
                  /
                </span>
                <span id="english" :class="getLang==='en'?'bold':''">
                  EN
                </span>
              </div>
              <v-list>
                <v-list-tile>
                  <v-btn
                    small color="orange" dark id="logout"
                    @click.native="logMeOut">
                    {{ lang.logout }}
                  </v-btn>
                </v-list-tile>
              </v-list>
              <v-card-actions/>
            </v-card>
          </v-menu>
          <router-link v-else to="/login" id="login"> <v-btn small color="orange darken-2" dark>Login</v-btn> </router-link>
        </div>
      </div>
      <div v-else>
        <div id="headerMargin">
          <img src="/static/Logo-LP.png">
        </div>
      </div>
      <div v-if="error">
        <v-alert color="error" id="error" icon="warning" dismissible v-model="error" @click="clear">
          {{ error }}
        </v-alert>
      </div>
      <div v-if="success">
        <v-alert color="success" id="success" icon="check_circle" dismissible v-model="success" @click="clear">
          {{ success }}
        </v-alert>
      </div>
      <router-view id="view"/>
    </div>
  </v-app>
</template>


<script>
export default {
  data() {
    return {};
  },
  methods: {
    changeLanguage() {
      this.$store.commit("changeLang");
    },
    logMeOut() {
      var status = {
        loggedInStatus: false
      };
      this.$cookie.delete("login");
      this.$cookie.delete("username");
      this.$store.commit("setLoggedIn", true);
      this.$router.push({ path: "/login" });
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
    if (this.$cookie.get("login")) {
      var cookieStatus = {
        loginname: this.$cookie.get("username"),
        loginAccID: this.$cookie.get("accId"),
        loggedInStatus: true
      };
      this.$store.commit("setLoggedIn", cookieStatus);
    }
    if (!this.loggedIn) {
      this.$router.push({ path: "/login" });
    }
  },

  computed: {
    getLang() {
      return this.$store.getters.currentLang;
    },
    lang() {
      return this.$store.getters.getLang;
    },
    path() {
      return this.$route.path;
    },
    loginAccID() {
      return this.$store.getters.loggedInAccountID;
    },
    path() {
      return this.$route.path;
    },
    login() {
      return this.$store.getters.loggedInName;
    },
    loginID() {
      return this.$store.getters.loggedInAccountID;
    },
    loggedIn() {
      if (!this.$store.getters.loggedInState) {
        this.$store.commit("setLoggedIn", {
          loginname: this.$cookie.get("username")
        });
        return this.$cookie.get("login");
      } else {
        return true;
      }
    },
    error() {
      return this.$store.getters.getError;
    },
    success() {
      return this.$store.getters.getSuccess;
    }
  }
};
</script>


<style>
#localization {
  z-index: 10;
  width: 100%;
  padding: 0px;
  margin-left: 25px;
  border: 0;
  color: #d5d5d5;
  user-select: none;
}
.bold {
  font-weight: medium;
  color: black;
}

input {
  box-shadow: 0 0px 0px 0px rgba(0, 0, 0, 0.2), 0 0px 0px 0 rgba(0, 0, 0, 0.14),
    0 0px 0px 0 rgba(0, 0, 0, 0.12) !important;
  -webkit-box-shadow: 0 0px 0px 0px rgba(0, 0, 0, 0.2),
    0 0px 0px 0 rgba(0, 0, 0, 0.14), 0 0px 0px 0 rgba(0, 0, 0, 0.12) !important;
}

:focus {
  outline: 0px !important;
}

button,
textarea,
input {
  outline: 0px !important;
}

#Overview,
#Create {
  width: 150px;
  height: 32px;
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
}

#Create {
  right: calc(50% - 150px);
}

#orange {
  border-radius: 12px;
  border: 3px solid #ff720b;
}

#gray {
  border-radius: 12px;
  border: 3px solid #efeded;
}

#Overview {
  right: 50%;
}

.card__text {
  padding: 0px;
}

body {
  font-size: 14pt;
  font-family: -apple-system, BlinkMacSystemFont, "helvetic", "avenir next",
    "avenir", "helvetica neue", "Ubuntu", "segoe ui", arial, sans-serif;
}

#app {
  font-family: helvetica;
  height: 100%;
}

#app > .row {
  margin: 0;
}

#login {
  color: white;
}

#left {
  width: 178px;
  height: 35;
  margin-left: 35px;
  margin-top: 20px;
  margin-bottom: 20px;
}

#middle {
  vertical-align: middle;
  text-align: center;
}

#right {
  text-align: right;
}

#routeOverview,
#routeCreate {
  text-decoration: none;
  color: #ff720b;
}

#header {
  background-color: white;
  position: fixed;
  width: 100%;
  height: 70px;
  z-index: 50;
}

#view {
  color: #383838;
  margin-top: 15px;
}

#menu {
  position: fixed;
  top: 27px;
  right: 12px;
  border: 2px solid #ff720b;
  transform: translate(0, -50%);
  border-radius: 12px;
  color: #ff720b;
  background-color: #fff;
}

#error,
#success {
  width: 96%;
  position: fixed;
  margin-left: 2%;
  z-index: 50;
  color: black;
}
</style>

