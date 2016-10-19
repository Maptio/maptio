var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();

// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); 

// Route for everything else.
app.get('*', function(req, res){
  res.sendFile(path.join(__dirname+'/views/index.html'));
});

// Fire it up!
app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');