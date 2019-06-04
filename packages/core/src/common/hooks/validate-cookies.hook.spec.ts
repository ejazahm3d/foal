// std
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'assert';

// FoalTS
import { Context, getHookFunction, HttpResponseBadRequest, ServiceManager } from '../../core';
import { getApiParameters, IApiCookieParameter } from '../../openapi';
import { ValidateCookies } from './validate-cookies.hook';

describe('ValidateCookies', () => {

  describe('should validate the cookies and', () => {

    const schema = {
      properties: {
        foo: { type: 'integer' }
      },
      type: 'object',
    };

    it('should throw an error if the schema is not of "type" object (JSON schema).', () => {
      try {
        ValidateCookies({ type: 'string' });
        throw new Error('An error should have been thrown.');
      } catch (error) {
        strictEqual(error.message, 'ValidateCookies only accepts a schema of type "object".');
      }
    });

    it('should not return an HttpResponseBadRequest if ctx.request.cookies is validated '
        + ' by ajv for the given schema.', () => {
      const hook = getHookFunction(ValidateCookies(schema));
      const ctx = new Context({});
      ctx.request.cookies = {
        foo: '3'
      };

      const actual = hook(ctx, new ServiceManager());
      strictEqual(actual instanceof HttpResponseBadRequest, false);
    });

    it('should return an HttpResponseBadRequest if ctx.request.cookies is not validated by '
        + ' ajv for the given schema.', () => {
      const hook = getHookFunction(ValidateCookies(schema));

      function context(cookies) {
        const ctx = new Context({});
        ctx.request.cookies = cookies;
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
        + 'ctx.request.cookies is not validated by ajv.', () => {
      const hook = getHookFunction(ValidateCookies(schema));
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
      @ValidateCookies(schema)
      class Foobar {}

      strictEqual(getApiParameters(Foobar), undefined);
    });

    it('unless options.openapi is false.', () => {
      @ValidateCookies(schema, { openapi: false })
      class Foobar {}

      strictEqual(getApiParameters(Foobar), undefined);
    });

    it('if options.openapi is true (class decorator).', () => {
      @ValidateCookies(schema, { openapi: true })
      class Foobar {}

      const actual = getApiParameters(Foobar);
      const expected: IApiCookieParameter[] = [
        {
          in: 'cookie',
          name: 'barfoo',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'cookie',
          name: 'foobar',
          schema: { type: 'string' }
        },
      ];
      deepStrictEqual(actual, expected);
    });

    it('if options.openapi is true (method decorator).', () => {
      class Foobar {
        @ValidateCookies(schema, { openapi: true })
        foo() {}
      }

      const actual = getApiParameters(Foobar, 'foo');
      const expected: IApiCookieParameter[] = [
        {
          in: 'cookie',
          name: 'barfoo',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'cookie',
          name: 'foobar',
          schema: { type: 'string' }
        },
      ];
      deepStrictEqual(actual, expected);
    });

  });

});
