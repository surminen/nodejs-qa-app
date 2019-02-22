//import dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet');
var morgan = require('morgan');
var jwt = require('express-jwt');
var jwksRsa = require('jwks-rsa');
// Use Neode for DB object modelling
var neode = require('neode');
var instance = neode.fromEnv();
// Define the model to use storing data in neo4j
instance.model('Question', {
    question_id: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    title: {
        type: 'string',
        unique: 'true',
    },
    description: {
        type: 'string',
    },
    answers: {
        type: 'list',
    },
    author: {
        type: 'string',
    }
});
// define the Express app
var app = express();
// enhance your app security with Helmet
app.use(helmet());
// use bodyParser to parse application/json content-type
app.use(bodyParser.json());
// enable all CORS requests
app.use(cors());
// log HTTP requests
app.use(morgan('combined'));
// retrieve all questions
app.get('/', function (req, res) {
    instance.all('Question')
        .then(function (collection) {
        var foo = collection.map(function (q) { return ({ id: q.get('question_id'),
            title: q.get('title'), description: q.get('description'),
            answers: q.get('answers').length, author: q.get('author') }); });
        res.send(foo);
    });
});
// get a specific question
app.get('/:id', function (req, res) {
    instance.find('Question', req.params.id)
        .then(function (q) {
        try {
            var answ = JSON.parse(q.get('answers'));
        }
        catch (_a) {
            var error = _a.error;
            answ = "";
        }
        var ques = { id: q.get('question_id'),
            title: q.get('title'), description: q.get('description'),
            answers: [answ], author: q.get('author') };
        res.send(ques);
    });
});
var checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://surminen-test.au.auth0.com/.well-known/jwks.json"
    }),
    // Validate the audience and the issuer.
    audience: 'U91SyjTlj4bdMU9XHVmJPleBLKL1mh6g',
    issuer: "https://surminen-test.au.auth0.com/",
    algorithms: ['RS256']
});
// insert a new question
app.post('/', checkJwt, function (req, res) {
    var _a = req.body, title = _a.title, description = _a.description;
    var x = instance.create('Question', {
        title: title, description: description, answers: [], author: req.user.name
    }).then(function (q) {
        // Nothing yet
    });
    res.status(200).send();
});
// insert a new answer to a question
app.post('/answer/:id', checkJwt, function (req, res) {
    var answer = req.body.answer;
    instance.find('Question', req.params.id)
        .then(function (q) {
        q.update({ question_id: req.params.id, answers: [JSON.stringify({ answer: answer, author: req.user.name })], author: req.user.name });
    });
    res.status(200).send();
});
// start the server
app.listen(8081, function () {
    console.log('listening on port 8081');
});
