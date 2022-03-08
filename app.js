var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const AWS = require('aws-sdk');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const s3Config = {
    title: "S3BucketApp",

    config: {
        Bucket: "BucketName",
        ACL: "public-read",
        AuthenticatedACL: "authenticated-read",
        ContentType: "application/pdf"
    }
};

const s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: ''
});

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/uploads', upload.single('image'), function (req, res, next) {
    const file = req.file;

    var params = {
        Bucket: s3Config.config.Bucket,
        ACL: s3Config.config.ACL,

        // File related parameters
        Key: file.name,
        Body: file.data,
        ContentType: file.mimetype
    }
    try {
        s3Client.upload(params, function (err, data) {
            if (err) {
                throw new Error(err.code);
            }
            else {
                res.status(201).send();
            }
        });
    }
    catch (err) {
        res.status(500).send();
    }
});


app.post('/delete', function (req, res, next) {
    var key = req.body.key;
    var params = {
        Bucket: s3Config.config.Bucket,
        Key: key
    };

    try {
        s3.deleteObject(params, function (err, data) {
            if (err) {
                throw new Error(err.code);
            }
            else {
                res.status(204).send();
            }
        });
    }
    catch (err) {
        res.status(500).send();
    }
});

module.exports = app;
