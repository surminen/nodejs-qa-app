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

//instance.create('Question', {
//    title: 'Test title', answers: ['ans1', 'ans2']
//})
//.then(question => {
//    console.log(question.get('answers')[0]); // 'Adam'
//});

// define the Express app
const app = express();

// the database
const questions = [];

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
  const qs = questions.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    answers: q.answers.length,
  }));

  instance.all('Question')
    .then(collection => {
        const foo = collection.map(q => ({id: q.get('question_id'), 
                title: q.get('title'), description: q.get('description'),
                answers: q.get('answers').length, author: q.get('author')}));
        console.log(collection.length);
        res.send(foo);

    })


    console.log('xx');
    console.log(questions);

//res.send(qs);
//  res.send(foo);
});

// get a specific question
app.get('/:id', (req, res) => {
//  const question = questions.filter(q => (q.id === req.params.id));
//   if (question.length > 1) return res.status(500).send();
//   if (question.length === 0) return res.status(404).send();

  console.log('yy')
  instance.find('Question', req.params.id)
    .then(q => {
        console.log(q.get('title')); // 1

        try {
            r = JSON.parse(q.get('answers'));
        } catch ({error}) {
            r = "";
        }

        const foo = {id: q.get('question_id'), 
        title: q.get('title'), description: q.get('description'),
        answers: [r], author: q.get('author')};

        console.log(foo);

        res.send(foo);
    });

//   res.send(question[0]);
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
        // title: title, description: description, answers: [JSON.stringify({answer: 'Nothing yet', author: ''})], author: req.user.name
    }).then(q => {
        const newQuestion = {
            //        id: questions.length + 1,
                    id: q.get('question_id'),
                    title,
                    description,
                    answers: [],
                    // answers: [JSON.stringify({answer: 'Nothing yet', author: ''})],
                    author: req.user.name,
                };
        questions.push(newQuestion);
            
    });

  
    res.status(200).send();
  });
  
  // insert a new answer to a question
  app.post('/answer/:id', checkJwt, (req, res) => {
    const {answer} = req.body;
  
    console.log(answer);
    console.log(req.params.id);

    instance.find('Question', req.params.id)
    .then(q => {
        console.log('zz');
        console.log(q);
        q.update({question_id: req.params.id, answers: [JSON.stringify({answer: answer, author: req.user.name})], author: req.user.name});
    });

    // const qs = questions.map(q => ({
    //     id: q.id,
    //     title: q.title,
    //     description: q.description,
    //     answers: q.answers.length,
    //   }));

    // console.log('questions: ' + qs[0].id);
    // console.log('id: ' + req.params.id);

    
    // const question = questions.filter(q => (q.id === req.params.id));
    // console.log('question length: ' + question.length);
    // if (question.length > 1) return res.status(500).send();
    // if (question.length === 0) return res.status(404).send();
  
    // question[0].answers.push({
    //   answer,
    //   author: req.user.name,
    // });
  
    // console.log('question: ' + question[0].title);
    // console.log('question: ' + question[0].answers[0].answer);
    // console.log('question: ' + question[0]);

    res.status(200).send();
  });

// start the server
app.listen(8081, () => {
  console.log('listening on port 8081');
});