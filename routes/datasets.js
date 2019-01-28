var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var fs = require("fs");
var path = require('path');
var template = require("lodash/template");
require('dotenv').config()
var db = mongojs(process.env.ENV === "production" ? process.env.MONGODB_URI : process.env.MONGODB_URI_LOCAL, ['datasets']);

/* GET All datasets */
// router.get('/all', function (req, res, next) {
//     db.datasets.find(function (err, datasets) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.json(datasets);
//         }
//     });
// });


/* GET One dataset with the provided ID */
router.get('/:id', function (req, res, next) {
    db.datasets.findOne(
        { _id: mongojs.ObjectId(req.params.id) },
        function (err, datasets) {
            if (err) {
                res.send(err);
            } else {
                res.json(datasets);
            }
        });
});

router.get('/in/:query', function (req, res, next) {
    let datasets_id = req.params.query.split(',').map(d => mongojs.ObjectId(d));
    db.datasets.find(
        { _id: { $in: datasets_id } }
        , function (err, datasets) {
            if (err) {
                res.send(err);
            } else {
                res.json(datasets);
            }
        });
})

router.get('/template/:name', function (req, res, next) {
    let name = req.params.name;
    let teamId = req.query.teamId;
    let template = template(fs.readFileSync(path.join(__dirname, "..", `public/templates/maps/${name}.json`)));
    let templated = JSON.parse(template({ teamId: teamId }));
    res.json(templated);

})

router.get('/in/:query/minimal', function (req, res, next) {
    let datasets_id = req.params.query.split(',').map(d => mongojs.ObjectId(d));
    db.datasets.find(
        { _id: { $in: datasets_id } },
        { _id: 1, 'initiative.name': 1, "initiative.team_id": 1, "isArchived": 1 },
        function (err, datasets) {
            if (err) {
                res.send(err);
            } else {
                res.json(datasets);
            }
        });
})

/* POST/SAVE a dataset */
router.post('/', function (req, res, next) {
    var dataset = req.body;
    db.datasets.save(dataset, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    })
});


/* PUT/UPDATE a dataset */
router.put('/:did', function (req, res, next) {
    var dataset = req.body;
    db.datasets.update(
        { _id: mongojs.ObjectId(req.params.did) },
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

/* DELETE a dataset */
// router.delete('/dataset/:id', function (req, res) {
//     db.datasets.remove({
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