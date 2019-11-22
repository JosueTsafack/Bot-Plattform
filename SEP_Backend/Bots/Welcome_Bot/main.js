require('dotenv').config();

//import the sdk 
const { Agent } = require('node-agent-sdk');

// Used to transform the existing callback based functions into promise based functions
const { promisify } = require('util');

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = process.env.mongoUrl || "mongodb://db:27017/BotschmiedeDB";


function getJSON() {
    console.log(mongoUrl);
    return new Promise((resolve, reject) => {
        // Use connect method to connect to the Server
        MongoClient.connect(mongoUrl, function (err, db) {
            if (err) reject(err);
            db.collection("botList").findOne({ BotId: parseInt(process.env.BOT_ID) }, function (err, result) {
                if (err) reject(error);
                var conf;
                var skillid;
                if (result.config == null) {
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

function timeout(ms = 3000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// get the user option and send them the corresponding message back
function nextBotMessage(optionNumber) {
    myBot.node = myBot.node.children[optionNumber - 1]; // to turn the chosen option into the current root node
    var answer = "";
    var counter = 0;
    console.log(myBot.node)
    answer += myBot.node.bot + "\n" + "           ";

    while (counter < myBot.node.children.length) {
        answer += myBot.node.children[counter].bot + "\n" + "           ";
        counter++;
    }

    // TODO set transferToAnotherSkill to true when you get to the end of your config tree @@@@@@@@@@@@@@@@@@@@@@@@@@
    return answer;
}

// the initial message
function initialBotMessage() {
    var answer = "";
    var counter = 0;
    answer += myBot.node.bot + "\n" + "           ";
    var numberTheOptions = 1;
    while (counter < myBot.node.children.length) {

        answer += numberTheOptions + ". " + myBot.node.children[counter].bot + "\n" + "           ";
        numberTheOptions++;
        counter++;
    }
    return answer;
}

// // the initial conversation field
// let openConvs = {};

// initialize the bot
class Welcome_Bot {
    constructor(configAndskillid, csds = process.env.LP_CSDS) {
        this.accountId = process.env.accountID;
        this.username = process.env.username;
        this.password = process.env.password;
        this.config = JSON.parse(configAndskillid[0]); // to use later to set the current node to the root node
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

        });

        // in case the bot crashes,  restart it automatically
        this.myAgent.on('closed', data => {
            console.log('socket closed', data);
            this.myAgent.reconnect();//regenerate token for reasons of authorization (data === 4401 || data === 4407)
        });

        this.myAgent.on('error', err => {
            this.isConnected = false;

            console.error('Connection to UMS closed with err', err.message);
        });


        // get in here when the Bot joins the conversation
        this.myAgent.on('cqm.ExConversationChangeNotification', body => {

            body.changes
                .forEach(change => {
                    if (change.type === 'UPSERT' && !this.openConversations[change.result.convId]) {

                        this.openConversations[change.result.convId] = change.result.conversationDetails;
                        this.joinConversation(change.result.convId, 'MANAGER');
                        this.sendMessage(change.result.convId, initialBotMessage());

                    } else if (change.type === 'DELETE' && this.openConversations[change.result.convId]) {

                        delete this.openConversations[change.result.convId];
                        console.log("conversation was closed\n");
                        setNodeToRoot();
                    }
                });
        });


        //This function is used to find out what the user wants to send and send the right message
        this.myAgent.on('ms.MessagingEventNotification', body => {

            body.changes
                //     .filter(change => change.type === 'UPSERT' && this.openConversations[change.result.convId])
                .forEach(change => {
                    // react only when the sends a message, i mean , a message , so don't enter here anytime
                    if (change.event.type === 'ContentEvent' && this.openConversations[body.dialogId]) {

                        var conversationId = body.dialogId;
                        if (body.changes[0].__isMe === false && body.changes[0].originatorMetadata.role !== "ASSIGNED_AGENT" && this.openConversations[conversationId].skillId == this.skillid) { // don't send answer forever and only answer when skillid ='-1' 

                            if (body.changes[0].event.message !== NaN && body.changes[0].event.message < myBot.node.children.length + 1 && body.changes[0].event.message > 0) {
                                // the user entered one of the suggested bots
                                this.sendMessage(conversationId, nextBotMessage(body.changes[0].event.message));

                                // check each time whether the current children array contains end
                                if (myBot.node.end !== '') {
                                    // do the transfer
                                    console.log("transfer started!")
                                    console.log("abc " + myBot.node.end)
                                    const transferBody = {
                                        conversationId: conversationId,
                                        conversationField: [
                                            {
                                                field: 'Skill',
                                                type: 'UPDATE',
                                                skill: myBot.node.end
                                            }
                                            ,
                                            {
                                                field: 'ParticipantsChange',
                                                type: 'REMOVE',
                                                role: 'MANAGER',
                                                userId: this.myAgent.__oldAgentId
                                            }
                                        ]
                                    };
                                    this.myAgent.updateConversationField(transferBody, (err, res) => {
                                        // Handle potential error
                                        if (err) {
                                            console.log("transfer failed with the following erro : \n");
                                            console.log(err);
                                            this.sendMessage(conversationId, "sorry, the corresponding Bot isn't available");
                                            setNodeToRoot();
                                            this.openConversations[conversationId].skillId = this.skillid; // reset the skillid to -1
                                        } else {
                                            console.log("transfer successful!")
                                            this.openConversations[conversationId].skillId = myBot.node.end;
                                            console.log("the new skill id : " + this.openConversations[conversationId].skillId);                                            
                                            //this.leaveConversation(conversationId);       
                                            
                                        }
                                    });
                                } // end of the transfer block

                            } else {
                                this.sendMessage(conversationId, initialBotMessage());
                            }
                        }
                    }
                }); //
        });


        this.promisifyFunctions();

    } // end of the init() method


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
        this.isConnected = false;
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



    // to delete all temporary data of the conversation and leave it.
    async leaveConversation(conversationId) {
        delete this.openConversations[conversationId];
        console.log("conversation left");
        this.openConversations[conversationId] = null;
        return;
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

// to get the infos of the user
function getParticipantInfo(convDetails, participantId) {
    return convDetails.participants.filter(p => p.id === participantId)[0];
}

// to set the current node back as the initial root node
function setNodeToRoot() {
    myBot.node = myBot.config;
}


let myBot = getJSON().then(configAndskillid => {
    console.log('Starting the Welcome Bot...');
    console.log("config of this Welcome Bot : " + configAndskillid[0]);
    console.log("skill id of this Welcome Bot : " + configAndskillid[1]);
    myBot = new Welcome_Bot(configAndskillid);
    myBot.start();
})
    .then(_ => console.log('the Welcome_Bot is running!'));
