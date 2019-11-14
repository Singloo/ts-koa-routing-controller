import { ApolloServer, gql, Config } from 'apollo-server-koa'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql'
import { sleep } from '../utils'
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'hello worlllld',
      },
    },
  }),
})
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Apartment {
    id: ID
    
  }
  type Query {
    wallo: String
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    wallo: async () => {
      await sleep(1000)
      return 'Hello world!'
    },
  },
}
const apolloConfig: Config = {
  resolvers,
  typeDefs,
  schema,
}
const server = new ApolloServer(apolloConfig)
console.log(server.graphqlPath)
const middleware = server.getMiddleware()
export default middleware