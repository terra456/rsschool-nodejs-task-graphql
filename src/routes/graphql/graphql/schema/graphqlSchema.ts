import { UUIDType } from '../../types/uuid.js'
import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql';
import resolvers from './resolvers.js';

import { userT, PostT } from './types.js'

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
    id: { type: MemberTypeId },
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
      resolve: resolvers.getProfileMemberType,
    },
    memberTypeId: {
      type: MemberTypeId,
    }
  })
})

const UserType: GraphQLObjectType<userT> = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: {type: UUIDType },
    name: {type: GraphQLString },
    balance: {type: GraphQLFloat },
    profile: { type: ProfileType,
      resolve: resolvers.getUserProfile,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: resolvers.getUserPosts,
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: resolvers.getUserSubscribedTo,
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: resolvers.getSubscribedToUser,
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
      resolve: resolvers.getPostAuthor,
    },
  }),
})

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {

    profiles: {
      type: new GraphQLList(ProfileType),
      args: { id: { type: UUIDType }},
      resolve: resolvers.getProfiles,
    },

    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) }},
      resolve: resolvers.getProfile
    },

    memberType: {
      type: MemberTypeType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: resolvers.getMemberType
    },

    memberTypes: {
      type: new GraphQLList(MemberTypeType),
      args: { id: { type: MemberTypeId } },
      resolve: resolvers.getMemberTypes,
    },

    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: resolvers.getUser,
    },
    
    users: {
      type: new GraphQLList(UserType),
      args: { id: { type: UUIDType } },
      resolve: resolvers.getUsers,
    },

    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: resolvers.getPost
    },

    posts: {
      type: new GraphQLList(PostType),
      args: { id: { type: UUIDType } },
      resolve: resolvers.getPosts
    },
  },
})

const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) }
  }
})

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }
})

const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  }
})

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType }
  }
})

const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }
})

const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: PostType,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInputType) }
      },
      resolve: resolvers.createPost
    },
    createUser: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInputType) }
      },
      resolve: resolvers.createUser
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInputType) }
      },
      resolve: resolvers.createProfile
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInputType) }
      },
      resolve: resolvers.changePost
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) }
      },
      resolve: resolvers.changeUser
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) }
      },
      resolve: resolvers.changeProfile
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: resolvers.deletePost
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: resolvers.deleteUser
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: resolvers.deleteProfile
    },
    subscribeTo: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) }
      },
      resolve: resolvers.subscribeTo
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) }
      },
      resolve: resolvers.unsubscribeFrom
    }
  }
})

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation,
})