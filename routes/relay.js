var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('rtdb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'rtdb' database");
        db.collection('relays', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'relay' collection doesn't exist. Creating it with sample data...");
                initDB();
            }
        });
    }
});

/*** ***/

var http = require('http');
var url = require('url');
var relay = Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	 
function request(address, port, path) {
    http.get({ host: address, port: port, path: path}, function(response) {
        // The page has moved make new request
        if (response.statusCode === 302) {
            var newLocation = url.parse(response.headers.location).host;
            console.log('We have to make new request ' + newLocation);
            request(newLocation);
        } else {
            console.log("Response: %d", response.statusCode);
            response.on('data', function(chunk) {
		relay = JSON.parse(chunk);
		buf=''; 
		for(i=0;i<16;i++){
			if(i<8){ buf+='R';j=i;k=0;}else{buf+='S';j=i-8;k=1}
			buf+=j+'='+relay[k][j]+' ';
		}
                console.log(buf);
            });
        }
    }).on('error', function(err) {
        console.log('Error %s', err.message);
    });
}
	 
/* i.e. request('www.google.com', '/search?ie=UTF-8&q=node'); 

request('127.0.0.1', 8081, '/set?r=1&v=1');
setTimeout(function(){request('127.0.0.1', 8081, '/test')},2000);
setTimeout(function(){
		request('127.0.0.1', 8081, '/set?r=1&v=0');
		setTimeout(function(){request('192.168.1.38', 8081, '/test')},2000);
	}, 5000);
*/
exports.setRelay = function(req, res) {
    var id = req.params.id;
    var relay = req.body;
    console.log('Setting relay: ' + id);
    request('127.0.0.1', 8081, '/set?r='+id+'&v=1');
    res.send('relay '+id+' set');

}


/*** ***/

exports.login = function(req, res) {
    res.send('Please, login: ');
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving relay: ' + id);
    db.collection('relays', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};


exports.findAll = function(req, res) {
    db.collection('relays', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};


exports.addRelay = function(req, res) {
    var relay = req.body;
    console.log('Adding relay: ' + JSON.stringify(relay));
    db.collection('relays', function(err, collection) {
        collection.insert(relay, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}


exports.updateRelay = function(req, res) {
    var id = req.params.id;
    var relay = req.body;
    console.log('Updating relay: ' + id);
    console.log(JSON.stringify(relay));
    db.collection('relays', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, relay, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating relay: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(relay);
            }
        });
    });
}

exports.deleteRelay = function(req, res) {
    var id = req.params.id;
    console.log('Deleting relay: ' + id);
    db.collection('relays', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

var initDB = function() {

    var relay = [
    {
        name: "T7mnt",
        ip: "127.0.0.1",
        bit: 0,
        owner: "anunez",
        cloud: "no",
        description: "T7 mount",
        picture: "t7.jpg"
    },
    {
        name: "T7ccd",
        ip: "127.0.0.1",
        bit: 0,
        owner: "anunez",
        cloud: "no",
        description: "T7 CCD Camera",
        picture: "t7ccd.jpg"
    }];

    db.collection('relays', function(err, collection) {
        collection.insert(relay, {safe:true}, function(err, result) {});
    });

};
