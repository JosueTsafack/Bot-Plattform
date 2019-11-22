export default {
  getError: state => {
    return state.apiState.error;
  },
  getSuccess: state => {
    return state.apiState.success;
  },
  getCurrConf: state => {
    return state.configBot.config;
  },
  getCurrName: state => {
    return state.configBot.name;
  },
  getCurrType: state => {
    return state.configBot.type;
  },
  loading: state => {
    return state.apiState.loading;
  },
  status: state => {
    return state.apiState.status;
  },
  getBots: state => {
    return state.model.bots;
  },
  bottypes: state => {
    return state.botTypes;
  },
  /** Get Name of logged in Account */
  loggedInName: state => {
    return state.logindata.loginname;
  },
  /** Get AccountID of logged in Account */
  loggedInAccountID: state => {
    return state.logindata.loginAccID;
  },
  /** Get Password of logged in Account */
  loggedInPassword: state => {
    return state.logindata.loginPW;
  },

  loggedInState: state => {
    return state.logindata.loggedInStatus;
  },
  createBotId: state => {
    return state.configBot.id;
  },
  getCurrNodeId: state => {
    return state.configBot.currentNode;
  },
  bottypes: state => {
    return state.settings.botTypes;
  },
  getBot: state => {
    return {
      id: state.configBot.id,
      config: state.configBot.config,
      name: state.configBot.name,
      chips: state.configBot.chips,
      skillId: state.configBot.skillId,
      date: state.configBot.date,
    }
  },
  /*
    What does the bot say.
    BLINGBLING BLUNGBLUNG
  */
  getBotInput: state => {
    return state.configBot.bot;
  },

  interval: state => {
    return state.settings.interval;
  },
  getIntervalId: state => {
    return state.settings.intervalId;
  },
  /**
   * @returns an array of all chips that occure in all bots
   */
  getAvaliableChips: state => {
    var allChips = [];
    state.model.bots.forEach(bot => {
      if (bot.chips) {
        bot.chips.forEach(chip => {
          if (!allChips.includes(chip)) {
            allChips.push(chip);
          }
        })
      }
    });
    return allChips;
  },
  getCurrChips: state => {
    return state.configBot.chips;
  },
  getLang: state => {
    return state.lang.files[state.lang.current];
  },
  currentLang: state =>{
    return state.lang.current == 1? 'en' : 'de';
  }
}
