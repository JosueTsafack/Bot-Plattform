import settings from '../../settings.json'
var server = settings.server
export default {
  /**
   *
   */
  model: {
    bots: [],
    status: 'testStatus',
  },

  /**
   * binds to error + success messages
   */
  apiState: {
    error: null,
    success: null,
    loading: false,
  },

  /**
   * Website settings
   */
  settings: {
    serverIp: server, //server url
    interval: 1000, //Auto Reload interval in ms
    intervalId: null,
  },

  /**
   * temporary Config of a bot
   */
  configBot: {
    type: '',
    id: '',
    name: '',
    config: '',
    currentNode: '0',
    user: '',
    bot: '',
    chips: [],
    date: '',
    skillId: null,
  },


  /**
   * Data of already logged in account
   */
  logindata: {
    loginname: '',
    loginPW: '',
    loginAccID: 0,
    loggedInStatus: false,
  },

  lang: {
    current: 1,
    files: [{
      overview: 'Übersicht',
      create: 'Erstellen',
      logout: 'abmelden',

      //login
      welcomeMessage: 'Willkomen zur Botschmiede',
      accId: 'Konto ID',
      user: 'Username',
      pass: 'Passwort',
      remember: 'angemeldet bleiben',

      //Create
      spinner1: 'Typ',
      spinner2: 'Details',
      wb: 'Welcome Bot',
      wbi: 'Welcome Bot (Absichtsbasiert)',
      faq: 'FAQ-Bot',
      task: 'Task Assist Bot',
      wbDesc: 'Begrüßt Besucher, versucht den Benutzer durch einfache Fragen korrekt an einen Menschen oder anderen Bot weiterzuleiten.',
      wbiDesc: 'Begrüßt Besucher, versucht den Benutzer durch Absichtserkennung korrekt an einen Menschen oder anderen Bot weiterzuleiten.',
      taskDesc: 'hilft dem Benutzer automatisiert bei speziellen Aufgaben',
      faqDesc: 'Beantwortet Fragen ausführlich',
      notImpl: 'NICHT IMPLEMENTIERT',
      nextBtn: 'WEITER',
      cancelBtn: 'ABBRECHEN',
      backBtn: 'ZURÜCK',
      saveBtn: 'BOT SPEICHERN',
      forwarding: 'Wo wollen Sie direkt zu Konfiguration?',
      config: 'Konfiguration',

      //Overview
      search: 'Suche',
      reload: 'Neuladen',
      radioAll: 'alle',
      radioErr: 'Fehler',
      radioRna: 'lauffähig',
      radioRun: 'laufend',
      name: 'Botname',
      status: 'Status',
      firstBot: 'Erstelle deinen ersten Bot',
      noBot: 'Noch keine Bots verfügbar...',
      nofitting: 'keine passenden Bots',
      sec: 'Sekunde',
      min: 'Minute',
      hour: 'Stunde',
      yest: 'gestern',
      day: 'Tag',
      week: 'Woche',
      month: 'Monat',
      year: 'Jahr',
      ago: 'alt',
      plural: 'n',

      //FAQB Config
      IntPlaceH: 'Absicht',
      BotPlaceH: 'Antwort',
      SaveAnsBtn: 'Antwort speichern',
      SaveConfBtn: 'Bot speichern',
      errorEmptyFAQC: 'No empty fields',

      //WBConfig
      botRespPlaceH: 'Botantwort hinzufügen',
      saveConfBtn: 'speichern',

      //Config
      skillIDCardHeader: 'Was ist eine Skill ID?',
      skillIDCardBody: 'Eine Skill ID indentifiziert einen Bot. Auf diesem Weg ist es möglich einem Bot Nachrichten weiterzuleiten. Wenn ein Bot auch ohne dass an ihn weitergeleitet wird antworten soll, setzen Sie die Skill Id auf -1.',

      //other config
      notIncluded1: 'Bot not included in your plan.',
      notIncluded2: 'Buy lootboxes here to maybe get it.',

      //Chat
      send: 'senden',
    }, {
      overview: 'Overview',
      create: 'Create',
      logout: 'Logout',

      //login
      welcomeMessage: 'Welcome to Botforge',
      accId: 'Account ID',
      user: 'Username',
      pass: 'Password',
      remember: 'Remember me',

      //Create
      spinner1: 'Type',
      spinner2: 'Details',
      wb: 'Welcome Bot',
      wbi: 'Welcome Bot (Intent-based)',
      faq: 'FAQ-Bot',
      task: 'Task Assist Bot',
      wbDesc: 'Greets visitors, Tries to contain simple queries, Handoff to human staff or other bots',
      wbiDesc: 'Greets visitors, Tries to contain simple queries, Handoff to human staff or other bots',
      faqDesc: 'Chooses a task that is tedious for agents automation-suited',
      taskDesc: 'Answers questions of customers Concurrency unlimited',
      notImpl: 'NOT IMPLEMENTED YET',
      nextBtn: 'NEXT',
      cancelBtn: 'CANCEL',
      backBtn: 'BACK',
      saveBtn: 'SAVE BOT',
      forwarding: 'Where do you want to go to?',
      config: 'Config',

      //Overview
      search: 'Search',
      reload: 'auto reload',
      radioAll: 'all',
      radioErr: 'error',
      radioRna: 'runnable',
      radioRun: 'running',
      name: 'bot name',
      status: 'Status',
      firstBot: 'Create your first bot',
      noBot: 'No bot availiable yet...',
      nofitting: 'no fitting bots',
      sec: 'second',
      min: 'minute',
      hour: 'hour',
      yest: 'yesterday',
      day: 'day',
      week: 'week',
      month: 'month',
      year: 'year',
      ago: 'ago',
      plural: 's',

      //FAQB Config
      IntPlaceH: 'Intent',
      BotPlaceH: 'Bot',
      SaveAnsBtn: 'SAVE ANSWER',
      SaveConfBtn: 'SAVE CONFIG',
      errorEmptyFAQC: 'No empty fields',

      //WBConfig
      botRespPlaceH: 'add bot response',
      saveConfBtn: 'SAVE',

      //Config
      skillIDCardHeader: 'What is a Skill ID?',
      skillIDCardBody: 'The Skill ID identifies the Bot. You can forward messages to it that way. If you want the bot to answer to conversations without them beeing forwarded to it, you have to set it´s skill id to -1.',

      //other config
      notIncluded1: 'Bot not included in your plan.',
      notIncluded2: 'Buy lootboxes here to maybe get it.',

      //Chat
      send: 'send',
    }]
  }

}
