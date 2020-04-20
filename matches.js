
const MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb+srv://dudesBingo:Iamadmin@1234@dudesbingo-g454s.mongodb.net/test?retryWrites=true&w=majority';
module.exports = function(app) {
    app.post('/save-match', function(request, response) {
        var contextId = request.body.contextId;
        var signature = request.body.signature;
        var player = request.body.player;
        
        var isValid = validate(signature);
        
        if (isValid) {
            var data = getEncodedData(signature);
            saveMatchDataAsync(contextId, data)
            .then(function(result){
                response.json({'success':true});
            })
            .catch(function(err){
                response.json({'success':false, 'error':err});
            });
        } else {
            console.log('encoded data', getEncodedData(signature));
            response.json({'success': false, 'error': {message:'invalid signature'}});
        }
    })
    
    app.post('/get-match', function(request, response) {
        var signature = request.body.signature;
        
        var isValid = validate(signature);
        
        if (isValid) {
            var contextId = getEncodedData(signature);
            loadMatchDataAsync(contextId)
            .then(function(result){
                if (result) {
                    response.json({'success':true, 'contextId':contextId, 'empty': false, 'data':result});
                } else {
                    response.json({'success':true, 'contextId':contextId, 'empty': true});
                }
            })
            .catch(function(err){
                response.json({'success':false, 'error':err});
            });
        } else {
            console.log('encoded data', getEncodedData(signature));
            response.json({'success':false, 'error':'invalid signature'});
        }
        
    })
    
    saveMatchDataAsync = function(contextId, data) {
        return new Promise(function(resolve, reject){


            MongoClient.connect(connectionString, {
                useUnifiedTopology: true
              })
              .then(client => {
                console.log('Connected to Database')
                const dbo = client.db('BingoProject');
                dbo.collection("matches_data").findOne({}, function(err, result) {
                    if (err) throw err;
                    console.log(result.contextId);
                    var myquery = { contextId: contextId };
                    var newvalues = { $set: { contextId: contextId, matchData: data } };
                    var myObj = { contextId: contextId, matchData: data } ;
                    if (result.contextId) {
                        // Update current match
                        dbo.collection("matches_data").updateOne(myquery, newvalues, function(err, res) {
                            if (err) {
                                reject(err);
                            }
                            console.log("1 document updated");
                            resolve();
                            db.close();
                          });
                    }else{
                      
                            // Insert new match
                            dbo.collection("matches_data").insertOne(myObj, function(err, res) {
                                if (err) {
                                    reject(err);
                                }
                                console.log("1 document inserted");
                                resolve();
                                db.close();
                              });
                        
                        }
                    db.close();
                  });
              }).catch(console.error)
        });
    };
    
    loadMatchDataAsync = function(contextId) {
        return new Promise(function(resolve, reject){

            MongoClient.connect(connectionString, {
                useUnifiedTopology: true
              })
              .then(client => {
                console.log('Connected to Database')
                const dbo = client.db('BingoProject');
                dbo.collection("matches_data").findOne({}, function(err, result) {
                    if(err){
                        reject(err);
                    }
                    if (result.contextId) {
                        resolve(result.data);
                    }else{
                        resolve();
                    }
                    
                });
            });
        });
    };
    
    validate = function(signedRequest) {
        // You can set USE_SECURE_COMMUNICATION to false 
        // when doing local testing and using the FBInstant mock SDK
        if (process.env.USE_SECURE_COMMUNICATION == false){
            console.log('Not validating signature')
            return true;
        }

        try{
            
            var firstpart = signedRequest.split('.')[0];
            var replaced = firstpart.replace(/-/g, '+').replace(/_/g, '/');
            var signature = crypto.enc.Base64.parse(replaced).toString();
            const dataHash = crypto.HmacSHA256(signedRequest.split('.')[1], process.env.APP_SECRET).toString();
            var isValid = signature === dataHash;
            if (!isValid) {
                console.log('Invalid signature');
                console.log('firstpart', firstpart);
                console.log('replaced ', replaced);
                console.log('Expected', dataHash);
                console.log('Actual', signature);
            }
            
            return isValid;
        } catch (e) {
            return false;
        }
    };
    
    getEncodedData = function(signedRequest) {
        // You can set USE_SECURE_COMMUNICATION to false 
        // when doing local testing and using the FBInstant mock SDK
        if (process.env.USE_SECURE_COMMUNICATION === false){
            return payload;
        }

        try {
            
            const json = crypto.enc.Base64.parse(signedRequest.split('.')[1]).toString(crypto.enc.Utf8);
            const encodedData = JSON.parse(json);
            
            /*
            Here's an example of encodedData can look like
            { 
                algorithm: 'HMAC-SHA256',
                issued_at: 1520009634,
                player_id: '123456789',
                request_payload: 'backend_save' 
            } 
            */
            
            return encodedData.request_payload;
        } catch (e) {
            return null;
        }
    };
}