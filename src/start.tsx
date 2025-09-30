// oxlint-disable no-unused-expressions
/** biome-ignore-all lint/style/noParameterProperties: ignore all */
/** biome-ignore-all lint/style/useConsistentMemberAccessibility: ignore all */

import type { Register } from "@tanstack/react-router";
import { createSerializationAdapter } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: {
        fromFetch: boolean;
      };
    };
  }
}

// @manuel
export const serverMw = createMiddleware().server(({ next, context }) => {
  context.fromFetch;
  //      ^?

  const nonce = Math.random().toString(16).slice(2, 10);
  console.log("nonce", nonce);
  return next({
    context: {
      fromServerMw: true,
      nonce,
    },
  });
});

export const fnMw = createMiddleware({ type: "function" })
  .middleware([serverMw])
  .server(({ next, context }) => {
    context.fromFetch;
    //      ^?

    return next({
      context: {
        fromFnMw: true,
      },
    });
  });

const serializeClass = createSerializationAdapter({
  key: "Test",
  test: (v) => v instanceof Test,
  toSerializable: (v) => v.test,
  fromSerializable: (v) => new Test(v),
});

export class Test {
  constructor(public test: string) {}
  init() {
    return this.test;
  }
}

export const startInstance = createStart(() => ({
  defaultSsr: true,
  serializationAdapters: [serializeClass],
  requestMiddleware: [serverMw],
  functionMiddleware: [fnMw],
}));

export type test3 = Register extends {
  config: infer TConfig;
}
  ? TConfig extends {
      "~types": infer TTypes;
    }
    ? TTypes
    : unknown
  : unknown;

startInstance.createMiddleware().server(({ next, context }) => {
  context.fromFetch;
  //      ^?
  context.fromServerMw;
  //      ^?

  return next({
    context: {
      fromStartInstanceMw: true,
    },
  });
});
