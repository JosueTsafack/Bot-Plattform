require('dotenv').config();
//import the sdk 
const { Agent } = require('node-agent-sdk');

// Used to transform the existing callback based functions into promise based functions
const { promisify } = require('util');

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = process.env.mongoUrl || "mongodb://db:27017/BotschmiedeDB";

//get the skillid and the config of the Bot from the db
function getJSON() {
    return new Promise((resolve, reject) => {
        // Use connect method to connect to the Server
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) reject(err);
            db.collection("botList").findOne({ BotId: parseInt(process.env.BOT_ID) }, function (err, result) {
                if (err) reject(error);
                var conf;
                var skillid;
                if (result.config == null || result.skillid == null) {
                    conf = { bot: "This bot isn´t configured yet...", children: [] }
                    skillid = { skillid: -2 }
                }
                else {
                    var configAndskillid = [];

                    conf = JSON.stringify(result.config);
                    skillid = JSON.stringify(result.skillid)
                    configAndskillid.push(conf);
                    configAndskillid.push(skillid)

                }
                db.close();
                resolve(configAndskillid);
            });
        });
    });
}

/**
 * define the states of the convesation
 */
var iNumberOfIncorrectCommandsTyped = 0;
var bUserWantToCloseConversation = false;


// initialize the bot
class FAQ_Bot {
    constructor(configAndskillid, csds = process.env.LP_CSDS) {
        this.accountId = process.env.accountID;
        this.username = process.env.username;
        this.password = process.env.password;
        this.config = JSON.parse(configAndskillid[0]);
        this.node = JSON.parse(configAndskillid[0]);

        this.skillid = JSON.parse(configAndskillid[1]);

        this.isConnected = false;
        this.myAgent = new Agent({ accountId: this.accountId, username: this.username, password: this.password, csdsDomain: csds });//initialize the new Bot
        this.openConversations = {};

        this.init();
    }

    //Initialized the event handler.
    init() {
        this.myAgent.on('connected', () => {
            this.isConnected = true;
            //  closeConversation = true; // this is the key
        });

        this.myAgent.on('error', err => {
            this.isConnected = false;
            console.error('Connection to UMS closed with err', err.message);
        });


        // get in here when the Bot joins the conversation
        this.myAgent.on('cqm.ExConversationChangeNotification', body => {

            body.changes
                .filter(change => change.type === 'UPSERT' && !this.openConversations[change.result.convId]) // you gotta filter the change for the Bot not to answer forever
                .forEach(change => {
                    // join if the skill Id is equal to yours, 'UPSERT' and filter is only used in the block 'cqm.ExConversationChangeNotification'
                    if (change.type === 'UPSERT' && change.result.conversationDetails.skillId == this.skillid) {
                        // TODO if  !this.openConversations[change.result.convId] (get a conversation that doesn't exist)

                        this.openConversations[change.result.convId] = change.result.conversationDetails;
                        this.joinConversation(change.result.convId, 'MANAGER');
                        this.sendMessage(change.result.convId, initialBotMessage());
                        console.log("FAQ successfully joined the conversation")

                    } else if (change.type === 'DELETE' && this.openConversations[change.result.convId]) {

                        delete this.openConversations[change.result.convId];
                        console.log("conversation was closed\n");
                        iNumberOfIncorrectCommandsTyped = 0;

                    }
                });
        });


        this.myAgent.on('ms.MessagingEventNotification', body => {

            body.changes
                /**don't filter in the 'ms.MessagingEventNotification' block */
                // .filter(change => change.type === 'UPSERT' && this.openConversations[body.dialogId].skillid == this.skillid)
                .forEach(change => {
                    // react only when the sends a message 
                    if (change.event.type === 'ContentEvent' && this.openConversations[body.dialogId]) {

                        //(TODO) the bot doesn't enter here to overtake the conversation, because i filtered but nothing
                        if (body.changes[0].__isMe === false && body.changes[0].originatorMetadata.role !== "ASSIGNED_AGENT" && this.openConversations[body.dialogId].skillId == this.skillid) {

                            var sCommandTypedByUser = body.changes[0].event.message,
                                bUserCommandFound = false;

                            var myConfig = JSON.parse(myBot.node);
                            var counter = 0;
                            var bEnterLoops = true;
                            while (counter < myConfig.length && bEnterLoops) {

                                var sIntent = myConfig[counter].intent,
                                    sAnswer = myConfig[counter].answer;

                                var intentArray = sIntent.split(" ");

                                for (var i = 0; i < intentArray.length; i++ && bEnterLoops) {
                                    console.log("how many times did i get in here")
                                    // TODO the user message musst contain the entire content in order to be recognized by the Bot
                                    if ( sCommandTypedByUser.toLowerCase().includes(intentArray[i].toLowerCase())   && bEnterLoops) {
                                        this.sendMessage(body.dialogId, sAnswer);
                                        bUserCommandFound = true;
                                        iNumberOfIncorrectCommandsTyped = 0;
                                        setNodeToRoot();
                                        bEnterLoops = false;                                                        
                                    }                                                          
                                }                              
                                counter++;
                            }
                            if (!bUserCommandFound) {
                                iNumberOfIncorrectCommandsTyped += 1;

                                if (sCommandTypedByUser !== "ja") {
                                    this.sendMessage(body.dialogId, "Unfortunately i cannot answer this question\n please ask another question! ");
                                }

                                if (iNumberOfIncorrectCommandsTyped == 3) {
                                    this.sendMessage(body.dialogId, "Do you want to close this conversation?(ja)\n");
                                }


                                if (iNumberOfIncorrectCommandsTyped > 3) {
                                    if (sCommandTypedByUser === "ja") {

                                        if (iNumberOfIncorrectCommandsTyped == 4) {
                                            this.sendMessage(body.dialogId, " This bot will be disconnected?(ja)\n");

                                            bUserWantToCloseConversation = true; // enter the next block " this.myAgent.on('cqm.ExConversationChangeNotification', body => { " on the next message of the user
                                        }
                                        if (sCommandTypedByUser === "ja" && iNumberOfIncorrectCommandsTyped > 4) {
                                            this.sendMessage(body.dialogId, "conversation was closed.\n This bot will is now disconnected ");
                                            iNumberOfIncorrectCommandsTyped = 0;
                                            this.openConversations[body.dialogId].skillId = -1;
                                            //delete this.openConversations[body.dialogId]; // close the conversation and to delete all temporary data of it
                                            
                                        }
                                    }
                                    else {
                                        this.sendMessage(body.dialogId, " invalid input, please enter 'ja' to close the conversation");
                                        iNumberOfIncorrectCommandsTyped = 0;
                                        bUserCommandFound = false;
                                    }
                                }
                            }
                        }
                    }//
                });
        });

        this.promisifyFunctions();

    }// end of the init() method

