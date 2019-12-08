# Botforge

Instructions to deploy the software (Tested on Ubuntu 16.04 and Windows 10):

1. Install latest stable docker version (Tested with v.17.11.0-ce, v.1.13.1)
2. Install latest stable docker-compose version (Tested with v.1.17.0 and v.1.8.0)
3. Move to the 'SEP_Frontend' directory and place your server ip with port (Default Port 3000) in the settings.json file (Important!!)
4. Move to the 'Deployment-Hufflepuff' directory and update the .env file with your LiveEngage data (Important!!)
5. Run the following docker-compose command: <code>docker-compose up</code>
6. Build Welcome-Bot image with curl: <code>curl -X POST http://localhost:3000/image/create -H 'cache-control: no-cache' -H 'content-type: application/json' -d '{"type" : "Welcome_Bot"}'</code>
7. Build FAQ-Bot image with curl: <code>curl -X POST http://localhost:3000/image/create -H 'cache-control: no-cache' -H 'content-type: application/json' -d '{"type" : "FAQ_Bot"}'</code>
8. Connect to the server via a browser (Tested with Chrome) and Login with your LiveEngage ID (Important for Chat) and some random user data 


Copyright 2017 Christian Coenen, Stefan Hauk, Dominik Holweck, Josue Nguemo, Philip Oesterlin, Dennis Schlage

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


# Starting the database
+ install and start MongoDb: under Windows go to C:\Program Files\MongoDB\Server\3.6\bin And start mongod.exe and mongo.exe

# Starting the backend server
+ navigate to SEP_Backend folder and run <code>npm start</code> to start the backend server
first start mongodb and then navigate to SEP_Backend and finally run.

# Starting the frontend server
+ navigate to SEP_Frontend folder and run <code>node build/server.js --define process.env.NODE_ENV='production'</code> to start the frontend server. Then open your browser at localhost, you are now up and running, go ahead and enjoy the great secure app made by Josue Nguemo Tsafack(Software Architect and ceo at Tensend)
