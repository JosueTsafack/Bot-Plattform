import { Selector } from 'testcafe';

export default class IndexPage {
    constructor() {
        this.botNameInput = Selector('#name'); // create.vue line 85
        this.accountIDInput = Selector('#accountID'); //login.vue line 8
        this.UsernameInput = Selector('#userName'); //login.vue line 10
        this.PasswordInput = Selector('#password'); //login.vue line 12
        this.botInput = Selector('#botInput'); //WBConfig.vue line 5
        this.userInput = Selector('#userInput'); //WBConfig.vue line 7
        this.reloadButton = Selector('#reloadButton'); // ???
        this.loginButton = Selector('#loginButton'); //login.vue line 20
        this.saveButtonConfig = Selector('#save');
        this.saveButtonFinal = Selector('#saveFinal'); //WBConfig.vue line 12
        this.createNext = Selector('#createNext'); // create.vue line 91
        this.configNext = Selector ('#configNext') // create.vue line 96
        this.appendButton = Selector('#circ0'); // WBConfig.vue line 9
        this.menuButton = Selector('#menu'); // App.vue line 21
        this.cancerConfig = Selector('#cancerConfig');
        this.cancerCreate = Selector('#cancerCreate')
        this.backButtonCreate = Selector('#cancerFinal');
        this.confirmDelete = Selector('#confirmDelete');
        this.abortDelete = Selector('#abortDelete');
        this.editNode = Selector('#editNode');
        this.deleteNode = Selector('#dele0/0')
        this.welcomeSelector = Selector('#Welcome_Bot')
        this.faqSelector = Selector('FAQ_Bot')
        this.filter = Selector('#Filter')
        this.successBar = Selector('#success')
        this.overviewRefer = Selector('#toOverview')
        this.configRefer = Selector('#toConfig')
        

        this.error = Selector('#error');

        this.linkCreate = Selector('#Create'); //app.vue line 11
        this.linkOverview = Selector('#Overview'); //app.vue line 9
        this.linkLogoutCorner = Selector('#logout'); //app.vue line 17


        this.deleteButton = Selector('#botTable').find('#buttons').find('#delete')
        this.disabledDelete = Selector('#botTable').find('#buttons').find('#disabledDelete')
        this.editButton = Selector('#botTable').find('#buttons').find('#edit')
        this.retryButton = Selector('#botTable').find('#buttons').find('#retry')
        this.startButton = Selector('#botTable').find('#buttons').find('#start')
        this.disabledStart = Selector('#botTable').find('#buttons').find('#disabledStart')
        this.stopButton = Selector('#botTable').find('#buttons').find('#stop')

        this.testCafeBotCreate = Selector('#row').withText('!testCafeBotCreate!')
        this.finalCancelBot = Selector('#row').withText('!finalCancelBot!')
        this.testCafeBot = Selector('#row').withText('!testCafeBot!')
        this.deleteNameBot = Selector('#row').withText('!deleteNameBot!')
        this.botEdited = Selector('#row').withText('!botEdited!')

        this.node = Selector('#rect0').withText('testyTestInitial');
        this.nodeTwo = Selector('#rect0/0')
        this.statusStopped = Selector('#row').withText('!testCafeBot!').find('#stoppedID')
        this.statusRunning = Selector('#row').withText('!testCafeBot!').find('#runningID')
        this.statusRunnable = Selector('#row').withText('!testCafeBot!').find('#runnableID')
        this.statusLoading = Selector('#row').withText('!testCafeBot!').find('#loadingID')

        this.headerMenu = Selector('#header');







    }
}