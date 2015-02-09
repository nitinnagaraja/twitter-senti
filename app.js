var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var twitter = require('ntwitter');
var server = require('http').createServer(app);
var port = 3000;
server.listen(port);

var sio = require('socket.io').listen(server);

sio.set('origins', '*localhost:3000');

var loveCount = 0;
var hateCount = 0;
var total = 0;

var twit = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

sio.sockets.on('connection', function(socket){
    console.log('Now connected to the client.');
    
    twit.stream('statuses/filter', { track: ['love', 'hate'] }, function(stream) {
    stream.on('data', function (tweet) {
            var content = tweet.text.toLowerCase();
            if (content.indexOf('love') !== -1) {
              loveCount += 1;
              total += 1;
            }
            if (content.indexOf('hate') !== -1) {
              hateCount += 1;
              total += 1; 
            }
            socket.broadcast.emit('ss-tweet', {
                user: tweet.user.screen_name,
                text: tweet.text,
                love_count: loveCount,
                hate_count: hateCount,
                total_count: total,
                love_percentage: (loveCount/total)*100,
                hate_percentage: (hateCount/total)*100
            });
        });
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
