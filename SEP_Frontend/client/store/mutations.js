/**
 * Mutations change Data in State (Setter)
 * every function should be self explaining
 */
module.exports = {
  /**
   * Function that sets the cause asherror state
   * @param {*} state
   * @param {*} cause
   */
  error(state, cause) {
    console.log('Fehler: ' + cause);
    state.apiState.error = cause;
  },
  /**
   * creates a green succes card to notify the user
   */
  success(state, cause) {
    state.apiState.success = cause;
  },
  clearError(state) {
    state.apiState.error = null;
  },
  clearSuccess(state) {
    state.apiState.success = null;
  },
  addBot(state, bot) {
    state.model.bots.push(bot);
  },
  /**
   * set the state of a specified bot
   * @param {*} status Object containing the Id of a Bot and the new state of it
   */
  botStatus(state, status) {
    state.model.status = status;
    let i = state.model.bots.findIndex(function (bot) {
      return bot.BotId === status.id;
    })
    state.model.bots[i].status = status.response;
  },
  botConfig(state, status) {
    state.configBot.config = status.status;
  },
  currentConfig(state, val) {
    state.configBot.config = val;
  },
  currentName(state, val) {
    state.configBot.name = val;
  },
  currentType(state, val) {
    state.configBot.type = val;
  },
  loading(state, loading) {
    state.apiState.loading = loading;
  },
  allBots(state, botsRecieved) {
    botsRecieved.forEach(bot => {
      if (bot.skillid && bot.skillid > -2) {
        return
      } else {
        var str = bot.botId + bot.date;
        var hash = 0,
          i,
          chr,
          len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
        }
        bot.skillid = Math.abs(hash) % 999999999;
      }
    })
    state.model.bots = botsRecieved;
  },
  /**
   * save login info
   * @param {*} state
   * @param {*} status
   */
  setLoggedIn(state, status) {
    if (status.loggedInStatus) {
      state.logindata = status;
      state.logindata.loginAccID = Number.parseInt(status.loginAccID)
    } else {
      state.logindata.loginname = '';
      state.logindata.loginPW = '';
      state.logindata.loginAccID = 0;
      state.logindata.loggedInStatus = false;
    }
  },
  /**
   * Find the bot to edit and copy it to edit
   * @param {*} state
   * @param {*} id
   */
  editBot(state, id) {
    var editBot = state.model.bots.find(function (bot) {
      return bot.BotId == id;
    });
    if (!editBot.config) {
      state.configBot.config = {
        children: [],
        user: 'Start Node',
        bot: '',
        x: 0,
        y: 0,
      };
    } else {
      state.configBot.config = editBot.config;
    }
    state.configBot.id = id;
    state.configBot.bot = '';
    state.configBot.user = '';
    state.configBot.name = editBot.name;
    state.configBot.type = editBot.type;
    state.configBot.chips = editBot.chips;
    state.configBot.date = editBot.date;
    state.configBot.skillId = editBot.skillid;
  },
  /**
   * localy delete a bot for more responsiveness
   * @param {*} state
   * @param {*} id
   */
  deleteBotFromArray(state, id) {
    state.model.bots.splice(state.model.bots.findIndex(function (bot) {
      return bot.BotId === id;
    }), 1);
  },
  setNewConfig(state, conf) {
    state.configBot.config = conf;
  },
  setNodeId(state, id) {
    state.configBot.currentNode = id;
  },
  bot(state, que) {
    state.configBot.bot = que;
  },
  setChips(state, chips) {
    state.configBot.chips = chips;
  },
  setIntervalId(state, id) {
    state.settings.intervalId = id;
  },
  setSkillId(state, skillId) {
    state.configBot.skillId = skillId;
  },
  changeLang(state){
    state.lang.current = state.lang.current == 1? 0 : 1;
  }
}
