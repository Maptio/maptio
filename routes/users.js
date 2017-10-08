var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
require('dotenv').config()
var db = mongojs(process.env.MONGODB_URI, ['users']);

/* GET All users */

// router.get('/all', function (req, res, next) {
//     db.users.find(function (err, users) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json(users);
//         }
//     });
// });

router.get('/all/:pattern', function (req, res, next) {
    let pattern = req.params.pattern;

    db.users.find(
        { $or: [{ name: { $regex: pattern, $options: 'i' } }, { email: { $regex: pattern, $options: 'i' } }] }

        , function (err, users) {
            if (err) {
                res.send(err);
            } else {
                res.json(users);
            }
        });
});

router.get('/in/:query', function (req, res, next) {
    let users_id = req.params.query.split(',');
    db.users.find(
        { user_id: { $in: users_id } }
        , function (err, users) {
            if (err) {
                res.send(err);
            } else {
                res.json(users);
            }
        });
})

/* GET One user with the provided ID */
router.get('/:id', function (req, res, next) {

    db.users.findOne(
        { $or: [{ user_id: req.params.id }, { shortid: req.params.id }] },

        function (err, users) {

            if (err) {
                res.send(err);
            } else {
                res.json(users);
            }
        }
    );
});

router.get('/:id/datasets', function (req, res, next) {
    db.users.findOne(
        { $or: [{ user_id: req.params.id }, { shortid: req.params.id }] },
        function (err, user) {
            if (err) {
                res.send(err);
            } else {
                let teams = user.teams;
                if (teams && teams.length > 0) {
                    db.datasets.find(
                        { $or: [{ "initiative.team_id": { $in: teams } }, { "team_id": { $in: teams } }] },
                        { _id: 1 },
                        function (err, datasets) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json(datasets);
                            }
                        }
                    );
                }
                else {
                    res.json([]);
                }
            }
        }
    );
});

/* POST/SAVE a user */
router.post('/', function (req, res, next) {
    var user = req.body;

    db.users.save(user, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    })

});

/* PUT/UPDATE a user */
router.put('/:id', function (req, res, next) {
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
router.put('/:uid/dataset/:did', function (req, res, next) {
    db.users.update(
        { user_id: req.params.uid },
        { $push: { datasets: req.params.did } },
        {},
        function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.json(result);
            }
        });
});

/* PUT/UPDATE a user with a new datset*/
router.put('/:uid/team/:tid', function (req, res, next) {
    db.users.update(
        { user_id: req.params.uid },
        { $push: { datasets: req.params.did } },
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
// router.delete('/user/:uid/dataset/:did', function (req, res) {
//     db.users.update(
//         { user_id: req.params.uid },
//         { $pull: { datasets: { $in: [req.params.did] } } },
//         {},
//         function (err, result) {
//             if (err) {
//                 res.send(err);
//             } else {
//                 res.json(result);
//             }
//         });
// });

module.exports = router;