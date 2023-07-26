import { PrismaClient } from "@prisma/client";
import { MemberEnumT, NewPostT, NewProfileT, NewUserT, PostT, ProfileT, userT } from "./types.js";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

const resolvers = {
    getProfile: async (_parent, args: {id: string}) => {
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
  
    getProfileMemberType: async (parent: ProfileT) => {
      const memberType = await prisma.memberType.findUnique({
        where: { id: parent.memberTypeId },
      });
      return memberType;
    },

    getProfileMemberTypeId: async (parent: ProfileT) => {
      const memberType = await prisma.memberType.findUnique({
        where: { id: parent.memberTypeId },
      });
      return memberType;
    },
  
    getProfiles: async () =>{
      return prisma.profile.findMany();
    },

    getUserProfile: async (parent: userT) => {
      const profile = await prisma.profile.findUnique({
        where: {
          userId: parent.id,
        },
      });
      return profile;
    },

    getUserPosts: async (parent: userT) => {
      const post = await prisma.post.findMany({
        where: { authorId: parent.id },
      });
      return post;
    },

    getUserSubscribedTo:async (parent: userT) => {
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

    getSubscribedToUser: async (parent: userT) => {
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

    getPostAuthor: async (parent: PostT) => {
      const user = await prisma.user.findUnique({
        where: {
          id: parent.authorId,
        },
      });
      return user;
    },

    getMemberType: async (_parent, args: { id: MemberEnumT }) => {
      if (!args.id) {
        return new GraphQLError(`No ID passed`);
      }
      const memberType = await prisma.memberType.findUnique({
        where: {
          id: args.id,
        },
      });
      return memberType;
    },

    getMemberTypes: async () => {
      return prisma.memberType.findMany();
    },

    getUser: async (_parent, args: {id: string}) => {
      if (!args.id) {
        throw new GraphQLError(`No ID passed`);
      }
      const user = await prisma.user.findUnique({
        where: {
          id: args.id,
        },
      });
      return user;
    },

    getUsers: async () => {
      return prisma.user.findMany();
    },

    getPost: async (_parent, args: {id: string}) => {
      if (!args.id) {
        throw new GraphQLError(`No ID passed`);
      }
      const post = await prisma.post.findUnique({
        where: {
          id: args.id,
        },
      });
      return post;
    },

    getPosts: async () => {
      return prisma.post.findMany();
    },

    createPost: async (_parent, args: {dto: NewPostT}) => {
      return await prisma.post.create({
        data: args.dto,
      });
    },

    createUser: async (_parent, args: { dto: NewUserT }) => {
      return await prisma.user.create({
        data: args.dto,
      });
    },

    createProfile: async (_parent, args: { dto: NewProfileT }) => {
      return await prisma.profile.create({
        data: args.dto,
      });
    },

    changePost: async (_parent, args: { id: string,dto: NewPostT}) => {
      return await prisma.post.update({
        where: { id: args.id },
        data: args.dto,
      });
    },

    changeUser: async (_parent, args: { id: string, dto: NewUserT }) => {
      return await prisma.user.update({
        where: { id: args.id },
        data: args.dto,
      });
    },

    changeProfile: async (_parent, args: { id: string, dto: NewProfileT }) => {
      return await prisma.profile.update({
        where: { id: args.id },
        data: args.dto,
      });
    },

    deletePost: async (_parent, args: { id: string }) => {
      try {
        await prisma.post.delete({
          where: { id: args.id },
        })
        return true;
      }
      catch (e) {
        return e;
      }
    },

    deleteUser: async (_parent, args: { id: string }) => {
      try {
        await prisma.user.delete({
          where: { id: args.id },
        });
        return true;
      }
      catch (e) {
        return e;
      }
    },

    deleteProfile: async (_parent, args: { id: string }) => {
      try {
        await prisma.profile.delete({
          where: { id: args.id },
        })
        return true;
      }
      catch (e) {
        return e;
      }
    },

    subscribeTo: async (_parent, args: { userId: string, authorId: string }) => {
      return prisma.user.update({
        where: {
          id: args.userId,
        },
        data: {
          userSubscribedTo: {
            create: {
              authorId: args.authorId,
            },
          },
        },
      });
    },

    unsubscribeFrom: async (_parent, args: { userId: string, authorId: string }) => {
      try {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        });
        return true;
      }
      catch (e) {
        return e;
      }
    }

}

export default resolvers;


