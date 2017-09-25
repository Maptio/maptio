var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
require('dotenv').config()
var db = mongojs(process.env.MONGODB_URI, ['teams']);

/**
 * Get all teams
 */
// router.get('/all', function (req, res, next) {
//     db.teams.find(function (err, teams) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json(teams);
//         }
//     });
// });

/**
 * Get a team with given id
 */
router.get('/:id', function (req, res, next) {
    db.teams.findOne(
        { _id: mongojs.ObjectId(req.params.id) },
        {},
        function (err, teams) {
            if (err) {
                res.send(err);
            } else {
                res.json(teams);
            }
        });
});

/**
 * Get all users in a given team
 */
router.get('/:id/users', function (req, res, next) {
    db.users.find({
        teams: { $in: [mongojs.ObjectId(req.params.id)] }
    },
        function (err, teams) {
            if (err) {
                res.send(err);
            } else {
                res.json(teams);
            }
        });
});


/* GET all datasets for a given team*/
router.get('/:teamid/datasets', function (req, res, next) {
    db.datasets.find(
        { team_id: req.params.teamid },
        function (err, datasets) {
            if (err) {
                res.send(err);
            } else {
                res.json(datasets);
            }
        });
});

/**
 * Create a team
 */
router.post('/', function (req, res, next) {
    var team = req.body;
    db.teams.save(team, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    })
});

/**
 * Update a team
 */
router.put('/:id', function (req, res, next) {
    var team = req.body;
    db.teams.update(
        { _id: mongojs.ObjectId(req.params.id) },
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

/* DELETE a team */
// router.delete('/team/:id', function (req, res) {
//     db.teams.remove({
//         _id: mongojs.ObjectId(req.params.id)
//     }, '', function (err, result) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json(result);
//         }
//     });
// });


module.exports = router;