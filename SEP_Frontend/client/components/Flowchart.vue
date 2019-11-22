<template>
  <div id="wrapper">
    <!-- svg for flowchart -->
    <svg xmlns="http://www.w3.org/2000/svg" id="Flowchart" >
      <!-- path to cut of the text if its too long -->
      <clipPath id="clip1">
        <rect x="5" y="5" width="170" height="90" />
      </clipPath>
      <!-- node creation loop -->
      <g :transform="'scale(' + zoom + ')'">
        <g v-for="n in arr" :key="n.id" :id="'node' + n.id" :transform="'translate('+ n.data.x +',' + n.data.y +')'">
          <!-- main body of the nodes -->
          <rect fill="#ffffff" stroke="#222222" x="5" y="5" width="180" height="80" rx="10" ry="10" :id="'rect' + n.id" class="rect" @mousedown="edit(n.id)" />
          <g v-if="n.id === '0'">
            <text x="70" y="-15" width="160" height="auto">
              <tspan id="Start">Start</tspan>
            </text>
          </g>
          <!-- Text field -->
          <foreignObject class="textWrapper" x="10" y="10" width="170">
            <div :id="'bot_' + n.id" class="text" @mousedown="edit(n.id)" xmlns="http://www.w3.org/1999/xhtml">
              <tspan id="handle" >Bot: </tspan>
              {{ n.data.bot }}
            </div>
          </foreignObject>
          <g>
            <!-- add buttons -->
            <circle class="add" fill="#ffffff" stroke="#222222" cx="94" cy="85" r="12" :id="'circ' + n.id" @mousedown="appendNode($event)"
            />
            <path stroke="#222222" d="M94 80 l0 10" />
            <path stroke="#222222" d="M89 85 l10 0" />
          </g>
          <!-- trash icon -->
          <g v-if="n.id!= '0' && n.id === currId" transform="scale(0.025,0.025) translate(6300, -950)">
            <circle fill="none" stroke="none" stroke-width="30" cx="480" cy="350" r="900" :id="'dele' + n.id" @click="deleteNode(n.id)"
            />
            <path
              d="M793.6 102.4h-179.2v-25.6c0-42.347-34.453-76.8-76.8-76.8h-102.4c-42.347 0-76.8 34.453-76.8 76.8v25.6h-179.2c-42.347 0-76.8 34.453-76.8 76.8v51.2c0 33.373 21.403 61.829 51.2 72.397v644.403c0 42.349 34.453 76.8 76.8 76.8h512c42.349 0 76.8-34.451 76.8-76.8v-644.403c29.797-10.568 51.2-39.024 51.2-72.397v-51.2c0-42.347-34.451-76.8-76.8-76.8zM409.6 76.8c0-14.115 11.485-25.6 25.6-25.6h102.4c14.115 0 25.6 11.485 25.6 25.6v25.6h-153.6v-25.6zM742.4 972.8h-512c-14.115 0-25.6-11.485-25.6-25.6v-640h563.2v640c0 14.115-11.485 25.6-25.6 25.6zM819.2 230.4c0 14.115-11.485 25.6-25.6 25.6h-614.4c-14.115 0-25.6-11.485-25.6-25.6v-51.2c0-14.115 11.485-25.6 25.6-25.6h614.4c14.115 0 25.6 11.485 25.6 25.6v51.2z"
              @click="deleteNode(n.id)"/>
            <path
              d="M640 358.4c-14.139 0-25.6 11.462-25.6 25.6v512c0 14.139 11.461 25.6 25.6 25.6s25.6-11.461 25.6-25.6v-512c0-14.138-11.461-25.6-25.6-25.6z"
              @click="deleteNode(n.id)"/>
            <path
              d="M486.4 358.4c-14.138 0-25.6 11.462-25.6 25.6v512c0 14.139 11.462 25.6 25.6 25.6s25.6-11.461 25.6-25.6v-512c0-14.138-11.462-25.6-25.6-25.6z"
              @click="deleteNode(n.id)"/>
            <path
              d="M332.8 358.4c-14.138 0-25.6 11.462-25.6 25.6v512c0 14.139 11.462 25.6 25.6 25.6s25.6-11.461 25.6-25.6v-512c0-14.138-11.462-25.6-25.6-25.6z"
              @click="deleteNode(n.id)"/>
          </g>
          <!-- path to the children nodes -->
          <g :transform="'translate(-'+ n.data.x +',-' + n.data.y+')'">
            <path v-for="c in n.children"
                  :d="'M'+ (n.data.x + 94) +' '+ (n.data.y + 105)
                    +' L' + (n.data.x + 94) +' '+ (c.data.y -30)
                  +' L' + (c.data.x + 94) +' '+ (c.data.y -30)
            +' L' + (c.data.x + 94) +' '+ (c.data.y -10)" stroke="black" stroke-width="1" fill="none" :key="c.data.x" />
          </g>
          <!-- add Endnode -->
          <g v-if="n.children.length == 0 && !n.data.end" :transform="'translate(-'+ n.data.x +',-' + n.data.y+')'">
            <path stroke="#444444" stroke-width="1" fill="none" :d="'M'+ (n.data.x + 94) +' '+ (n.data.y + 105)
            +' L' + (n.data.x + 94) +' '+ (n.data.y +120)" />
            <circle fill="#ffffff" stroke="#444444" :cx="n.data.x + 94" :cy="n.data.y + 140" r="12" @click="addEnd(n.id)" />
          </g>
          <!-- actual endnode -->
          <g v-if="n.data.end" :transform="'translate(-'+ n.data.x +',-' + n.data.y+')'">
            <path stroke="black" stroke-width="1" fill="none" :d="'M'+ (n.data.x + 94) +' '+ (n.data.y + 105)
              +' L' + (n.data.x + 94) +' '+ (n.data.y +120)" />
            <foreignObject :x="n.data.x + 25" :y="n.data.y + 130" width="80" height="100">
              <div xmlns="http://www.w3.org/1999/xhtml">
                <span id="Skill"> Skill Id </span>
                <input id="input" type="number" v-model="n.data.end" style="width:120px">
              </div>
            </foreignObject>
          </g>
        </g>
      </g>
      <g>
        <circle class="zoomIn" fill="#ffffff" stroke="#222222" cx="15" cy="15" r="10" @click="zoomIn"
        />
        <path stroke="#222222" d="M15 10 l0 10" @click="zoomIn"/>
        <path stroke="#222222" d="M10 15 l10 0" @click="zoomIn"/>

        <circle class="zoomOut" fill="#ffffff" stroke="#222222" cx="40" cy="15" r="10" @click="zoomOut"
        />
        <path stroke="#222222" d="M35 15 l10 0" @click="zoomOut"/>
      </g>
    </svg>
  </div>
