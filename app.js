var path = require('path');
var express = require('express');
var app = express();
var https = require("https");

var dir = path.join(__dirname, 'public');
var port = process.env.PORT || 8080;

var fs = require('fs'); 
var resemble = require('node-resemble-js');

var misMatch = 101;
var images = [];
var matches = [];
for (i = 0; i < 20; i++) {
	images.push(fs.readFileSync('./public/dog' + i + '.png'));
}
app.use(express.static(dir));

app.get('/find-dog', function(req, res) {
	var image = req.query.image;
	misMatch = 101;
	matches = [];
	https.get(image, function(res) {
		var buffers = [];
		var length = 0;

		res.on("data", function(chunk) {
			// store each block of data
			length += chunk.length;
			buffers.push(chunk);
		});

		res.on("end", function() {
			// combine the binary data into single buffer
			var img2 = Buffer.concat(buffers);
			for (i = 0; i < images.length; i++) {
  				resemble(images[i]).compareTo(img2).ignoreNothing().onComplete(function (data) {
					console.log(data);
					matches.push(data.misMatchPercentage);
					if (data.misMatchPercentage < misMatch) {
						misMatch = data.misMatchPercentage;
						console.log(misMatch);
					}
				});
			};
		});
	});
	res.send('Dog Found');
});

app.get('/get-best-match', function(req, res) {
	console.log(misMatch);
	console.log(matches);
	var dogIndex = matches.indexOf(misMatch);
	console.log(misMatch);
	res.sendFile(__dirname + '/public/dog' + dogIndex + '.png');
});

app.listen(port)