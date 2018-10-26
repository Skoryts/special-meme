const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const emitter = new EventEmitter();

app.use(bodyParser.json());

const styles = `<style>
    .load-bar{
        background: red;
        height: 10px;
        width: 10px;
        display: inline-block;
        margin-left: 1px;
    }
</style>`;

app.all('*', async (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write(styles);
    res.write(`<h1>Process has been started:</h1>\n`);

    let persons = [];

    if (req.body.length) {
        persons = [...req.body]
    }
    if (req.query.persons){
        persons = [...persons, ...JSON.parse(req.query.persons)]
    }
    emitter.on("chunk", (message) => res.write(message));

    for await (const person of persons) {
        await job(person);
    }

    res.end(`<h1>Processed</h1>`);
    emitter.removeAllListeners('chunk')

});

function job(person) {
    return new Promise(resolve => {
        let progress = 0;
        const countOfIterations = Math.ceil(Math.random() * 25);
        const step = Math.floor(100 / countOfIterations);
        const timer = setInterval(() => {
            if (progress < 100) {
                progress += step;
                progress = progress > 100 ? 100 : progress
                const message = `<div>Person ${person.name} processing: ${progress}%: ${"<div class='load-bar'></div>".repeat(progress/2)}\n</div>`;
                emitter.emit("chunk", message)
            } else {
                clearInterval(timer);
                resolve(person)
            }
        }, 100);
    })
}

app.listen(3000, () => console.log('app is running'));
