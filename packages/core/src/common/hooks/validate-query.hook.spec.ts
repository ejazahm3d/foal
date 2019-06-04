// std
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'assert';

// FoalTS
import { Context, getHookFunction, getHookFunctions, Hook, HttpResponseBadRequest, ServiceManager } from '../../core';
import { getApiParameters, IApiQueryParameter } from '../../openapi';
import { ValidateQuery } from './validate-query.hook';

describe('ValidateQuery', () => {

  const schema = {
    properties: {
      foo: { type: 'integer' }
    },
    type: 'object',
  };

  describe('should validate the query and', () => {

    it('should throw an error if the schema is not of "type" object (JSON schema).', () => {
      try {
        ValidateQuery({ type: 'string' });
        throw new Error('An error should have been thrown.');
      } catch (error) {
        strictEqual(error.message, 'ValidateQuery only accepts a schema of type "object".');
      }
    });

    it('should not return an HttpResponseBadRequest if ctx.request.query is validated '
        + 'by ajv for the given schema.', () => {
      const hook = getHookFunction(ValidateQuery(schema));
      const ctx = new Context({});
      ctx.request.query = {
        foo: 3
      };

      const actual = hook(ctx, new ServiceManager());
      strictEqual(actual instanceof HttpResponseBadRequest, false);
    });

    it('should return an HttpResponseBadRequest if ctx.request.query is not validated by '
        + 'ajv for the given schema.', () => {
      const hook = getHookFunction(ValidateQuery(schema));

      function context(query) {
        const ctx = new Context({});
        ctx.request.query = query;
        return ctx;
      }

      ok(hook(context(null), new ServiceManager()) instanceof HttpResponseBadRequest);
      ok(hook(context(undefined), new ServiceManager()) instanceof HttpResponseBadRequest);
      ok(hook(context('foo'), new ServiceManager()) instanceof HttpResponseBadRequest);
      ok(hook(context(3), new ServiceManager()) instanceof HttpResponseBadRequest);
      ok(hook(context(true), new ServiceManager()) instanceof HttpResponseBadRequest);
      ok(hook(context({ foo: 'a' }), new ServiceManager()) instanceof HttpResponseBadRequest);
    });

    it('should return an HttpResponseBadRequest with a defined `body` property if '
        + 'ctx.request.query is not validated by ajv.', () => {
      const hook = getHookFunction(ValidateQuery(schema));
      const ctx = new Context({});

      const actual = hook(ctx, new ServiceManager());
      ok(actual instanceof HttpResponseBadRequest);
      notStrictEqual((actual as HttpResponseBadRequest).body, undefined);
    });

  });

  describe('should define an API specification', () => {

    const schema = {
      properties: {
        barfoo: { type: 'string' },
        foobar: { type: 'string' },
      },
      required: [ 'barfoo' ],
      type: 'object',
    };

    it('unless options.openapi is undefined.', () => {
      @ValidateQuery(schema)
      class Foobar {}

      strictEqual(getApiParameters(Foobar), undefined);
    });

    it('unless options.openapi is false.', () => {
      @ValidateQuery(schema, { openapi: false })
      class Foobar {}

      strictEqual(getApiParameters(Foobar), undefined);
    });

    it('if options.openapi is true (class decorator).', () => {
      @ValidateQuery(schema, { openapi: true })
      class Foobar {}

      const actual = getApiParameters(Foobar);
      const expected: IApiQueryParameter[] = [
        {
          in: 'query',
          name: 'barfoo',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'query',
          name: 'foobar',
          schema: { type: 'string' }
        },
      ];
      deepStrictEqual(actual, expected);
    });

    it('if options.openapi is true (method decorator).', () => {
      class Foobar {
        @ValidateQuery(schema, { openapi: true })
        foo() {}
      }

      const actual = getApiParameters(Foobar, 'foo');
      const expected: IApiQueryParameter[] = [
        {
          in: 'query',
          name: 'barfoo',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'query',
          name: 'foobar',
          schema: { type: 'string' }
        },
      ];
      deepStrictEqual(actual, expected);
    });

  });

});
