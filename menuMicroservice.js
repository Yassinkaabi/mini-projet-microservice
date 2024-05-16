const grpc = require('@grpc/grpc-js');
const mongoose = require('mongoose');
const protoLoader = require('@grpc/proto-loader');
const { consumeMessages, sendMessage } = require('./kafkaHelper')
// Charger le fichier menu.proto
const menuShowProtoPath = 'menu.proto';
const menuProtoDefinition = protoLoader.loadSync(menuShowProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const menuProto = grpc.loadPackageDefinition(menuProtoDefinition).menu;

mongoose.connect('mongodb://localhost:27017/FoodManagment', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the movie schema
const menuModel = mongoose.model('Menu', {
    title: String,
    description: String,
});

// Implémenter le service de séries TV
const menuService = {
    getMenu: async (call, callback) => {
        // Récupérer les détails de la série TV à partir de la base de données
        const { menu_id } = call.request;
        try {
            // Find the menu by its ID in the database
            const menu = await menuModel.findOne({ _id: menu_id });
            if (!menu) {
                const notFoundError = new Error(`Movie with ID ${menu_id} not found`);
                console.error(notFoundError);
                throw notFoundError;
            }
            console.log('Menu retrieved successfully:', menu);
            callback(null, { menu: menu });
        } catch (err) {
            console.error('Error retrieving Menu:', err);
            callback(err);
        }
    },
    // Search for menu where title or description contains the query string
    SearchMenu: async (call, callback) => {
        const { query } = call.request;
        try {
            const menu = await menuModel.find({
                $or: [
                    { title: { $regex: `^.*${query}.*`, $options: 'i' } },
                    { description: { $regex: `^.*${query}.*`, $options: 'i' } }
                ]
            });
            callback(null, { tv_shows: menu });
        } catch (err) {
            console.error('Error searching tv Show:', err);
            callback(err);
        }
    },

    CreateMenu: async (call, callback) => {
        const { title, description } = call.request;
        const newMenu = new menuModel({
            title,
            description,
        });
        const menuSaved = await newMenu.save()
        await sendMessage('menus_topic', { title, description });
        callback(null, { menu: menuSaved });
        await consumeMessages('menus_topic', menuSaved);
    },
};
// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(menuProto.MenuService.service, menuService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Échec de la liaison du serveur:', err);
            return;
        }
        console.log(`Le serveur s'exécute sur le port ${port}`);
        server.start();
    });
console.log(`Microservice de menu en cours d'exécution sur le port ${port}`);
consumeMessages('menus_topic');
