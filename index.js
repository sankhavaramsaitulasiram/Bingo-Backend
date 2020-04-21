const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/',function(req,res){
  console.log('Hey you are successful!!');
})


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});


const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, function () {
      console.log("Server started at port " + port);
    })
  require('./matches.js')(app);