</template>

<script>
import Arboreal from "../helpers/Arboreal.js";
export default {
  data: function() {
    return {
      id: 0,
      zoom: 1
    };
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.resize);
      this.resize();
    });
    this.resize();
  },
  methods: {
    zoomOut() {
      this.zoomF(2 / 3);
    },
    zoomIn() {
      this.zoomF(3 / 2);
    },
    zoomF(factor) {
      this.zoom *= factor;
      this.resize();
    },
    /**
     * triggerd on the resising of the window
     */
    resize() {
      this.$store.commit("setNewConfig", this.updateCoordinates(this.parse()));
    },
    /**
     * @returns a parsed tree object
     */
    parse() {
      var conf = this.getNodes().config;
      var tree = null;
      if (conf) {
        if ("depth" in conf) {
          tree = conf;
        } else {
          tree = Arboreal.parse(this.getNodes().config, "children");
        }
      } else {
        tree = new Arboreal().appendChild({
          children: [],
          user: "start Node",
          bot: "--",
          x: 500,
          y: 150
        });
      }
      return tree;
    },
    addEnd(id) {
      var tree = this.parse();
      tree.find(id).data.end = 123456789;
      tree.find(id).children = [];
      this.$store.commit("setNewConfig", this.updateCoordinates(tree));
      this.resize();
    },
    edit(id) {
      //edit before switching to next node
      if (this.bot) {
        var tree = this.parse();
        tree.find(this.currId).data.bot = this.bot;
        this.$store.commit("setNewConfig", tree);
      }
      //deactivate nodes
      while (document.querySelector("rect.active")) {
        document.querySelector("rect.active").classList.value = "none";
      }
      //activate node with id
      document.getElementById("rect" + id).classList.value = "active";
      this.addNode(id);
      if (this.parse().find(id)) {
        this.$store.commit("bot", this.parse().find(id).data.bot);
      }
    },
    getNodes() {
      return this.$store.getters.getBot;
    },
    addNode(id) {
      this.id = id;
      this.$store.commit("setNodeId", id);
    },
    deleteNode(id) {
      this.getNodes()
        .config.find(id)
        .remove();
      this.$store.commit("setNewConfig", this.updateCoordinates(this.parse()));
    },
    appendNode(event) {
      this.addNode(event.toElement.id.slice(4));
      var tree = this.parse();
      if (tree.find(this.currId).data.end) {
        delete tree.find(this.currId).data.end;
      }
      tree.find(this.currId).appendChild({
        children: [],
        bot: "",
        x: 500,
        y: 150
      });
      tree = this.updateCoordinates(tree);
      this.$store.commit("setNewConfig", tree);
    },
    updateCoordinates(tree) {
      var arr = [];
      //fill arr with information about each row of the flowchart
      tree.traverseDown(node => {
        if (arr[node.depth]) {
          arr[node.depth].count++;
          if (node.data.end) {
            arr[node.depth].endNode = 2;
          } else {
            arr[node.depth].endNode = node.children.length == 0 ? 1 : 0;
          }
        } else {
          arr[node.depth] = {
            count: 1,
            done: 0,
            endNode: node.children.length == 0 ? 1 : node.data.end ? 2 : 0
          };
        }
      });
      //traverse the tree to set each node to the correct position
      var total = 1000;
      tree.traverseDown(node => {
        if (!node.depth || node.depth == 0) {
          node.data.x = 0;
          node.data.y = 30;
        }
        if (node.children.length > 0) {
          if (document.querySelector("#Flowchart")) {
            total =
              document.querySelector("#Flowchart").getBoundingClientRect()
                .width / this.zoom;
          }
          for (var i = 0; i < node.children.length; i++) {
            var interval = total / arr[node.depth + 1].count;
            node.children[i].data.x = interval * arr[node.depth + 1].done;
            var dist = 0;
            if (arr[node.depth].endNode == 2) {
              dist = 250;
            } else {
              dist = arr[node.depth].endNode > 0 ? 200 : 150;
            }
            node.children[i].data.y = node.data.y + dist;
            arr[node.depth + 1].done++;
          }
        }
      });
      tree.data.x = 100;
      return tree;
    }
  },
  computed: {
    bot: {
      get() {
        return this.$store.getters.getBotInput;
      },
      set(val) {
        this.$store.commit("bot", val);
      }
    },
    currId: {
      get() {
        return this.$store.getters.getCurrNodeId;
      },
      set(id) {
        this.$store.commit("setNodeId", id);
      }
    },
    currName() {
      return this.$store.getters.getCurrName;
    },
    arr() {
      var conf = this.getNodes().config;
      if (!conf) {
        return new Arboreal().appendChild({
          children: [],
          user: this.user,
          bot: this.bot,
          x: 500,
          y: 150
        });
      }
      if ("depth" in conf) {
        return conf.toArray();
      } else {
        var update = this.updateCoordinates(Arboreal.parse(conf, "children"));
        this.$store.commit("setNewConfig", update);
        return update.toArray();
      }
    }
  }
};
</script>

<style scoped>
.rect {
  z-index: 50;
}

.text {
  overflow: hidden;
  word-wrap: break-word;
  max-height: 60px;
}

.textWrapper {
  font-size: 15px;
}

#wrapper {
  width: calc(100% - 350px);
  height: 80vh;
  overflow: scroll;
}
svg {
  width: 100%;
  height: 95%;
}

#handle {
  font-weight: bold;
  fill: gray;
}

circle {
  pointer-events: bounding-box;
}

#Skill {
  margin-left: 10px;
}

#input {
  border-radius: 5px;
  border: solid 1px black;
}

.add:hover {
  stroke: #ff720b;
  stroke-width: 1.5;
}

rect:hover,
rect.active {
  stroke: #ff720b;
  stroke-width: 2;
}

text {
  max-width: 50px;
}
</style>
