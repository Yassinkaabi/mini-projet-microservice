const { gql } = require('@apollo/server');
// Définir le schéma GraphQL
const typeDefs = `#graphql

type Food {
    _id: ID!
    title: String!
    description: String!    
}

type Menu {
    id: ID!
    title: String!
    description: String!
}

type Query {
    food(id: String!): Food
    foods: [Food]
    menu(id: String!): Menu
    menus: [Menu]
}

type Mutation {
    addFood(title: String!, description: String!): Food!
    addMenu(title: String!, description: String!): Menu!
}
`;
module.exports = typeDefs
