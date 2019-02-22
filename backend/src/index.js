//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const neode = require('neode');
const instance = neode.fromEnv();

instance.model('Question', {
    question_id: {
        primary: true,
        type: 'uuid',
        // Creates an Exists Constraint in Enterprise mode
        required: true, 
    },
    title: {
        type: 'string',
        unique: 'true', // Creates a Unique Constraint
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
const app = express();

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));

// retrieve all questions
app.get('/', (req, res) => {

    instance.all('Question')
    .then(collection => {
        const foo = collection.map(q => ({id: q.get('question_id'), 
                title: q.get('title'), description: q.get('description'),
                answers: q.get('answers').length, author: q.get('author')}));
        res.send(foo);

    })

});

// get a specific question
app.get('/:id', (req, res) => {

  instance.find('Question', req.params.id)
    .then(q => {
        try {
            answ = JSON.parse(q.get('answers'));
        } catch ({error}) {
            answ = "";
        }

        const foo = {id: q.get('question_id'), 
        title: q.get('title'), description: q.get('description'),
        answers: [answ], author: q.get('author')};

        res.send(foo);
    });
});

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://surminen-test.au.auth0.com/.well-known/jwks.json`
    }),
  
    // Validate the audience and the issuer.
    audience: 'U91SyjTlj4bdMU9XHVmJPleBLKL1mh6g',
    issuer: `https://surminen-test.au.auth0.com/`,
    algorithms: ['RS256']
  });

// insert a new question
app.post('/', checkJwt, (req, res) => {
    const {title, description} = req.body;

    const x = instance.create('Question', {
        title: title, description: description, answers: [], author: req.user.name
    }).then(q => {
        // res.status(200).send();
    });

    res.status(200).send();
  });
  
  // insert a new answer to a question
  app.post('/answer/:id', checkJwt, (req, res) => {
    const {answer} = req.body;
  
    instance.find('Question', req.params.id)
    .then(q => {
        q.update({question_id: req.params.id, answers: [JSON.stringify({answer: answer, author: req.user.name})], author: req.user.name});
    });

    res.status(200).send();
  });

// start the server
app.listen(8081, () => {
  console.log('listening on port 8081');
});