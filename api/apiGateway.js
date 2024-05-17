const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files for foods and menus
const foodProtoPath = '../proto/food.proto';
const menuProtoPath = '../proto/menu.proto';

const resolvers = require('./resolvers');
const typeDefs = require('../schema');

// Create a new Express application
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

// Connect to database
const connectToMongoDB = require('../database/db');

// Apply middleware
app.use(cors());
app.use(bodyParser.json());

// Debugging middleware to log request body
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

// Create an instance of ApolloServer with the schema and resolvers
const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
    app.use(expressMiddleware(server));
});

// Food routes
app.get('/foods', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
    client.Searchfoods({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.foods);
        }
    });
});

app.get('/foods/:id', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
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
    const { title, description, menuId } = req.body;

    if (!title || !description || !menuId) {
        return res.status(400).json({ error: 'Title, description, and menuId are required' });
    }

    const request = { title, description, menu_id: menuId };
    client.CreateFood(request, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.food);
        }
    });
});

app.put('/foods/:id', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
    const { id } = req.params;
    const { title, description, menuId } = req.body;

    if (!title || !description || !menuId) {
        return res.status(400).json({ error: 'Title, description, and menuId are required' });
    }

    const request = { food_id: id, title, description, menu_id: menuId };
    client.UpdateFood(request, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.food);
        }
    });
});

app.delete('/foods/:id', (req, res) => {
    const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
    const { id } = req.params;

    client.DeleteFood({ food_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: response.message });
        }
    });
});

// Menu routes
app.get('/menu', (req, res) => {
    const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
    client.searchMenu({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.menus);
        }
    });
});

app.get('/menu/:id', (req, res) => {
    const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getMenu({ menu_id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.menu);
        }
    });
});

app.post('/menu/create', (req, res) => {
    const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name required' });
    }

    const request = { name };
    client.createMenu(request, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.menu);
        }
    });
});

// Start the Express application
const port = 3000;
app.listen(port, () => {
    connectToMongoDB();
    console.log(`API Gateway running on port ${port}`);
});
