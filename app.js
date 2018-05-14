var mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router();
const MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

const test = require('assert');
// Connection url
const url = 'mongodb://admin:admin1@ds023490.mlab.com:23490/my-jobs';
// Database Name
const dbName = 'my-jobs';
var adminDb;
const apiUlr = '/api/v1/';
app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(router);

// Connect using MongoClient
MongoClient.connect(url, function(err, client) {
  // Use the admin database for the operation
  if (err) {
    client.close();
  }
  adminDb = client.db();

  // List all the available databases


});
/* GET home page. */
router.get(apiUlr + 'users', (req, res, next) => {
  adminDb.collection('users').find().toArray((error, items) => {
    res.jsonp(items);
  });
});
router.get(apiUlr + 'jobs', (req, res, next) => {
  adminDb.collection('jobs').find().toArray(function(err, items) {
    console.log(items);
    if (err) {
      return res.json({
        success: false
      });
    }
    return res.json({
      success: true,
      items
    });
  });
});

router.post(apiUlr + 'adduser', (req, res, next) => {

  const user = req.body;
  console.log(user);
  if (!user.name || !user.lastname || !user.email || !user.password || !
    user.carrier || !user.semester) {
    return res.json({
      succes: false,
      error: 'Por favor envie parametros necesarios'
    });
  }
  adminDb.collection('users').insert({
    'email': user.email,
    'name': user.name,
    'lastname': user.lastname,
    'password': user.password,
    'carrier': user.carrier,
    'semester': user.semester,
    'type': 'student'
  }, function(err, response) {
    res.jsonp({
      success: true
    });
  });
});

router.post(apiUlr + 'login', function(req, res, next) {
  const user = req.body;

  if (!user.email || !user.password) {
    return res.json({
      succes: false,
      error: 'Por favor envie parametros necesarios'
    });
  }
  adminDb.collection('users').find({
      email: user.email,
      password: user.password
    })
    .toArray(function(err, item) {
      if (err) {
        return res.json({
          success: false,
          err
        });
      }
      res.json({
        success: true,
        user: item[0]
      });
    });
});

router.post(apiUlr + 'searchjob', function(req, res, next) {
  const job = req.body;

  const query = {
    $or: []
  }
  if (job.term) {
    const reg = new RegExp("/$"+job.term+"$/i")
    query.$or.push({
      jobs: {
        $elemMatch: {
          description: {
            $regex: reg
          }
        }
      }
    })
  }
  if(job.company_name){
      query.$or.push({
        company_name: job.company_name
      },)
  }
  adminDb.collection('company').find().toArray(function(err, items) {
    if (err) {
      return res.json({
        success: false,
        error: err
      });
    }
    res.json({
      success: true,
      items
    })
  })
})


app.listen(3000, function() {
  console.log('app is ready');
});