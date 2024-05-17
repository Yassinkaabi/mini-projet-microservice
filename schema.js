// Définir le schéma GraphQL
const typeDefs = `#graphql

type Food {
        _id: ID!
        title: String!
        description: String!
        menuId: ID!
        menu: Menu
    }

    type Menu {
        id: ID!
        name: String!
    }

    type Query {
        food(id: String!): Food
        foods: [Food]
        menu(id: String!): Menu
        menus: [Menu]
    }

    type Mutation {
        addFood(title: String!, description: String!, menuId: String!): Food!
        updateFood(id: String!, title: String!, description: String!, menuId: String!): Food!
        deleteFood(id: String!): String!
        addMenu(name: String!): Menu!
    }
`;
module.exports = typeDefs
