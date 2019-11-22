<template>
  <div class="login-wrapper">

    <div id="language" @click="changeLanguage">
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


    <div class="col-xs-4" id="login-window">
      <h5>{{ lang.welcomeMessage }}</h5>

      <form>
        <h6>{{ lang.accId }}</h6>
        <input autocomplete="off" id="accountID" @keyup.enter="logMeIn" autofocus/>
        <h6>{{ lang.user }}</h6>
        <input autocomplete="off" id="userName" @keyup.enter="logMeIn"/>
        <h6>{{ lang.pass }}</h6>
        <input autocomplete="off" id="password" type="password" @keyup.enter="logMeIn"/>
        <br>
        <input type="checkbox" id="remember">
        <label for="remember" id="rememberMe">{{ lang.remember }}</label>
      </form>
      <v-btn small color="orange darken-2" dark id="loginButton" @click.native="logMeIn">
        Login
      </v-btn>
    </div>

  </div>
</template>

<script>
export default {
  methods: {
    changeLanguage() {
      this.$store.commit("changeLang");
    },
    logMeIn() {
      if (
        document.getElementById("userName").value == "" ||
        document.getElementById("password").value == "" ||
        document.getElementById("accountID").value == ""
      ) {
        console.log("Missing Entry");
        return;
      }

      var status = {
        loginname: document.getElementById("userName").value,
        loginPW: document.getElementById("password").value,
        loginAccID: document.getElementById("accountID").value,
        loggedInStatus: true
      };
      this.$cookie.set("login", true, 1);
      this.$cookie.set("username", status.loginname, 1);
      this.$cookie.set("accId", status.loginAccID);
      this.$store.commit("setLoggedIn", status);
      this.$router.push({ path: "/" });
    },
  },
  computed: {
    getLang() {
      return this.$store.getters.currentLang;
    },
    lang() {
      return this.$store.getters.getLang;
    }
  }
};
</script>

<style scoped>
#language {
  position: fixed;
  right: 100px;
}

.login-wrapper {
  padding-top: 50px;
  height: 95vh;
  background-color: #efeded;
}

#login-window {
  background-color: #efeded;
  position: absolute;
  left: 50%;
  margin-top: 50px;
  margin-left: -210px;
  height: 325px;
  min-width: 420px;
  width: 420px;
  border-radius: 20px;
}

input {
  margin-top: 5px;
}

#password,
#userName,
#accountID {
  background-color: #fff;
  border: 1px solid #fff;
  height: 32px;
  width: 100%;
  border-radius: 12px;
  text-indent: 5px;
}

#password:focus,
#userName:focus,
#accountID:focus,
#loginButton:active {
  outline: 0;
}

h6 {
  margin-top: 10px;
  margin-bottom: -4px;
  font-size: 12px;
  color: #9a9d9f;
}

#rememberMe {
  font-size: 12px;
  color: #9a9d9f;
}

#homebutton {
  position: absolute;
  bottom: 3px;
  right: 3px;
  z-index: 50;
}

#loginButton {
  right: 5px;
}
</style>
