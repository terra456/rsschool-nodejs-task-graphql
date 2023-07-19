import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import graphqlSchema from './graphql/graphqlSchema.js';

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
      console.log(req.body.query);
      try {
        const res = graphql({ schema: graphqlSchema, source: req.body.query });
        console.log(res);
        return res;
      } catch (e) {
        return { errors: e};
      }
    },
  });
};

export default plugin;
