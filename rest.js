var express = require('express');
const https = require('https');
var urlm = require('url');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser')
var bitpay = require('./bitpay_cli.js');
var mysql = require('./mysql.js');
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;

app.all('*', function(req, res, next) {
     var origin = req.get('origin'); 
     res.header('Access-Control-Allow-Origin', origin);
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     res.header('Access-Control-Allow-Headers', 'Content-Type');
     next();
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var coinaddr = { "address": "aaabbccdde" };
var resp;

app.get('/invoice', function (req, res) {
   console.log("invoice");
   var delta = 5000;
   while (delta >=  5000) { 
     busysleep(300); 
     try {
        var stats = fs.statSync("/tmp/bitpayurl");
        delta = new Date() - stats.mtime;
        console.log(delta);
     } catch(err) {
         console.log(err);
         console.log("waiting file..");
     }
   }
   fs.readFile("/tmp/bitpayurl", {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        console.log('received data: ' + data);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(data);
        res.end();
/*
        fs.unlink("/tmp/bitpayurl", (err) => {
          if (err) {
             console.error(err)
             return
          }
        })
*/
    } else {
        console.log(err);
    }
   });

   //invoice = bitpay.get_invoice(ev, "1.05", "test test", "nsd246@hotmail.com", "24");
   resp = res;
})

function busysleep(waitMsec) {
  var startMsec = new Date();
  while (new Date() - startMsec < waitMsec);
}

app.post('/invoice', function (req, res) {
   // fake query
   var delta = 20000;
   while (delta >=  20000) { 
     busysleep(300); 
     try {
        var stats = fs.statSync("/tmp/bitpayurl");
        delta = new Date() - stats.mtime;
        console.log(delta);
     } catch(err) {
         console.log(err);
         console.log("waiting file..");
     }
   }

   console.log("post invoice");
   fs.readFile("/tmp/bitpayurl", {encoding: 'utf-8'}, function(err,data){
   if (!err) {
        console.log('received data: ' + data);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(data);
        res.end();
/*
        fs.unlink("/tmp/bitpayurl", (err) => {
          if (err) {
             console.error(err)
             return
          }
        })
*/
   } else {
        console.log(err);
   }
   });

   //bitpay.get_invoice(ev, req.body.price, req.body.name, req.body.email, req.body.orderid);
   //resp = res;
})

app.get('/getcontents', function (req, res) {
   url_parts = urlm.parse(req.url, true);
   orderid = url_parts.query.order;
   console.log('order= ' + orderid);
   if (typeof orderid !== 'undefined' && orderid ) {
      mysql.get_contents(ev, orderid);
      resp = res;
   } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('not found\n');
      res.end();
   }
})

ev.on('content', function(path) {
   console.log("path=" + path);
   fs.readFile(path,'binary', function (err, data) {
     if (err){
       resp.writeHead(404, {'Content-Type': 'text/plain'});
       resp.write('not found\n');
       resp.end();
     } else {
       resp.writeHead(200, {'Content-Type': 'application/pdf'});
       resp.write(data, "binary");
       resp.end();
     }
   });
})

ev.on('done', function(target) {
   console.log('target ' + target);
   //url = JSON.stringify(target.url);
   url = JSON.stringify(target.paymentCodes.BTC.BIP72b);
   //coinaddr['address'] = target;
   
   resp.writeHead(200, {'Content-Type': 'application/json'});
   resp.write('{"url":' + url + '}');
   resp.end();
   //resp.end(invoice);
});

/*
var server = app.listen(18322, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

})
*/

var server = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}, app)
.listen(18322, "0.0.0.0");



