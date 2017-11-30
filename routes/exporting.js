var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/:id', function (req, res, next) {
    res.sendFile(path.join(__dirname, "..", "public/datasets/maptio.csv"))
});

module.exports = router;