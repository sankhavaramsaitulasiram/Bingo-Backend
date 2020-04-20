const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient
const connectionString = 'mongodb+srv://dudesBingo:Iamadmin@1234@dudesbingo-g454s.mongodb.net/test?retryWrites=true&w=majority'
const app = express();

app.use(bodyParser);
app.use(cors());

app.get('/',function(req,res){
  console.log('Hey you are successful!!');
})


const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, function () {
      console.log("Server started at port " + port);
    })
  require('./matches.js')(app);