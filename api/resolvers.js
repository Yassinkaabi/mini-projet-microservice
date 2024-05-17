const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the proto files for foods and menus
const FoodProtoPath = '../proto/food.proto';
const menuProtoPath = '../proto/menu.proto';

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

const foodProto = grpc.loadPackageDefinition(FoodProtoDefinition).food;
const menuProto = grpc.loadPackageDefinition(menuProtoDefinition).menu;

const resolvers = {
    Query: {
        food: (_, { id }) => {
            const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.GetFood({ food_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.food);
                    }
                });
            });
        },
        foods: () => {
            const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.Searchfoods({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.foods);
                    }
                });
            });
        },
        menu: (_, { id }) => {
            const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.GetMenu({ menu_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.menu);
                    }
                });
            });
        },
        menus: () => {
            const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchMenu({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.menus);
                    }
                });
            });
        },
    },

    Mutation: {
        addFood: (_, { title, description, menuId }) => {
            const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.CreateFood({ title, description, menu_id: menuId }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.food);
                    }
                });
            });
        },
        updateFood: (_, { id, title, description, menuId }) => {
            const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.UpdateFood({ food_id: id, title, description, menu_id: menuId }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.food);
                    }
                });
            });
        },
        deleteFood: (_, { id }) => {
            const client = new foodProto.FoodService('localhost:50051', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.DeleteFood({ food_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.message);
                    }
                });
            });
        },
        addMenu: (_, { name }) => {
            const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.CreateMenu({ name }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.menu);
                    }
                });
            });
        }
    },

    Food: {
        menu: (food) => {
            const client = new menuProto.MenuService('localhost:50052', grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.GetMenu({ menu_id: food.menuId }, (err, response) => {
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
