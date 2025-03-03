const express = require('express');
const axios = require('axios');

const app = express();
const port = 3003;

app.use(express.json());

app.get('/repos', async (req, res) => {
    const username = req.query.username;
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching repositories');
    }
});

app.get('/user', async (req, res) => {
    const username = req.query.username;
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching user information');
    }
});

app.listen(port, () => {
    console.log(`GitHub server running on port ${port}`);
});

export class BraveSearchServer {
    // class implementation
}
