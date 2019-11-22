<template>
  <div id="test" :class="enabled ? 'enabled':'disabled'">
    <div v-if="enabled" id="enabled" >
      <div id="disconnectHeader" @click="disconnect">
        x
      </div>
      <div id="chat">
        <transition-group name="list">
          <div v-for="m in messages" :key="m.id" :id="'message' + m.type" >
            {{ m.message }}
          </div>
        </transition-group>
      </div>
      <form id="input" autocomplete="off" class="form-inline" onsubmit="return false">
        <div class="form-group">
          <input id="textline" type="text" v-model="message" class="form-control">
        </div>
        <button id="send" class="btn btn-default" @click="send">send</button>
      </form>
    </div>
    <div v-if="!enabled" @click="connect" :style="{ cursor: 'pointer'}" id="disabled">
      <img src="/static/lpchatw.jpeg" height="80px">
    </div>
  </div>
</template>

<script>
import { LPWs, LPUtils } from "../helpers/LPUtils.js";

export default {
  components: {},
  data: function() {
    return {
      enabled: false,
      account: 123,
      apiRequestTypes: [
        "cqm.SubscribeExConversations",
        "ms.PublishEvent",
        "cm.ConsumerRequestConversation",
        "ms.SubscribeMessagingEvents",
        "InitConnection",
        "cm.UpdateConversationField"
      ],
      messages: [],
      socket: null,
      message: "",
      openConvs: {},
      id: 0
    };
  },
  beforeDestroy() {
    this.disconnect();
  },
  methods: {
    add(newtext, type) {
      var inital = type;
      var newLineSplit = newtext.split("\n");
      newLineSplit.forEach(element => {
        if (element.replace(/ /g, "").length < 1) {
          return;
        }
        this.messages.push({
          message: element,
          type: type ? inital : "Error",
          id: this.id++
        });
        inital = type + "Later";
      });
      var chat = document.getElementById("chat");
      if (chat) {
        var isScrolledToBottom =
          chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 1;
        if (isScrolledToBottom) {
          setTimeout(() => {
            chat.scrollTop = chat.scrollHeight - chat.clientHeight;
          }, 10);
        }
      }
    },
    clear() {
      this.messages = [];
    },
    connect() {
      this.enabled = true;
      var account = this.$store.getters.loggedInAccountID;
      this.add("connecting to " + account + "... ");
      LPUtils.getJWT(account).then(
        jwt => {
          LPUtils.getDomain(account, "asyncMessagingEnt").then(
            umsDomain => {
              this.clear();
              this.add("Succesfully connected.");
              this.add("You can start a conversation!");
              LPWs.connect(
                "wss://" +
                  umsDomain +
                  "/ws_api/account/" +
                  account +
                  "/messaging/consumer?v=3"
              ).then(
                openedSocket => {
                  this.handleOpenedSocket(openedSocket, jwt);
                },
                errorOpening => {
                  console.log(errorOpening);
                  this.add("error opening connection " + errorOpening);
                }
              );
            },
            error => {
              this.add("Can`t connect to domain" + error);
            }
          );
        },
        errorGettingJwt => {
          this.add(errorGettingJwt + "getting jwt for account");
        }
      );
    },
    handleOpenedSocket(socket, jwt) {
      this.text = "";
      socket.registerRequests(this.apiRequestTypes);

      const me = this.myId(jwt);

      socket.initConnection({}, [
        { type: ".ams.headers.ConsumerAuthentication", jwt: jwt }
      ]);
      socket.onNotification(this.withType("MessagingEvent"), body =>
        body.changes.forEach(change => {
          switch (change.event.type) {
            case "ContentEvent":
              this.add(
                change.event.message,
                change.originatorId === me ? "Own" : "Agent"
              );
          }
        })
      );

      // subscribe to open conversations metadata
      socket
        .subscribeExConversations({
          convState: ["OPEN"]
        })
        .then(resp => {
          var openConvs = this.openConvs;
          socket.onNotification(
            this.withSubscriptionID(resp.body.subscriptionId),
            notificationBody =>
              this.handleConversationNotification(
                socket,
                notificationBody,
                openConvs
              )
          );
          this.socket = socket;
        });
    },

    send() {
      if (this.openConvs && this.socket) {
        if (Object.keys(this.openConvs)[0]) {
          this.publishTo(this.socket, Object.keys(this.openConvs)[0]);
        } else {
          this.socket
            .consumerRequestConversation()
            .then(resp =>
              this.publishTo(this.socket, resp.body.conversationId)
            );
        }
      } else {
        this.add("no connection");
      }
    },

    close() {
      if (this.openConvs && this.socket) {
        if (Object.keys(this.openConvs)[0]) {
          this.socket.updateConversationField({
            conversationId: Object.keys(this.openConvs)[0],
            conversationField: [
              {
                field: "ConversationStateField",
                conversationState: "CLOSE"
              }
            ]
          });
        }
      }
    },

    disconnect() {
      this.enabled = false;
      if (this.socket) {
        this.close();
        this.socket.ws.close();
        this.socket.ws.onclose = evt => this.onCloseSocket(this.socket, evt);
      }
      setTimeout(() => {
        this.clear();
        this.socket = null;
        this.openConvs = {};
      }, 300);
    },

    handleConversationNotification(socket, notificationBody, openConvs) {
      notificationBody.changes.forEach(change => {
        if (change.type === "UPSERT") {
          if (!this.openConvs[change.result.convId]) {
            this.openConvs[change.result.convId] = change.result;
            socket.subscribeMessagingEvents({
              fromSeq: 0,
              dialogId: change.result.convId
            });
          }
        } else if (change.type === "DELETE") {
          delete this.openConvs[change.result.convId];
          this.add("conversation was closed.");
        }
      });
    },

    onCloseSocket(socket, evt) {
      socket.ws = null;
    },

    publishTo(socket, convID) {
      socket
        .publishEvent({
          dialogId: convID,
          event: {
            type: "ContentEvent",
            contentType: "text/plain",
            message: this.message
          }
        })
        .then(resp => (this.message = ""));
    },

    withSubscriptionID(subscriptionID) {
      return notif => notif.body.subscriptionId === subscriptionID;
    },

    withType(type) {
      return notif => notif.type.includes(type);
    },

    myId(jwt) {
      return JSON.parse(atob(jwt.split(".")[1])).sub;
    }
  }
};
</script>

