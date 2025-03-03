const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.json());

app.get('/read-file', (req, res) => {
    const filePath = req.query.path;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.send(data);
    });
});

app.post('/write-file', (req, res) => {
    const { path: filePath, content } = req.body;
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error writing file');
        }
        res.send('File written successfully');
    });
});

app.listen(port, () => {
    console.log(`Filesystem server running on port ${port}`);
});
