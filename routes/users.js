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
    db.users.findOne(
        { user_id: req.params.id },
        {},
        function (err, users) {
            if (err) {
                res.send(err);
            } else {
                res.json(users);
            }
        });
});

router.get('/user/:id/datasets', function (req, res, next) {
    db.users.findOne(
        { user_id: req.params.id },
        { datasets: 1, _id: 0 },
        function (err, datasets) {
            if (err) {
                res.send(err);
            } else {
                res.json(datasets);
            }
        });
});

/* POST/SAVE a user */
// router.post('/user', function (req, res, next) {
//     var user = req.body;

//     db.users.save(user, function (err, result) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json(result);
//         }
//     })

// });

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

/* PUT/UPDATE a user with a new datset*/
router.put('/user/:uid/dataset/:did', function (req, res, next) {
    db.users.update(
        { user_id: req.params.uid },
        { $push: { datasets: mongojs.ObjectId(req.params.did) } },
        {},
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.json(result);
            }
        });
});


/* DELETE a user */
router.delete('/user/:uid/dataset/:did', function (req, res) {
    db.users.update(
        { user_id: req.params.uid },
        { $pull: { datasets: { $in: [mongojs.ObjectId(req.params.did)] } } },
        {},
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.json(result);
            }
        });
});
module.exports = router;