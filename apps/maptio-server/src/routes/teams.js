var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
require('dotenv').config();
const getDepth = require('./traverse');
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
    }
  );
});

router.get('/in/:query', function (req, res, next) {
  let teams_id = req.params.query.split(',').map((t) => mongojs.ObjectId(t));
  db.teams.find({ _id: { $in: teams_id } }, function (err, teams) {
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
  db.users.find(
    {
      teams: { $in: [mongojs.ObjectId(req.params.id)] },
    },
    function (err, teams) {
      if (err) {
        res.send(err);
      } else {
        res.json(teams);
      }
    }
  );
});

/* GET all datasets for a given team*/
router.get('/:teamid/datasets', function (req, res, next) {
  db.datasets.find(
    { 'initiative.team_id': req.params.teamid },
    function (err, datasets) {
      if (err) {
        res.send(err);
      } else {
        datasets.forEach((d) => {
          d.depth = getDepth(d);
        });

        res.json(datasets);
      }
    }
  );
});

/**
 * Create a team
 */
router.post('/', function (req, res, next) {
  var team = req.body;
  db.teams.save(team, function (err, result) {
    if (err) {
      console.error('Error creating team:', err);
      res.send(err);
    } else {
      console.log('Team created:', result);
      res.json(result);
    }
  });
});

/**
 * Update a team
 */
router.put('/:id', function (req, res, next) {
  var team = req.body;
  db.teams.update(
    { _id: mongojs.ObjectId(req.params.id) },
    { $set: req.body },
    { upsert: true },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
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
