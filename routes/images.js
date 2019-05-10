var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary').v2;
var fs = require('fs');
var path = require('path');

require('dotenv').config()

let CLOUDINARY_APIKEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUDNAME;


CLOUDINARY_APIKEY = process.env.CLOUDINARY_APIKEY;
CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
CLOUDINARY_CLOUDNAME = process.env.CLOUDINARY_CLOUDNAME;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUDNAME,
    api_key: CLOUDINARY_APIKEY,
    api_secret: CLOUDINARY_API_SECRET
});


router.post('/upload/:mapid', function (req, res, next) {
    var svgString = req.body;
    var date = new Date();
    var mapid = req.params.mapid;
    var base64String = Buffer.from(svgString).toString("base64");
    cloudinary.uploader.upload(
        `data:image/svg+xml;base64,${base64String}`,
        {
            public_id: `${mapid}/snapshot/${date.toISOString()}`,
            tags: [],
            eager: {
                background: "#ffffff",
                quality: "auto:best",
                format: "png"
            }

        },
        function (error, result) {
            if (error) {
                res.send(error);
            }
            res.json(result)
        }
    );

    // cloudinary.uploader.upload(
    //     `data:image/svg+xml;base64,${base64String}`,
    //     function (result) { res.json(result) },
    //     {
    //         public_id: `${mapid}/snapshot/${date.toISOString()}`,
    //         tags: [],
    //         eager: {
    //             background: "#ffffff",
    //             quality: "auto:best",
    //             format: "png"
    //         }

    //     });
});


module.exports = router;