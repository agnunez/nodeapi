

var express = require('express'),
    relay = require('./routes/relay');

var app = express();

app.configure(function () {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/', relay.login);
app.get('/relay', relay.findAll);
app.get('/relay/:id', relay.findById);
app.post('/relay', relay.addRelay);
app.put('/relay/:id', relay.updateRelay);
app.delete('/relay/:id', relay.deleteRelay);
app.get('/relay/set/:id', relay.setRelay);

app.listen(3000);
console.log('Listening on port 3000...');


