import { envelop, useEngine, useSchema } from "@envelop/core";
import { useGraphQlJit } from "@envelop/graphql-jit";
import { useImmediateIntrospection } from "@envelop/immediate-introspection";
import { useParserCache } from "@envelop/parser-cache";
import { createInMemoryCache, useResponseCache } from "@envelop/response-cache";
import { useValidationCache } from "@envelop/validation-cache";
import * as GraphQLJS from "graphql";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendResult,
  shouldRenderGraphiQL,
} from "graphql-helix";
import { Request, Response } from "polka";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolver/HelloResolver";

const graphqlHelperFn = async () => {
  const schema = await buildSchema({ resolvers: [HelloResolver] });

  const cache = createInMemoryCache();

  const getEnveloped = envelop({
    plugins: [
      useEngine(GraphQLJS),
      useSchema(schema),
      useImmediateIntrospection(),
      useValidationCache(),
      useParserCache(),
      useResponseCache({
        cache,
        session: () => null,
        ttl: 2000,
      }),
      useGraphQlJit(),
    ],
  });

  const requestHandler = async (req: Request, res: Response) => {
    const { parse, validate, contextFactory, execute, schema } = getEnveloped({
      req,
    });

    const request = {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
    };

    if (shouldRenderGraphiQL(request)) {
      res.end(renderGraphiQL());
    } else {
      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        operationName,
        query,
        variables,
        request,
        schema,
        parse,
        validate,
        execute,
        contextFactory,
      });

      sendResult(result, res);
    }
  };

  return { requestHandler };
};

export { graphqlHelperFn };
