'use strict';

let mysql = require('mysql');
let connection = mysql.createConnection({
  host : 'localhost',
  user : 'magento',
  password : 'magentO1!',
  port : 3306,
  database: 'magento'
});

var base='/var/www/html/market/pub/media/downloadable/files/links';

exports.get_contents = function(ev, orderid) {
	console.log('get contents');

	var query = 'SELECT link_file from downloadable_link_purchased_item where order_item_id=' + orderid + ';';
	var path=''

	connection.query(query, (err, rows, fields) => {
	  if (err) throw err;
	  if (rows[0] == null) {
            ev.emit('content', path);
	  } else {

	  path = base + rows[0].link_file;
	  //console.log(path);

          ev.emit('content', path);
          }
	});
	console.log('get contents2');
}
