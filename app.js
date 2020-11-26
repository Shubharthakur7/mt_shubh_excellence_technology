const app = require('express')();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');


const { execQuery } = require('./db');


/**
 * Middlewares 
 **/
app.use(cors());
app.use(bodyParser.json())

/**
 * constants based on application requirments
 */
const maxScore = 10;
const totalRound = 3;


/**
 *(A) Api for inserting new candidate
 */
app.post('/add-candidate', function (req, res) {

    if (!req.body.email || !req.body.name) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        INSERT INTO candidate (name,email) values (?,?);
    `;

    execQuery(query, [req.body.name, req.body.email])
        .then(async (result) => {
            return res.json({
                "message": "record inserted successfully"
            });

        })
        .catch(error => {
            return res.json({
                "message": "Error in inserting new candidate data"
            });
        });
});


/**
 *(B) Api for inserting new test score
 */
app.post('/insert-score', function (req, res) {
    let body = req.body;
    if (!body.candidate_id || !body.score || !body.round) return res.json({
        "message": "Invalid request!"
    });

    if (body.score > maxScore && body.score < 0) return res.json({
        "message": "Score must be in between 0 and 10"
    });

    if (body.round > 3 || body.round < 1) return res.json({
        "message": "There may be just three rounds"
    });

    let query = `
        INSERT INTO test_score (candidate_id,score,round) VALUES (?,?,?);
    `;
    execQuery(query, [body.candidate_id, body.score, body.round])
        .then(async (result) => {
            return res.json({
                "message": "record inserted successfully"
            });

        })
        .catch(error => {
            let msg;
            // console.log(error);
            msg = (error.errno == 1452) ? "candidate does not exist" : "Error in score updation"
            return res.json({
                "message": msg
            });
        });
});


/**
 *(C) Api for getting the average marks per round for all candidate
 */
app.get('/avg-marks', function (req, res) {

    let query = `
        SELECT round , AVG(score)
        FROM test_score
        GROUP BY round;
    `;
    execQuery(query)
        .then(async (result) => {

            console.log(result);
            return res.json({
                "result": result
            });
        })
        .catch(error => {
            console.error(error);
            return res.json({
                "message": "Error in getting data"
            });
        });
});


/**
 *(D) Api for getting candiate having max score
 */
app.get('/max-marks', function (req, res) {

    let query = `
     SELECT id,name,email
     FROM candidate
     WHERE id=(
                 SELECT candidate_id
                 FROM test_score
                 GROUP BY candidate_id
                 ORDER BY sum(score) DESC
                 LIMIT 0,1               
                )
    `;
    execQuery(query,)
        .then(async (result) => {
            console.log(result);
            return res.json({
                "result": result
            });

        })
        .catch(error => {
            console.error(error);
            return res.json({
                "message": "Error in getting data"
            });
        });
});


/**
 * Server startup code
 */
const port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log('server is listening on port:' + port);
});
