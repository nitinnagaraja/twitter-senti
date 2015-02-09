var server_name = "http://127.0.0.1:3000/";
var server = io.connect(server_name);
console.log('Client: Connected to server '+server_name);

jQuery(function($){
    var tweetList = $('ul.tweets');
    var love = document.getElementById('love');
    var hate = document.getElementById('hate');
    var loveCount = document.getElementById('love_count');
    var hateCount = document.getElementById('hate_count');
    var total = document.getElementById('total');
    server.on('ss-tweet', function(data){
        tweetList.prepend('<li>' + data.user + ': ' + data.text + '</li>');
        love.innerHTML = 'Love %: '+ data.love_percentage;
        hate.innerHTML = 'Hate %: '+ data.hate_percentage;
        loveCount.innerHTML = 'Love count: ' + data.love_count;
        hateCount.innerHTML = 'Hate count: ' + data.hate_count;
        total.innerHTML = 'Total tweets: ' + data.total_count;
    });
});
