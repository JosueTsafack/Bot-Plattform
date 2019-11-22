const chai = require('chai')
const assert = chai.assert;
const should = chai.should();
const expect = chai.expect;
const chaiHttp = require('chai-http');
const app = require('../app.js');

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = process.env.mongoUrl || "mongodb://141.19.142.8/BotschmiedeDB";

chai.use(chaiHttp);

/*
Tests for app.js
*/
describe('Tests for app.js', () => {

    var botID = 0;
    
    /*
    Tests for POST /newbot
    */
    describe('Valid POST /newbot requests', () => {
        var botConfigJSON = {
            type: "WB", 
            status: "running", 
            name: "testBot", 
            user: "test", 
            config: "testConfig",
            date: "05.11.2017"
        }; 

        it('it should respond with status 201', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON)
            .end((err, res) => {
                res.should.have.status(201);
                botID = res.body.BotId;
                done(); 
            });
        });

        it('it should respond with property "BotId"', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON)
            .end((err, res) => {
                expect(res.body).to.have.property('BotId');
                done(); 
            });
        });

        it('it should put the bot config in the MongoDB', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON)
            .end((err, res) => {
                var query = { BotId: res.body.BotId };

                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err;           
                        expect(result.BotId).to.equal(res.body.BotId);
                        db.close();
                        done();                         
                    });
                });
            });
        });

        var botConfigJSON2 = {
            type: "WB", 
            name: "testBot",             
            user: "test", 
            config: "testConfig",
        }; 

        it('Missing "status" property. It should set property status = "runnable"', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON2)
            .end((err, res) => {
                var query = { BotId: res.body.BotId };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err;           
                        result.should.have.property('status');
                        expect(result.status).to.equal("runnable");
                        db.close();
                        done();                         
                    });
                });
            });
        });

        var botConfigJSON3 = {
            type: "WB", 
            status: "runnig",             
            name: "testBot",             
            config: "testConfig",
        }; 

        it('Missing "user" property. It should set property user = "null"', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON3)
            .end((err, res) => {
                var query = { BotId: res.body.BotId };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err;           
                        result.should.have.property('user');
                        expect(result.user).to.be.null;
                        db.close();
                        done();                         
                    });
                });
            });
        });

        var botConfigJSON4 = {
            type: "WB", 
            status: "runnig",             
            name: "testBot",      
            user: "test",             
        }; 

        it('Missing "config" property. It should set property config = "null"', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON4)
            .end((err, res) => {
                var query = { BotId: res.body.BotId };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err;           
                        result.should.have.property('config');
                        expect(result.config).to.be.null;
                        db.close();
                        done();                         
                    });
                });
            });
        });
    });


    describe('Invalid POST /newbot requests', () => {
        var botConfigJSON = {
            status: "runnig", 
            name: "testBot", 
            user: "test", 
            config: "testConfig",
        }; 

        it('Missing "type" property. It should respond with status 400', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON)
            .end((err, res) => {
                res.should.have.status(400);
                done(); 
            });
        });

        var botConfigJSON2 = {
            type: "WB", 
            status: "runnig", 
            user: "test", 
            config: "testConfig",
        }; 

        it('Missing "name" property. It should respond with status 400', (done) => {            
            chai.request(app).post('/newbot').send(botConfigJSON2)
            .end((err, res) => {
                res.should.have.status(400);
                done(); 
            });
        });

        //Authentifizierungstests fehlen
    });
        
    /*
    Tests for GET /all
    */
    describe('Valid GET /all requests', () => {
        it('it should respond with status 201', (done) => {
            chai.request(app).get('/all')
            .set('Authorization', 'test')            
            .end((err, res) => {
                console.log('Get All Authorization test 1');
                res.should.have.status(201);
                console.log(JSON.stringify(res.body));                
                done(); 
            });
        });

        it('it should respond with an Array containing bot Objects', (done) => {
            chai.request(app).get('/all')
            .set('Authorization', 'test')
            .end((err, res) => {
                res.body.should.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
                expect(res.body[0]).to.have.property('BotId');
                console.log('Get All Authorization test 2');                
                console.log(JSON.stringify(res.body));
                done(); 
            });
        });

        it('check for complete list', (done) => {
            chai.request(app).get('/all')
            .end((err, res) => {
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").find({}).toArray(function (err, result) {
                        if (err) throw err;                        
                        expect(result.length).to.equal(res.body.length);
                        expect(JSON.stringify(result)).to.equal(JSON.stringify(res.body));                        
                        db.close();
                        done();                         
                    });
                });
            });
        });
    });

    describe('Invalid GET /all requests', () => {
            //Authentifizierungstests fehlen
    });

    /*
    Tests for GET /bot/#id
    */
    describe('Valid GET /bot/#id requests', () => {
        it('it should respond with status 200', (done) => {
            chai.request(app).get('/bot/' + botID)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });

        it('it should respond with a Object', (done) => {
            chai.request(app).get('/bot/' + botID)
            .end((err, res) => {
                expect(res.body).to.be.a('object');
                done();
            });
        });

        it('it should respond with same Object as in DB', (done) => {
            chai.request(app).get('/bot/' + botID)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(JSON.stringify(result)).to.equal(JSON.stringify(res.body));                     
                        db.close();
                        done();                        
                    });
                });
            });
        });
    });

    describe('Invalid GET /bot/#id requests', () => {
        it('Bot doesn\'t exists: It should respond with status 404', (done) => {
            chai.request(app).get('/bot/111')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
    });

    /*
    Tests for POST /bot/#id
    */
    describe('Valid POST /bot/#id requests', () => {
        var botConfigJSON = {
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
        };      
        
        it('it should respond with status 200', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });

        it('it should not delete in request-body missing property "BotId"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('BotId');
                        expect(result.BotId).to.equal(botID);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON3 = {
            status: "stopped", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
        };      

        it('it should not delete in request missing property "type"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON3)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('type');
                        expect(result.type).to.equal(botConfigJSON.type);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON4 = {
            type: "Welcome", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
        };      

        it('it should not delete in request missing property "status"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON4)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('status');
                        expect(result.status).to.equal(botConfigJSON.status);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON5 = {
            type: "Welcome", 
            status: "stopped", 
            user: "user", 
            config: "configTest",
        };      

        it('it should not delete in request missing property "name"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON5)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('name');
                        expect(result.name).to.equal(botConfigJSON.name);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON6 = {
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            config: "configTest",
        };      

        it('it should not delete in request missing property "user"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON6)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('user');
                        expect(result.user).to.equal(botConfigJSON.user);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON7 = {
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            user: "user", 
        };      

        it('it should not delete in request missing property "config"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON7)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('config');
                        expect(result.config).to.equal(botConfigJSON.config);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON8 = {
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
        };      

        it('it should not delete in request missing property "date"', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON8)
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.have.property('date');
                        db.close();
                        done();                        
                    });
                });
            });
        });
    });

    describe('Invalid POST /bot/#id requests', () => {
        var botConfigJSON = {
            BotId: 001,
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
        };     

        it('Posting "BotId". It should respond with status 406', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON)
            .end((err, res) => {                
                res.should.have.status(406);
                done();
            });
        });

        var botConfigJSON2 = {
            BotId: 002,
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
        };     

        it('Posting "BotId". It should not put a bot in the DB', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON2)
            .end((err, res) => {                
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result.BotId).to.equal(botID);
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON3 = {
            type: "Welcome", 
            status: "stopped", 
            name: "botTest", 
            user: "user", 
            config: "configTest",
            unsupported: "111",
            undefined: 'undefined'
        };     

        it('Posting unsupported property. It should respond with status 406 and not update the bot in the DB', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON3)
            .end((err, res) => {                
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        res.should.have.status(406);      
                        result.should.not.have.property('unsupported');
                        result.should.not.have.property('undefined');                        
                        db.close();
                        done();                        
                    });
                });
            });
        });

        var botConfigJSON4 = {
            date: "22.11.2917"
        };     

        it('Posting "date". It should respond with status 406', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON4)
            .end((err, res) => {                
                res.should.have.status(406);
                done();
            });
        });

        it('Posting "date". It should not put a bot in the DB', (done) => {
            chai.request(app).post('/bot/' + botID + "/edit").send(botConfigJSON4)
            .end((err, res) => {                
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        res.should.have.status(406);      
                        expect(result.date).to.not.equal(botConfigJSON4.date);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });
    });        

    /*
    Tests for GET /bot/#id/config
    */
   
    describe('Valid GET /bot/#id/config requests', () => {
        it('it should respond with status 200', (done) => {
            chai.request(app).get('/bot/' + botID + '/config')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });

        it('it should GET a string with the config of the bot', (done) => {
            chai.request(app).get('/bot/' + botID + '/config')
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err;
                        expect(result).to.have.property('config');
                        expect(result.config).to.equal(res.body);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });

        it('it should respond with same string as in DB', (done) => {
            chai.request(app).get('/bot/' + botID + '/config')
            .end((err, res) => {
                var query = { BotId: botID };
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result.config).to.equal(res.body);                     
                        db.close();
                        done();                        
                    });
                });
            });
        });
    });
    
    describe('Invalid GET /bot/#id/config requests', () => {
        it('Unauthorized: It should respond with status 401', (done) => {
            chai.request(app).get('/bot/' + botID + '/config')
            .end((err, res) => {
                //res.should.have.status(401);
                done();
            });
        });

        it('Bot doesn\'t exists: It should respond with status 404', (done) => {
            chai.request(app).get('/bot/-111/config')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
    });
    /*
    Tests for DELETE /bot/#id
    */

    describe('Valid DELETE /bot/#id requests', () => {
        it('it should respond with status 200', (done) => {
            chai.request(app).delete('/bot/' + botID)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });

        it('it should DELETE the bot from DB with matching #id', (done) => {
            chai.request(app).delete('/bot/' + ++botID)
            .end((err, res) => {
                var query = { BotId: botID};
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.be.a('null');
                        db.close();
                        done();                        
                    });
                });
            });
        });

        //Wiederholter Test um Db zu leeren
        it('it should DELETE the bot from DB with matching #id', (done) => {
            chai.request(app).delete('/bot/' + ++botID)
            .end((err, res) => {
                var query = { BotId: botID};
                
                MongoClient.connect(mongoUrl, function (err, db) {
                    db.collection("botList").findOne(query, function (err, result) {
                        if (err) throw err; 
                        expect(result).to.be.a('null');
                        db.close();
                        done();                        
                    });
                });
            });
        });
    });

    describe('Invalid DELETE /bot/#id requests', () => {
        it('Unauthorized: It should respond with status 401', (done) => {
            chai.request(app).delete('/bot/' + botID)
            .end((err, res) => {
                //res.should.have.status(401);
                done();
            });
        });
        
        it('Bot doesn\'t exists: It should respond with status 404', (done) => {
            chai.request(app).delete('/bot/-111')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
    });
});