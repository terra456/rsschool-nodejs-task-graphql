import { PrismaClient } from "@prisma/client";
import { MemberEnumT, NewPostT, NewProfileT, NewUserT, PostT, ProfileT, userT } from "./types.js";
import { GraphQLError } from "graphql";
import DataLoader from "dataloader";

const prisma = new PrismaClient();

async function userBatchFunction(keys: readonly string[]) {
  const result = async (key: string) => {
        const user = await prisma.user.findUnique({
          where: {
            id: key,
          },
        });
        return user;
      }
  return keys.map(async (key: string) => await result(key) || null);
}

const userLoader = new DataLoader(userBatchFunction);

async function postsBatchFunction(keys: readonly string[]) {
  const result = async (key: string) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: key,
      },
    });
    return posts;
  }
  return keys.map(async (key: string) => await result(key) || null);
}

const postsLoader = new DataLoader(postsBatchFunction);

async function memberTypeBatchFunction(keys: readonly string[]) {
  const result = async (key: string) => {
    const memberType = await prisma.memberType.findUnique({
      where: {
        id: key,
      },
    });
    return memberType;
  }
  return keys.map(async (key: string) => await result(key) || new Error(`No result for ${key}`));
}

const memberTypeLoader = new DataLoader(memberTypeBatchFunction);


const resolvers = {
    getProfile: async (_parent, args: {id: string}) => {
      const profile = await prisma.profile.findUnique({
        where: {
          id: args.id,
        },
      });
      return profile;
    },
  
    getProfileMemberType: async (parent: ProfileT) => {
      return memberTypeLoader.load(parent.memberTypeId);
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
      return postsLoader.load(parent.id);
    },

    getUserSubscribedTo:async (parent: userT) => {
      const authors = await prisma.subscribersOnAuthors.findMany({
        where: {
          subscriberId: parent.id,
        },
      });
      const authorsID = authors.map(({authorId}) => {
        return authorId;
      });
      return userLoader.loadMany(authorsID);
    },

    getSubscribedToUser: async (parent: userT) => {
      const subscribers = await prisma.subscribersOnAuthors.findMany({
        where: {
          authorId: parent.id,
        },
      });
      const subscribersId = subscribers.map(({subscriberId}) => subscriberId);
      return userLoader.loadMany(subscribersId);
    },

    getPostAuthor: async (parent: PostT) => {
      return userLoader.load(parent.authorId);
    },

    getMemberType: async (_parent, args: { id: MemberEnumT }) => {
      return memberTypeLoader.load(args.id);
    },

    getMemberTypes: async () => {
      return prisma.memberType.findMany();
    },

    getUser: async (_parent, args: {id: string}) => {
      return userLoader.load(args.id);
    },

    getUsers: async () => {
      return prisma.user.findMany();
    },

    getPost: async (_parent, args: {id: string}) => {
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


