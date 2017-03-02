var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://admin:admin@ds143539.mlab.com:43539/heroku_f3v1d9w8', ['users']);

/* GET All users */
router.get('/users', function (req, res, next) {
    db.users.find(function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.json(users);
        }
    });
});
/* GET One user with the provided ID */
router.get('/user/:id', function (req, res, next) {
    db.users.findOne({
        _id: mongojs.ObjectId(req.params.id)
    }, function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.json(users);
        }
    });
});
/* POST/SAVE a user */
router.post('/user', function (req, res, next) {
    var user = req.body;
    if (!user.text || !(user.isCompleted + '')) {
        res.status(400);
        res.json({
            "error": "Invalid Data"
        });
    } else {
        db.users.save(user, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.json(result);
            }
        })
    }
});
/* PUT/UPDATE a user */
router.put('/user/:id', function (req, res, next) {

    var user = req.body;
    db.users.update(
        { user_id: user.user_id },
        req.body,
        { upsert: true },
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.json(result);
            }
        });

});
/* DELETE a user */
router.delete('/user/:id', function (req, res) {
    db.users.remove({
        _id: mongojs.ObjectId(req.params.id)
    }, '', function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
});
module.exports = router;