// foodMicroservice.js
const grpc = require('@grpc/grpc-js');
const mongoose = require('mongoose');
const protoLoader = require('@grpc/proto-loader');
const { consumeMessages, sendMessage } = require('./kafkaHelper');

// Charger le fichier food.proto
const FoodProtoPath = 'food.proto';
const FoodProtoDefinition = protoLoader.loadSync(FoodProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const foodProto = grpc.loadPackageDefinition(FoodProtoDefinition).food;

// Connect to MongoDB 
mongoose.connect('mongodb://localhost:27017/FoodManagment', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the Food schema    
const FoodModel = mongoose.model('Food', {
    title: String,
    description: String,
});

// Implémenter le service Food
const foodService = {
    GetFood: async (call, callback) => {
        const { food_id } = call.request;
        try {
            // Find the food by its ID in the database
            const food = await FoodModel.findOne({ _id: food_id });
            if (!food) {
                const notFoundError = new Error(`Food with ID ${food_id} not found`);
                console.error(notFoundError);
                throw notFoundError;
            }
            console.log('Food retrieved successfully:', food);
            callback(null, { food });
        } catch (err) {
            console.error('Error retrieving food:', err);
            callback(err);
        }
    },

    // Search for foods where title or description contains the query string
    Searchfoods: async (call, callback) => {
        const { query } = call.request;
        try {
            const foods = await FoodModel.find({
                $or: [
                    { title: { $regex: `^.*${query}.*`, $options: 'i' } },
                    { description: { $regex: `^.*${query}.*`, $options: 'i' } }
                ]
            });
            callback(null, { foods });
        } catch (err) {
            console.error('Error searching foods:', err);
            callback(err);
        }
    },
    // Ajouter d'autres méthodes au besoin
    createFood: async (call, callback) => {
        const { title, description } = call.request;
        const newFood = new FoodModel({
            title,
            description
        });
        const savedFood = await newFood.save()
        await sendMessage('foods_topic', savedFood);
        callback(null, { food: savedFood });
        await consumeMessages('foods_topic', savedFood);
    },
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(foodProto.FoodService.service, foodService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Échec de la liaison du serveur:', err);
            return;
        }
        console.log(`Le serveur s'exécute sur le port ${port}`);
        server.start();
    });
console.log(`Microservice de foods en cours d'exécution sur le port ${port}`);
