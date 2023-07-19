import { UUIDType } from '../types/uuid.js'
import { GraphQLObjectType, GraphQLEnumType, GraphQLID, GraphQLString, GraphQLArgs, GraphQLSchema, GraphQLInt, GraphQLList } from 'graphql';

type userT = {id: string, name: string, balance: number };
type PostT = { id: string, title: string, content: string, authorId: string };

const users: Array<userT>= [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Jane',
    balance: 0
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa5',
    name: 'Sam',
    balance: 5
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa4',
    name: 'Fill',
    balance: 40
  },
]
const posts: Array<PostT>= [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afc6',
    title: 'first article',
    content: 'ejrfpoewkr wer erwpqoerwqp l',
    authorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afd6',
    title: 'second article',
    content: 'rkwerw[q irewor riweopr',
    authorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afb6',
    title: 'last article',
    content: 'e3e fkpelrfe[wp',
    authorId: '3fa85f64-5717-4562-b3fc-2c963f66afa4',
  },
  
]


const UserType: GraphQLObjectType<userT> = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: {type: UUIDType },
    name: {type: GraphQLString },
    balance: {type: GraphQLInt },
    posts: {
      type: new GraphQLList(PostType),
      resolve(parent: userT, args) {
        return posts.filter((post) => post.authorId === parent.id);
      },
    },
  }),
})

const PostType: GraphQLObjectType<PostT> = new GraphQLObjectType({
  name: 'post',
  fields: () => ({
    id: {type: UUIDType },
    title: {type: GraphQLString },
    content: {type: GraphQLString },
    user: {
      type: UserType,
      resolve(parent: PostT, args) {
        return users.find((user) => user.id === parent.authorId);
      },
    },
  }),
})

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: UUIDType } },
      async resolve (parent, args: {id: string}) {
      //   const res = await Prisma.user.findUnique({
      //     where: {
      //       id: req.params.userId,
      //     },
      //   });
        return users.find((user) => user.id === args.id);
      }
    },

    post: {
      type: PostType,
      args: { id: { type: UUIDType } },
      async resolve (parent, args: {id: string}) {
        return posts.find((post) => post.id === args.id);
      }
    },

    users: {
      type: new GraphQLList(UserType),
      args: { id: { type: UUIDType } },
      async resolve (parent, args) {
        return users;
      }
    },

    posts: {
      type: new GraphQLList(PostType),
      args: { id: { type: UUIDType } },
      async resolve (parent, args) {
        return posts;
      }
    },

  },
})

export default new GraphQLSchema({
  query: Query,
})