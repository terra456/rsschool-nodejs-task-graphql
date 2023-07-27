import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import graphqlSchema from './graphql/schema/graphqlSchema.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    
    async handler(req) {
      try {
        const res = await graphql({
          schema: graphqlSchema,
          source: req.body.query,
          variableValues: req.body.variables,
        });
        return res;
      } catch (e) {
        return { errors: e };
      }
    },
  });
};

export default plugin;
