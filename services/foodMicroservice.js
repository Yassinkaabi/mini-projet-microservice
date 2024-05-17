// foodMicroservice.js
const grpc = require('@grpc/grpc-js');
const mongoose = require('mongoose');
const protoLoader = require('@grpc/proto-loader');
const { consumeMessages, sendMessage } = require('../kafkaHelper');

// Load the food.proto file
const FoodProtoPath = '../proto/food.proto';
const FoodProtoDefinition = protoLoader.loadSync(FoodProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const foodProto = grpc.loadPackageDefinition(FoodProtoDefinition).food;

// Connect to database
const connectToMongoDB = require('../database/db');

// Define the Food and Menu schemas
const FoodModel = require('../models/foodModel');
const MenuModel = require('../models/menuModel');

// Implement the food service
const foodService = {
    GetFood: async (call, callback) => {
        const { food_id } = call.request;
        try {
            const food = await FoodModel.findOne({ _id: food_id }).populate('menuId');
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

    Searchfoods: async (call, callback) => {
        const { query } = call.request;
        try {
            const foods = await FoodModel.find({
                $or: [
                    { title: { $regex: `^.*${query}.*`, $options: 'i' } },
                    { description: { $regex: `^.*${query}.*`, $options: 'i' } }
                ]
            }).populate('menuId');
            callback(null, { foods });
        } catch (err) {
            console.error('Error searching foods:', err);
            callback(err);
        }
    },

    CreateFood: async (call, callback) => {
        const { title, description, menu_id } = call.request;
        const newFood = new FoodModel({
            title,
            description,
            menuId: menu_id
        });
        try {
            const savedFood = await newFood.save();
            await sendMessage('foods_topic', savedFood);
            callback(null, { food: savedFood });
            await consumeMessages('foods_topic', savedFood);
        } catch (err) {
            console.error('Error creating food:', err);
            callback(err);
        }
    },

    UpdateFood: async (call, callback) => {
        const { food_id, title, description, menu_id } = call.request;
        try {
            const updatedFood = await FoodModel.findByIdAndUpdate(
                food_id,
                { title, description, menuId: menu_id },
                { new: true }
            );
            if (!updatedFood) {
                const notFoundError = new Error(`Food with ID ${food_id} not found`);
                console.error(notFoundError);
                throw notFoundError;
            }
            console.log('Food updated successfully:', updatedFood);
            callback(null, { food: updatedFood });
        } catch (err) {
            console.error('Error updating food:', err);
            callback(err);
        }
    },

    DeleteFood: async (call, callback) => {
        const { food_id } = call.request;
        try {
            const deletedFood = await FoodModel.findByIdAndDelete(food_id);
            if (!deletedFood) {
                const notFoundError = new Error(`Food with ID ${food_id} not found`);
                console.error(notFoundError);
                throw notFoundError;
            }
            console.log('Food deleted successfully:', deletedFood);
            callback(null, { message: 'Food deleted successfully' });
        } catch (err) {
            console.error('Error deleting food:', err);
            callback(err);
        }
    }
};

// Create and start the gRPC server
const server = new grpc.Server();
server.addService(foodProto.FoodService.service, foodService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server running on port ${port}`);
        connectToMongoDB();
        server.start();
    });
console.log(`Food microservice running on port ${port}`);
