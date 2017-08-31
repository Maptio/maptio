var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

let SECRET  = Buffer.from(";XH8i7vd\(K%oiODR4.c1-!]gJ=w^~$Nq_~%Y9)jylE/'.{vi/O-[+JnMe*!ehL", "hex");


router.post('/encode', function (req, res, next) {
    let token = jwt.sign(req.body, SECRET);
    res.json({token: token});
});

router.get('/decode/:token', function (req, res, next) {
    let object = jwt.verify(req.params.token, SECRET);
    res.json(object)
});

module.exports = router;