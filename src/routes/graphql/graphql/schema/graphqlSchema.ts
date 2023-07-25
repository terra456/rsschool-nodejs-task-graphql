import { UUIDType } from '../../types/uuid.js'
import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLID,
  GraphQLString,
  GraphQLArgs,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLScalarType,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLError,
  locatedError,
  syntaxError
} from 'graphql';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type userT = {id: string, name: string, balance: number };
type PostT = { id: string, title: string, content: string, authorId: string };
type ProfileT = {
  isMale: boolean,
  yearOfBirth: number,
  user: userT,
  userId: string,
  memberType: MemberT,
  memberTypeId: MemberEnumT,
};
type SubscribersOnAuthorsT = {
  subscriberId: string,
  authorId: string
}
type MemberT = {
  id: MemberEnumT,
  discount: number,
  postsLimitPerMonth: number,
  profiles: ProfileT,
}

enum MemberEnumT {
  BASIC = 'basic',
  BUSINESS = 'business',
}

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'basic' },
    BUSINESS: { value: 'business' },
    basic: { value: 'basic' },
    business: { value: 'business' },
  }
});

const MemberTypeType = new GraphQLObjectType({
  name: 'memberType',
  fields: () => ({
    id: {
      type: MemberTypeId,
    },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: { type: UserType },
    userId: { type: UUIDType },
    memberType: {
      type: MemberTypeType,
      async resolve(parent: ProfileT) {
        const memberType = await prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId,
          },
        });
        return memberType;
      }
    },
    memberTypeId: {
      type: MemberTypeId,
      async resolve(parent: ProfileT) {
        const memberType = await prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId,
          },
        });
        return memberType;
      }
    }
  })
})

const SubscribersOnAuthorsType = new GraphQLObjectType({
  name: 'subscribersOnAuthorsType',
  fields: () => ({
    subscriber: {
      type: UserType,
      async resolve(parent: SubscribersOnAuthorsT) {
        const user = await prisma.user.findUnique({
          where: {
            id: parent.subscriberId,
          },
        });
        return user;
      },
    },
    subscriberId: { type: UUIDType },
    author: {
      type: UserType,
      async resolve(parent: SubscribersOnAuthorsT) {
        const author = await prisma.user.findUnique({
          where: {
            id: parent.authorId,
          },
        });
        return author;
      },
    },
    authorId: { type: UUIDType },
  })
})

const UserType: GraphQLObjectType<userT> = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: {type: UUIDType },
    name: {type: GraphQLString },
    balance: {type: GraphQLFloat },
    profile: { type: ProfileType,
      async resolve(parent: userT) {
        const profile = await prisma.profile.findUnique({
          where: {
            userId: parent.id,
          },
        });
        return profile;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent: userT) {
        const post = await prisma.post.findMany({
          where: {
            authorId: parent.id,
          },
        });
        return post;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent: userT) {
        const authors = await prisma.subscribersOnAuthors.findMany({
          where: {
            subscriberId: parent.id,
          },
        });
        const users = authors.map(async (author) => {
          const user = await prisma.user.findUnique({
            where: {
              id: author.authorId,
            },
          });
          return user;
        }).filter((el) => el !== null);
        return users;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent: userT) {
        const subscribers = await prisma.subscribersOnAuthors.findMany({
          where: {
            authorId: parent.id,
          },
        });
        const users = subscribers.map(async (subscriber) => {
          const user = await prisma.user.findUnique({
            where: {
              id: subscriber.subscriberId,
            },
          });
          return user;
        }).filter((el) => el !== null);
        return users;
      },
    },
  }),
})

const PostType: GraphQLObjectType<PostT> = new GraphQLObjectType({
  name: 'post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
    author: {
      type: UserType,
      async resolve(parent: PostT) {
        const user = await prisma.user.findUnique({
          where: {
            id: parent.authorId,
          },
        });
        return user;
      },
    },
  }),
})

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {

    profiles: {
      type: new GraphQLList(ProfileType),
      args: { id: { type: UUIDType }},
      async resolve () {
        return prisma.profile.findMany();
      }
    },

    profile: {
      type: ProfileType,
      args: { id: { type: UUIDType }},
      async resolve (_parent, args: {id: string}) {
        if (!args.id) {
          throw new GraphQLError(`No ID passed`);
        }
        const profile = await prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        });
        return profile;
      },
    },

    memberType: {
      type: MemberTypeType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      async resolve(_parent, args: { id: MemberEnumT }) {
        if (!args.id) {
          return new GraphQLError(`No ID passed`);
        }
        const memberType = await prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
        return memberType;
      }
    },

    memberTypes: {
      type: new GraphQLList(MemberTypeType),
      args: { id: { type: MemberTypeId } },
      async resolve () {
        return prisma.memberType.findMany();
      }
    },

    user: {
      type: UserType,
      args: { id: { type: UUIDType } },
      async resolve (_parent, args: {id: string}) {
        if (!args.id) {
          throw new GraphQLError(`No ID passed`);
        }
        const user = await prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
        return user;
      }
    },
    
    users: {
      type: new GraphQLList(UserType),
      args: { id: { type: UUIDType } },
      async resolve () {
        return prisma.user.findMany();
      }
    },

    post: {
      type: PostType,
      args: { id: { type: UUIDType } },
      async resolve (_parent, args: {id: string}) {
        if (!args.id) {
          throw new GraphQLError(`No ID passed`);
        }
        const post = await prisma.post.findUnique({
          where: {
            id: args.id,
          },
        });
        return post;
      }
    },

    posts: {
      type: new GraphQLList(PostType),
      args: { id: { type: UUIDType } },
      async resolve () {
        return prisma.post.findMany();
      }
    },
  },
})

export default new GraphQLSchema({
  query: Query,
})