// apiGateway.js
const mongoose = require('mongoose');
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger les fichiers proto pour les films et les séries TV
const foodProtoPath = 'food.proto';
const menuProtoPath = 'menu.proto';

const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Créer une nouvelle application Express
const app = express();
const foodProtoDefinition = protoLoader.loadSync(foodProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const menuProtoDefinition = protoLoader.loadSync(menuProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const foodProto = grpc.loadPackageDefinition(foodProtoDefinition).food;
const menuProto = grpc.loadPackageDefinition(menuProtoDefinition).menu;

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/FoodManagment', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });
// Appliquer le middleware ApolloServer à l'application Express
server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
    );
});
app.use(bodyParser.json());
app.get('/foods', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051',
        grpc.credentials.createInsecure());
    client.Searchfoods({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.foods);
        }
    });
});
app.get('/foods/:id', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051',
        grpc.credentials.createInsecure());
    const _id = req.params.id;
    client.GetFood({ food_id: _id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.food);
        }
    });
});

app.post('/foods/create', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
    const { title, description } = req.body;

    // Check if title and description are present
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }
    const request = { title, description };
    client.CreateFood(request, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.food);
        }
    });
});

app.get('/menu', (req, res) => {
    const client = new menuProto.MenuService('localhost:50052',
        grpc.credentials.createInsecure());
    client.searchMenu({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.menus);
        }
    });
});
app.get('/menu/:id', (req, res) => {
    const client = new menuProto.MenuService('localhost:50052',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getMenu({ tvShowId: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.menu);
        }
    });
});

app.post('/menu/create', (req, res) => {
    const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
    const { title, description } = req.body;

    // Check if title and description are present
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const request = { title, description };

    client.createMenu(request, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.menu);
        }
    });
});
// Démarrer l'application Express
const port = 3000;
app.listen(port, () => {
    connectToMongoDB();
    console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});