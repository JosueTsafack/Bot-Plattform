var axios = require('axios')
var decycle = require('json-decycle').decycle;


export default {
  /**
   * Function to create a new Bot
   * @param {*} param0 commit searched store for mutations || state includes all data
   */
  postNewBot({dispatch, commit, state }) {
    console.log('neuer Bot beantragt...');
    if (!state.configBot.name || !state.configBot.type) {
      commit('error', 'One of the field was empty');
      return;
    }
    let a = {
      name: state.configBot.name,
      type: state.configBot.type,
      user: state.logindata.loginname,
      chips: state.configBot.chips,
    };
    commit('clearError');
    commit('clearSuccess');
    commit('loading', true);
    return new Promise((resolve, reject) => {
      axios.post(state.settings.serverIp + '/newbot', a)
        .then(function (response) {
          commit('loading', false);
          dispatch('success', "Bot abgeschickt");
          commit('addBot', response.data);
          resolve(response);
        }).catch(function (error) {
          reject(error);
          commit('loading', false);
          commit('error', 'Fehler beim Speichern: ' + error);
        });
    })
  },

  /**
   * Function to configure a specific Bot
   * @param {*} param0 commit searched store for mutations || state includes all data
   * @returns a promise to callback when the request has finished
   */
  saveConfig({dispatch, commit, state }) {
    var bot = state.configBot;
    var c = state.configBot.config;
    if (state.configBot.type === "Welcome_Bot") {
      var dc = JSON.parse(JSON.stringify(c, decycle()));
      var f = function (n) {
        n.user = n.data.user;
        n.bot = n.data.bot;
        if(n.data.end){
          n.end = n.data.end;
          n.children = [];
        }
        delete n.parent;
        delete n.depth;
        delete n.id
        delete n.data
        delete n.user; //<<-----
        for (var j = 0; j < n.children.length; j++) {
          f(n.children[j]);
        }
      }
      f(dc);
    } else {
      var dc;
      dc = JSON.stringify(c);
    }
    var a = {
      config: dc,
      name: bot.name,
      chips: bot.chips,
      skillid: bot.skillId
    }
    return new Promise((resolve, reject) => {
      axios.post(state.settings.serverIp + '/bot/' + bot.id + '/edit', a)
        .then(function (response) {
          commit('loading', false);
          dispatch('success', "Bot abgeschickt");
          resolve(response);
        }).catch(function (error) {
          reject(error);
          commit('loading', false);
          commit('error', 'failed to save: ' + error);
        });
    });
  },

  /**
   * Function to delete a specific Bot
   * @param {*} param0 commit searched store for mutations || state includes all data
   * @param {*} id is Bot ID
   */
  deleteBot({
    commit,
    state
  }, id) {
    commit('clearError');
    axios.delete(state.settings.serverIp + '/bot/' + id)
      .catch(function (error) {
        commit('error', 'Fehler beim Löschen: ' + error);
      });
    commit('deleteBotFromArray', id);
  },

  /**
   * Function with get-Request to get a full list of all Bots
   * @param {*} param0 commit searched store for mutations || state includes all data
   * @returns a promise to callback when the request has finished
   */
  getAllBotStatus({ commit, state }) {
    commit('loading', true);
    commit('clearError');
    return new Promise((resolve, reject) => {
      axios.get(state.settings.serverIp + '/all', {
        'headers': {
          'Authorization': state.logindata.loginname
        }
      })
        .then(function (response) {
          commit('loading', false);
          let sorted = response.data;
          let rate = state => {
            switch (state) {
              case "runnable": return 0;
              case "building": return 1;
              case "running": return 2;
              case "stopped": return 3;
            }
          };
          sorted = sorted.sort(function (a, b) {
            if (rate(a.status) == rate(b.status)) {
              if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
              if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
              return 0; //default return value (no sorting)
            } else {
              return rate(a.status) > rate(b.status) ? -1 : 1;
            }
          });
          commit('allBots', response.data);
          resolve(response);
        })
        .catch(function (error) {
          commit('loading', false);
          commit('error', 'Fehler beim Abrufen der Bots: ' + error);
          reject(error);
        });
    });
  },

  /**
   * Function to start a specific Bot
   * @param {*} param0 commit searched store for mutations || state includes all data
   * @param {*} id is Bot ID
   * @returns a promise to callback when the request has finished
   */
  startBot({ commit, state }, id) {
    commit('botStatus', {
      id,
      response: 'building'
    });
    commit('clearError');

    let i = state.model.bots.findIndex(function (bot) {
      return bot.BotId === id;
    })

    return new Promise((resolve, reject) => {
      axios.post(state.settings.serverIp + '/bot/' + id + '/run', {
        type: state.model.bots[i].type,
      })
        .then(function (response) {
          commit('botStatus', {
            id,
            response: 'running'
          });
          resolve(response);
        })
        .catch(function (error) {
          commit('botStatus', {
            id,
            response: 'stopped'
          });
          commit('error', 'Fehler beim Starten: ' + error);
          reject(error);
        });
    });
  },

  /**
 * Function to stop a specific Bot
 * @param {*} param0 commit searched store for mutations || state includes all data
 * @param {*} id is Bot ID
 * @returns a promise to callback when the request has finished
 */
  stopBot({ commit, state }, id) {
    commit('botStatus', {
      id,
      response: 'building'
    });
    commit('clearError');
    let i = state.model.bots.findIndex(function (bot) {
      return bot.BotId === id;
    })
    return new Promise((resolve, reject) => {
      axios.post(state.settings.serverIp + '/bot/' + id + '/stop', {
        type: state.model.bots[i].type
      })
        .then(function (response) {
          commit('botStatus', {
            id,
            response: 'runnable'
          });
          resolve(response);
        })
        .catch(function (error) {
          commit('botStatus', {
            id,
            response: 'stopped'
          });
          commit('error', 'Fehler beim stoppen des Bots: ' + error);
          reject(error);
        });
    });
  },

  success({commit}, message){
    commit("success", message);
    setTimeout(()=>{
      commit("clearSuccess");
    }, 4500);
  }
}
