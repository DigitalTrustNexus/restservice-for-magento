var fs = require("fs")
var bitpay = require('bitpay-rest');
var bitauth = require('bitauth');
var privkey = bitauth.decrypt('', fs.readFileSync('/home/ec2-user/.bitpay/api.key', 'utf8'));
var sleep = require('sleep');
var EventEmitter = require('events').EventEmitter;

console.log("bitpay initializing");
var client = bitpay.createClient(privkey);
  client.on('error', function(err) {
  // handle client errors here
  console.log("bitpay client error");
  console.log(err);
});

client.on('ready', function() {
  console.log('bitpay client ready');
});

exports.test_func = function() {
   console.log("hello");
}

exports.get_invoice = function(ev, price, name, email, orderid) {
   console.log("get invoice");
   var data = {
     price: price,
     currency: 'USD',
     orderId: orderid,
     buyerName: name,
     buyerEmail: email
   };

   client.as('merchant').post('invoices', data, function(err, invoice) {
     if (err){
       // more error handling
       console.log(err);
     } else{
       // success
       console.log(invoice);
       ev.emit('done', invoice);
       return;
     }
   }); 
}
