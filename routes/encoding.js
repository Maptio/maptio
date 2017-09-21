var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
require('dotenv').config()

let jwtSecret = process.env.JWT_SECRET;


router.post('/encode', function (req, res, next) {
    try {
        let token = jwt.sign(req.body, jwtSecret);
        res.json({ token: token });
    }
    catch (err) {
        res.send(err);
    }
});

router.get('/decode/:token', function (req, res, next) {
    try {
        let object = jwt.verify(req.params.token, jwtSecret);
        res.json(object)
    }
    catch (err) {
        res.send(err);
    }


});

module.exports = router;