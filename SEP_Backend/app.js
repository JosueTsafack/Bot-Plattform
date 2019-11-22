require('dotenv').config();

var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert');
var cors = require('cors');
var Docker = require('dockerode');
var request = require('request');
var axios = require('axios');
var fs = require('fs');

const socketPath = (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock');
const docker = new Docker({ socketPath });
var mongoUrl = process.env.mongoUrl || "mongodb://localhost:27017/BotschmiedeDB"; //"mongodb://db:27017/BotschmiedeDB";
var port = (process.env.port || process.env.PORT || 3000);


var app = express();
app.use(bodyParser.json()); 
app.use(cors());

var server = app.listen(port, function () {
  console.log("The Backend Server is running on Port %s!", port);
})

// Try to connect to the database
MongoClient.connect(mongoUrl, function (err, db) {
  assert.equal(null, err);
  console.log("Database connection successfully tested.");
  db.close();
});

// Deploy new Bot 
app.post("/newbot", function (req, res) {
  // Auth (token) res.status(401).send('Unauthorized');
  if (!req.body.name || !req.body.type) {
    res.status(400).send('Invalid arguments!');
    return;
  }

  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    var date = new Date(); // to display the current date

    db.collection("counter").findOne(function (err, result) {
      if (result == null) {
        result = {
          counter: Math.floor(Math.random()*1000+10)
        }
        db.collection("counter").insert({counter: result.counter});
      }
      db.collection("counter").update({}, { counter: result.counter + 1 }, { multi: false });

      var bot = {
        BotId: result.counter + 1,
        type: req.body.type,
        status: "runnable",
        name: req.body.name,
        user: req.body.user,
        config: req.body.config,
        chips: req.body.chips,
        date: date.toUTCString(),
        skillid: -1 // for testing purpose //req.body.skillId
      };

      if (typeof bot.type === 'undefined' || typeof bot.name === 'undefined' || typeof bot.skillid === 'undefined') {
        res.status(400).send();
      } else {
        db.collection("botList").insertOne(bot, function (err, result) {
          if (err) throw err;
          console.log("Added 1 Bot into Collection botList");
          res.status(201).send({ BotId: bot.BotId });
        });
      }
      db.close();
    });
  });
})

  // List all Bots with their informations 
  .get("/all", function (req, res) {
    var reqUser = req.headers.authorization;
    var query = { user: reqUser };
    console.log('req.headers = ' + JSON.stringify(req.headers));
    console.log("User = " + reqUser);
    if (typeof reqUser === 'undefined') {
      query = {};
    }
    // TODO: Send botinformation to frontend 
    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;
      //Find all documents in the botsList collection:
      db.collection("botList").find(query).toArray(function (err, result) {
        err ? res.status(401).send('Unauthorized') : (res.status(201).json(result) === null ?
          res.status(201).json(result) : console.log('no Bot to reload! ')); // in case there's no bots left
        db.close();
      });
    });
  })

  // Bot state 
  .get("/bot/:ID", function (req, res) {
    // TODO: Send state about Bot with :ID to frontend
    var botID = parseInt(req.params.ID);

    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;
      var query = { BotId: botID };

      db.collection("botList").findOne(query, function (err, result) {
        if (err) throw err;
        result === null ? res.status(404).send('Bots not found') : res.status(200).json(result);
        db.close();
      });
    });
  })

  // Edit the Bot WAIT untill the Frontend people are ready
  .post("/bot/:ID/edit", function (req, res) {
    // Save new settings for a bot with :ID in mongodb
    var botID = parseInt(req.params.ID);

    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;
      var query = { BotId: botID };// the Id of the Bot to be edited
      var newValues = req.body; // new name or config

      db.collection("botList").findOne(query, function (err, result) { // to get the corresponding Bot
        var lastValues = result; // all last values of the Bot
        try {
          for (var property in newValues) {
            // typeof lastValues[property] === 'undefined'  // to prevent the user to add more fields while editing
            if (typeof lastValues[property] === 'undefined' || property === 'BotId' || property === 'date') { // BotId and date can't be updated
              throw err;
            } else {
              lastValues[property] = newValues[property];
            }
          }
          db.collection("botList").updateOne(query, lastValues, function (err, result) {
            if (err) throw err;
            console.log("Bot Nr: " + botID + " updated");
            res.status(200).send("the Bot Nr: " + botID + " updated! ");
            db.close();
            return res.send();
          });

        } catch (err) {
          console.log(err)
          console.log("the Bot Nr: " + botID + " can't be updated! ");
          res.status(406).send("the Bot Nr: " + botID + " can't be updated! ");
          db.close();
          return res.send();
        }
      });
    });
  })

  // Delete Bot 
  .delete("/bot/:ID", function (req, res) {
    // Delete a bot with :ID in mongodb
    var botID = parseInt(req.params.ID);

    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;
      var myquery = { BotId: botID }; // id is an index in the collection

      db.collection("botList").deleteOne(myquery, function (err, result) {
        if (err) throw err;
        result.deletedCount === 0 ? res.status(404).send('not found') : res.status(200).send('OK');
        db.close();

        if (result.deletedCount === 0) {
          console.log('Bot mit ID = ' + botID + ' nicht gefunden');
        } else {
          console.log('Bot mit ID = ' + botID + ' geloescht');
        }
      });
    });
  })

  // Show Bot config 
  .get("/bot/:ID/config", function (req, res) {
    var botID = parseInt(req.params.ID);

    MongoClient.connect(mongoUrl, function (err, db) {
      if (err) throw err;
      var query = { BotId: botID };

      db.collection("botList").findOne(query, function (err, result) {
        if (err) throw err;
        result === null ? res.status(404).send('not found') : res.status(200).json(result.config);
        db.close();
      });
    });
  })


  /**
   * Docker methods - Autor: Christian Coenen
   */

  // Create docker image
  .post("/image/create", function (req, res) {
    docker.buildImage({
      context: __dirname + "/Bots/" + (req.body.type) + "/",
      src: ['Dockerfile', 'package.json', 'package-lock.json', 'main.js']
    }, { t: (req.body.type).toLowerCase() }, function (error, response) {
      if (error) {
        res.status(500).send(error);
        console.log(error);
        return res.send();
      }
      response.pipe(process.stdout);
    });
    setTimeout(function () {
      checkImageState(req.body.type, function (isBuilded) {
        if (!isBuilded) {
          console.log("Failed to create image: " + (req.body.type).toLowerCase());
          res.status(500).send("Failed to create image: " + (req.body.type).toLowerCase());
          return res.send();
        }
        else {
          console.log("Created image: " + (req.body.type).toLowerCase());
          res.status(201).send("Created image: " + (req.body.type).toLowerCase());
          return res.send();
        }
      });
    }, 30000);
  })

  // Start docker container
  .post("/bot/:ID/run", function (req, res) {
    checkImageState(req.body.type, function (isBuilded) {
      if (!isBuilded) {
        checkBotState(req.params.ID, function (isRunning) {
          if (isRunning) {
            axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'running' });
            res.status(200).send("Bot with ID " + req.params.ID + " is still running. Updated state.");
            return res.send();
          }
          else {
            res.status(409).send("Image " + req.body.type + " is not builded");
            return res.send();
          }
        });
      }
      else {
        checkBotState(req.params.ID, function (isRunning) {
          if (isRunning) {
            axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'running' });
            res.status(200).send("Bot with ID " + req.params.ID + " is still running. Updated state.");
            return res.send();
          }
          else {
            const BOT_ID = 'BOT_ID=' + req.params.ID;
            const accountID = 'accountID=' + process.env.accountID;
            const username = 'username=' + process.env.username;
            const password = 'password=' + process.env.password;
            docker.createContainer({
              Image: (req.body.type).toLowerCase(),
              AttachStdin: false,
              AttachStdout: true,
              AttachStderr: true,
              Tty: true,
              RestartPolicy: {
                Name: 'always',
                MaximumRetryCount: 0
              },
              NetworkMode: 'deploymenthufflepuff_sep',
              Links:["db:db"],
              Env: [
                BOT_ID,
                accountID,
                username,
                password,
              ],
              OpenStdin: false,
              StdinOnce: false,
              name: req.params.ID,
            }).then(function (container) {
              return container.start();
            })
            setTimeout(function () {
              checkBotState(req.params.ID, function (isRunning) {
                if (isRunning) {
                  console.log("Started docker container: " + req.params.ID)
                  axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'running' });
                  res.status(201).send("Started docker container: " + req.params.ID);
                  return res.send();
                }
                else {
                  console.log("Failed to start docker container: " + req.params.ID)
                  axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'runnable' });
                  res.status(500).send("Failed to start docker container: " + req.params.ID);
                  return res.send();
                }
              });
            }, 1000);
          }
        });
      }
    })
  })

  // Stop docker container
  .post("/bot/:ID/stop", function (req, res) {
    checkBotState(req.params.ID, function (isRunning) {
      if (!isRunning) {
        checkImageState(req.body.type, function (isBuilded) {
          if (isBuilded) {
            axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'runnable' });
            res.status(200).send("Bot with ID " + req.params.ID + " is already stopped. Updated state");
            return res.send();
          }
          else {
            res.status(409).send("Image " + req.body.type + " is not builded");
            return res.send();
          }
        });
      }
      else {
        docker.listContainers(function (err, containers) {
          containers.forEach(function (containerInfo) {
            if (containerInfo.Names[0] == "/" + req.params.ID) {
              docker.getContainer(containerInfo.Id).stop();
              setTimeout(function () {
                docker.getContainer(containerInfo.Id).remove();
              }, 1000);
              setTimeout(function () {
                checkBotState(req.params.ID, function (isRunning) {
                  if (isRunning) {
                    console.log("Failed to stop docker container: " + req.params.ID);
                    axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'running' });
                    res.status(500).send("Failed to stop docker container: " + req.params.ID);
                    return res.send();
                  }
                  else {
                    checkImageState(req.body.type, function (isBuilded) {
                      if (!isBuilded) {
                        console.log("Image " + req.body.type + " is not builded");
                        axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'stopped' });
                        res.status(409).send("Stopped docker container. Warning: Image " + req.body.type + " is not builded");
                        return res.send();
                      }
                      else {
                      }
                      console.log("Stopped docker container: " + req.params.ID);
                      axios.post(req.protocol + "://" + req.get('host') + "/bot/" + req.params.ID + "/edit", { status: 'runnable' });
                      res.status(201).send("Stopped docker container: " + req.params.ID);
                      return res.send();
                    });
                  }
                });
              }, 5000);
            }
          });
        });
      }
    });
  })
  // Delete docker image
  .post("/image/delete", function (req, res) {
    docker.getImage((req.body.type).toLowerCase()).remove({ force: true },
      function (error, response, body) {
        if (error) {
          res.status(500).send('Could not find the requested image.');
          console.log(error);
          return res.send();
        }
        setTimeout(function () {
          checkImageState(req.body.type, function (isBuilded) {
            if (isBuilded) {
              console.log("Failed to delete the image: " + (req.body.type).toLowerCase());
              res.status(500).send("Failed to delete the image: " + (req.body.type).toLowerCase());
              return res.send();
            }
            else {
              console.log("Deleted image: " + (req.body.type).toLowerCase());
              res.status(201).send("Deleted image: " + (req.body.type).toLowerCase());
              return res.send();
            }
          });
        }, 1000);
      });
  })

  // Check bot state
  .get("/bot/:ID/state", function (req, res) {
    checkBotState(req.params.ID, function (isRunning) {
      res.status(201).send(isRunning);
    });
  })

  // Check image state
  .post("/image/state", function (req, res) {
    checkImageState(req.body.type, function (isBuilded) {
      res.status(201).send(isBuilded);
    });
  })

// Helper function for bot state
function checkBotState(ID, callback) {
  var isRunning = false;
  docker.listContainers(function (err, containers) {
    containers.forEach(function (containerInfo) {
      if (containerInfo !== null && containerInfo.Names[0] == "/" + ID) {
        isRunning = true;
      }
    });
    console.log("State check for ID " + ID + ": " + (isRunning ? "running" : "not running"));
    callback(isRunning);
  });
}


// Helper function for image state
function checkImageState(bot_type, callback) {
  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    var isBuilded = false;
    docker.listImages(function (err, images) {
      images.forEach(function (imageInfo) {
        if (imageInfo.RepoTags[0] == bot_type.toLowerCase() + ":latest") {
          isBuilded = true;
        }
      })
      if (isBuilded) {
        db.collection("botList").update({ type: bot_type, status: 'stopped' }, { $set: { status: 'runnable' } }, { multi: true });
      }
      else {
        db.collection("botList").update({ type: bot_type, status: 'runnable' }, { $set: { status: 'stopped' } }, { multi: true });
      }
      console.log('Updated the image state.')
      db.close();
      callback(isBuilded);
    });
  });
}

module.exports = app;