    //Utility function which transforms the used SDK functions into promise-based ones, which later get consumed by other functions.
    promisifyFunctions() {
        this.subscribeExConversations = promisify(this.myAgent.subscribeExConversations);
        this.publishEvent = promisify(this.myAgent.publishEvent);
        this.setAgentState = promisify(this.myAgent.setAgentState);
        this.updateConversationField = promisify(this.myAgent.updateConversationField);
    }

    // to start the Bot
    async start() {
        if (!this.myAgent) this.myAgent = new Agent({ accountId: this.accountId, username: this.username, password: this.password, 'csdsDomain': this.csds });

        while (!this.isConnected) { // make the server answer
            await timeout(3000);
        }
        let response;
        response = await this.setStateOfAgent('AWAY');
        response = await this.subscribeToConversations();
    }

    //Shutsdown the bot
    stop() {
        this.myAgent.dispose();
        this.myAgent.removeAllListeners();
        this.myAgent = null;
    }


    //This functions allows the agent to subscribe to conversation.
    // convState is the conversation state for which should be subscribed
    // agentOnly if set it will only subscribe to conversation in which the agent is or which are suitable for his skills
    async subscribeToConversations(convState = 'OPEN', agentOnly = true) {
        if (!this.isConnected) return;
        return await this.myAgent.subscribeExConversations({ 'convState': [convState] });
    }

    //This functions allows to set the state of the agent, this is important for the routing of incomming messages.
    // state is the state of the agent (ONLINE,OFFLINE,AWAY)
    async setStateOfAgent(state = 'ONLINE') {
        if (!this.isConnected) return;
        return await this.myAgent.setAgentState({ availability: state });
    }

    // This function is used to join a conversation.
    // conversationId is the id of the conversation which should be joined
    // role is the role of the agent (AGENT, MANAGER)
    async joinConversation(conversationId, role = 'AGENT') {
        if (!this.isConnected) return;
        return await this.myAgent.updateConversationField({
            'conversationId': conversationId,
            'conversationField': [{
                'field': 'ParticipantsChange',
                'type': 'ADD',
                'role': role
            }]
        });
    }

    //conversationId is id of the conversation which should be joined
    //message is the message which will be sent to the user
    async sendMessage(conversationId, message) {
        if (!this.isConnected) return;
        return await this.myAgent.publishEvent({
            dialogId: conversationId,
            event: {
                type: 'ContentEvent',
                contentType: 'text/plain',
                message: message
            }
        });
    }
} // end of the class

// to set the time out and make the Bot answer
function timeout(ms = 3000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// get the user option and send them the corresponding message back
function nextBotMessage(optionNumber) {
    node = node.children[optionNumber - 1].children[0]; // to turn the chosen option into the current root node
    var answer = "";
    var counter = 0;
    answer += myBot.node.bot + "\n" + "           ";

    while (counter < myBot.node.children.length) {
        answer += myBot.node.children[counter].bot + "\n" + "           ";
        counter++;
    }
    return answer;
}

// the initial message
function initialBotMessage() {
    var answer = "Hallo, i'm the FAQ_Bot, how can i help you?";
    return answer;
}



// to get the infos of the user
function getParticipantInfo(convDetails, participantId) {
    return convDetails.participants.filter(p => p.id === participantId)[0];
}


// to set the current node back as the initial root node
function setNodeToRoot() {
    myBot.node = myBot.config;
}




// save the new question into the database
function saveNewQuestion(questionToSave) {
    console.log("the question is being saved");
}

let myBot = getJSON().then(configAndskillid => {
    console.log('Starting the FAQ_Bot bot...');
    console.log("config of this FAQ_Bot : " + configAndskillid[0]);
    console.log("skill id of this FAQ_Bot : " + configAndskillid[1]);
    myBot = new FAQ_Bot(configAndskillid);
    myBot.start();
}).then(_ => console.log('the FAQ_Bot is running!'));