<style scoped>
.list-enter-active#messageAgent,
.list-enter-active#messageOwn {
  transition: all 0.4s;
}

.list-enter#messageAgent,
.list-enter#messageAgentLater {
  opacity: 0;
  transform: translateX(-300px);
}

.list-enter-active#messageAgentLater {
  transition: all 0.8s;
}

.list-enter#messageOwn {
  opacity: 0;
  transform: translateX(300px);
}

:focus {
  border: 0 !important;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
    0 0 8px rgba(213, 213, 213, 0.6) !important;
}

#chat {
  background: white;
  border-radius: 12px;
  height: 250px;
  overflow: auto;
  overflow-x: hidden;
}

#test {
  position: fixed;
  padding: 5px;
  right: 50px;
  bottom: 50px;
  border-radius: 45px;
}

#disconnectHeader {
  text-indent: 425px;
  cursor: pointer;
}

#test.disabled:hover,
#test.enabled {
  /* background: rgba(213, 213, 213, 1); */
  background: white;
  overflow: hidden;
}

#test.enabled {
  border-radius: 15px;
  background: #d3d3d3;
}

#test.disabled {
  /* background: rgba(213, 213, 213, 1); */
  background: white;
  overflow: hidden;
}

#disabled {
  width: 80px;
  height: 80px;
}

#enabled {
  width: 450px;
  height: 325px;
}

#input {
  position: absolute;
  bottom: 4px;
}

#input > div > input {
  width: 345px;
}

#messageAgentLater,
#messageAgent,
#messageOwn {
  margin: 5px;
  border-radius: 12px;
  padding: 5px;
  font-size: 12pt;
}

#messageAgentLater,
#messageAgent {
  font-weight: medium;
  margin-right: 70px;
  background: rgba(255, 114, 11, 0.2);
}

#messageAgentLater {
  margin-left: 30px;
  font-size: 11pt;
}

#messageOwn {
  text-align: right;
  width: auto;
  font-style: italic;
  margin-left: 70px;
  background: rgba(255, 114, 11, 0.5);
}
#messageError {
  text-align: center;
  font-size: 10pt;
  margin-left: 75px;
  width: 300px;
  color: gray;
}
</style>

