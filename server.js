var express = require('express');
var mongodb = require('mongodb');
var validUrl = require('valid-url');
var url = require('url');
var app = express();
var MongoClient = mongodb.MongoClient;
var urldb = process.env.MONGOLAB_URI;
app.set('port', (process.env.PORT || 8080))
app.use('/',express.static('info'));

app.get('/new/*',function(req,res){
    var newurl = url.parse(req.url,true);
    var newurlSlice = newurl.pathname.slice(5);    
    if(validUrl.isUri(newurlSlice)){
        MongoClient.connect(urldb, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', urldb);
                var newindex = 0;
                db.collection('shorturls').count(null, function(err2,count2){if (err2) throw err2; newindex=count2+1;});
                db.collection('shorturls').count({orginal_url : newurlSlice},function(err,count){if (err) throw err; 
                if(count==0){
                    var myobject = {orginal_url : newurlSlice, short_url: newindex};
                    db.collection('shorturls').insert(myobject,function(err,data){if(err){throw err;} db.close();});
                    res.send(JSON.stringify({orginal_url : newurlSlice, short_url: req.protocol + '://' + req.hostname+'/'+newindex}));
                    res.end();
                 }else{
                    db.collection('shorturls').find({orginal_url : newurlSlice}).toArray(function(err, docs){if(err) throw err; 
                        res.send(JSON.stringify({orginal_url : newurlSlice, short_url: req.protocol + '://' + req.hostname+'/'+docs[0].short_url}));
                        res.end();
                        db.close();
                    }); 
                 }
                    
                });
               
            }
        });
    }else
    {
        res.send(JSON.stringify({error: "Wrong url format, make sure you have a valid protocol and real site."}));
        res.end();
    }
});

app.get('/*',function(req,res){
    var newurl = url.parse(req.url,true);
    var newurlSlice = newurl.pathname.slice(1);
    if (newurlSlice!==''){
       MongoClient.connect(urldb, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', urldb);
                
                db.collection('shorturls').find({short_url : Number(newurlSlice)}).toArray(function(err, docs){if(err) {throw err;}
                    if(docs.length>0){
                        res.redirect(docs[0].orginal_url);
                        db.close();
                    }else{
                        res.send(JSON.stringify({error: "This url is not on the database."}));
                        res.end();
                        db.close();
                    }
                });
            } 
        });
    }else{
    res.end();
    }
});


app.listen(app.get('port'));
