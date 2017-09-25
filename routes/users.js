var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
require('dotenv').config()
var db = mongojs(process.env.MONGODB_URI, ['users']);

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

router.get('/users/:pattern', function (req, res, next) {
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

/* GET One user with the provided ID */
router.get('/user/:id', function (req, res, next) {
    // db.users.aggregate([
    //     { $match: { user_id: req.params.id } },
    //     { $unwind: { path: "$teams", preserveNullAndEmptyArrays: true } },
    //     { $lookup: { from: "datasets", localField: "teams", foreignField: "team_id", as: "datasetsFromTeams" } },
    //     { $unwind: { path: "$datasetsFromTeams", preserveNullAndEmptyArrays: true } },
    //     { $lookup: { from: "datasets", localField: "_id", foreignField: "team_id", as: "datasetObjects" } },

    //     { $unwind: { path: "$datasets", preserveNullAndEmptyArrays: true } },
    //     { $lookup: { from: "datasets", localField: "datasets", foreignField: "_id", as: "unlinkedDatasets" } },

    //     {
    //         $group: {
    //             _id: "$_id",
    //             picture: { $min: "$picture" },
    //             name: { $min: "$name" },
    //             email: { $min: "$email" },
    //             user_id: { $min: "$user_id" },
    //             teams: { $addToSet: "$teams" },
    //             datasets: { $addToSet: "$datasetsFromTeams._id" },
    //            unlinkedDatasets: { $addToSet: "$datasets" },
    //         }
    //     },
    //     {
    //         $limit: 1
    //     }

    // ]

    db.users.findOne(
        { $or: [{ user_id: req.params.id }, { shortid: req.params.id }] },

        function (err, users) {

            if (err) {
                res.send(err);
            } else {
                res.json(users);
            }
        },
        function (err, users) {
            if (err) {
                res.send(err);
            } else {
                res.json(users[0]);
            }
        }
    );
});

router.get('/user/:id/datasets', function (req, res, next) {
    db.users.aggregate([
        { $match: { user_id: req.params.id } },
        { $unwind: { path: "$teams", preserveNullAndEmptyArrays: false } },
        { $lookup: { from: "datasets", localField: "teams", foreignField: "team_id", as: "datasets" } },
        { $unwind: { path: "$datasets", preserveNullAndEmptyArrays: false } },
        { $lookup: { from: "datasets", localField: "_id", foreignField: "team_id", as: "datasetObjects" } },
        {
            $group: {
                _id: "$_id",
                datasets: { $addToSet: "$datasets._id" }
            }
        }

    ],
        function (err, users) {
            if (err) {
                res.send(err);
            } else {
                res.json(users[0]);
            }
        }
    );
});

/* POST/SAVE a user */
router.post('/user', function (req, res, next) {
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
router.put('/user/:uid/team/:tid', function (req, res, next) {
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