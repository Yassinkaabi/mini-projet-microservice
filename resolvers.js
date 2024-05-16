// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// Charger les fichiers proto pour les films et les séries TV
const FoodProtoPath = 'food.proto';
const menuProtoPath = 'menu.proto';
const FoodProtoDefinition = protoLoader.loadSync(FoodProtoPath, {
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
const foodProto = grpc.loadPackageDefinition(FoodProtoDefinition).movie;
const menuProto = grpc.loadPackageDefinition(menuProtoDefinition).tvShow;
// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
    Query: {
        food: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de films
            const client = new foodProto.FoodService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getFood({ movie_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.movie);
                    }
                });
            });
        },
        foods: () => {
            // Effectuer un appel gRPC au microservice de films
            const client = new foodProto.FoodService('localhost:50051',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchfoods({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.movies);
                    }
                });
            });
        },
        menu: (_, { id }) => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new menuProto.MenuService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getMenu({ tv_show_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_show);
                    }
                });
            });
        },
        menus: () => {
            // Effectuer un appel gRPC au microservice de séries TV
            const client = new menuProto.MenuService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchMenu({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.tv_shows);
                    }
                });
            });
        },
    },

    Mutation: {
        addFood: async (_, { title, description }) => {
            const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.CreateFood({ title, description }, function (err, response) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.food);
                    }
                });
            });
        },
        addMenu: async (_, { title, description }) => {
            const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.CreateMenu({ title, description }, function (err, response) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.menu);
                    }
                });
            });
        }
    }




};
module.exports = resolvers;