const Joi = require('joi');
const express = require('express');
const fs = require('fs');
var assert = require('assert');
require('util').inspect.defaultOptions.depth = 5;

const app = express();

app.use(express.json());

const readJson = () => {


    const text = fs.readFileSync(__dirname + '/db.json');
    console.log("1:" + text);

    const object = JSON.parse(text);

    return object;
}



const writeToJson = async (data) => {
    const callbackWriteFile = (err) => {
        if (err) { return console.error(err); };

        console.log(`date is written to file`);
        let currentFileContent = readJson();
        assert.deepEqual(currentFileContent,data,"writting is being verified");
        
    };

    console.log("3:"+ data)
    const toWrite = JSON.stringify(data, null, 2);
    fs.writeFile(__dirname + '/db.json', toWrite, callbackWriteFile);
}


app.get('/api/courses', (req, res) => {
    res.send(readJson());
});

app.get('/api/courses/:id', (req, res) => {
    const course = readJson().courses.find(c => c.id === parseInt(req.params.id));

    if (!course) return res.status(404).send('The course with the given ID was not found.');
    res.send(course);
});


app.post('/api/courses', (req, res) => {

    const { error } = validationCourse(req.body); 

    let currentData = readJson();
    if (error) {
       
        res.status(400).send(error.details[0].message);
        return;

    }
    const course = {
        id: currentData.courses.length + 1,
        name: req.body.name
    };
    currentData.courses.push(course);

    writeToJson(currentData);

    res.send(course);
});


app.put('/api/courses/:id', (req, res) => {
    const data = readJson();
    const course = data.courses.find(c => c.id === parseInt(req.params.id));

    if (!course) {
        res.status(404).send('The course with the given Id was not found.');
        return;
    }

    const { error } = validationCourse(req.body); 

    if (error) {
        res.status(400).send(error.details[0].message);
        return;

    }
    course.name = req.body.name;

    console.log("5: "+ JSON.stringify(data));

    writeToJson(data);

    res.send(course);
});

function validationCourse(course) {

    const schema = {
        name: Joi.string().min(3).required()
    }

    return Joi.validate(course, schema);
}



app.delete('/api/courses/:id', (req, res) => {
    const data = readJson();

    console.log("4: "+ Json.stringify(data));
    const course = data.courses.find(c => c.id === parseInt(req.params.id));

    if (!course) return res.status(404).send('The course with the given Id was not found.');

    const index = data.courses.indexOf(course);
    data.courses.splice(index, 1);

    writeToJson(data);

    res.send(course);

});



// PORT environment variable..
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));