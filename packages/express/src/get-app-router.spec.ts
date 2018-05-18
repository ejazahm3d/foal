import { App, HttpMethod, HttpResponseOK, route } from '@foal/core';
import * as express from 'express';
import * as request from 'supertest';

import { getAppRouter } from './get-app-router';

function httpMethodTest(httpMethod: HttpMethod) {
  describe(`when route.httpMethod === "${httpMethod}", route.path === "/foo/bar" and the route returns `
            + 'an HttpResponseOK(\'Success\')', () => {

    let app;

    beforeEach(() => {
      app = express();
      const foalApp = new App({
        controllers: [
          route.attachHandler(httpMethod, '/foo/bar', ctx => new HttpResponseOK('Success'))
        ]
      });
      app.use(getAppRouter(foalApp));
      app.use((req, res) => res.sendStatus(404));
    });

    it(`should respond to ${httpMethod} /foo/bar by 200 "Success".`, () => {
      switch (httpMethod) {
        case 'GET':
          return request(app).get('/foo/bar').expect(200).expect('Success');
        case 'PATCH':
          return request(app).patch('/foo/bar').expect(200).expect('Success');
        case 'PUT':
          return request(app).put('/foo/bar').expect(200).expect('Success');
        case 'POST':
          return request(app).post('/foo/bar').expect(200).expect('Success');
        case 'DELETE':
          return request(app).delete('/foo/bar').expect(200).expect('Success');
      }
    });

    it(`should respond to ${httpMethod} /foo/bar/ by 200 "Success".`, () => {
      switch (httpMethod) {
        case 'GET':
          return request(app).get('/foo/bar').expect(200).expect('Success');
        case 'PATCH':
          return request(app).patch('/foo/bar').expect(200).expect('Success');
        case 'PUT':
          return request(app).put('/foo/bar').expect(200).expect('Success');
        case 'POST':
          return request(app).post('/foo/bar').expect(200).expect('Success');
        case 'DELETE':
          return request(app).delete('/foo/bar').expect(200).expect('Success');
      }
    });

    it(`should not respond to ${httpMethod} /foo.`, () => {
      switch (httpMethod) {
        case 'GET':
          return request(app).get('/foo').expect(404);
        case 'PATCH':
          return request(app).patch('/foo').expect(404);
        case 'PUT':
          return request(app).put('/foo').expect(404);
        case 'POST':
          return request(app).post('/foo').expect(404);
        case 'DELETE':
          return request(app).delete('/foo').expect(404);
      }
    });

    it(`should not respond to ${httpMethod} /foo/bar/4.`, () => {
      switch (httpMethod) {
        case 'GET':
          return request(app).get('/foo/bar/4').expect(404);
        case 'PATCH':
          return request(app).patch('/foo/bar/4').expect(404);
        case 'PUT':
          return request(app).put('/foo/bar/4').expect(404);
        case 'POST':
          return request(app).post('/foo/bar/4').expect(404);
        case 'DELETE':
          return request(app).delete('/foo/bar/4').expect(404);
      }
    });

    it(`should not respond to [Method !== "${httpMethod}"] /foo/bar.`, () => {
      const promises: any = [];
      if (httpMethod !== 'GET') { promises.push(request(app).get('/foo/bar').expect(404)); }
      if (httpMethod !== 'PATCH') { promises.push(request(app).patch('/foo/bar').expect(404)); }
      if (httpMethod !== 'PUT') { promises.push(request(app).put('/foo/bar').expect(404)); }
      if (httpMethod !== 'POST') { promises.push(request(app).post('/foo/bar').expect(404)); }
      if (httpMethod !== 'DELETE') { promises.push(request(app).delete('/foo/bar').expect(404)); }
      return Promise.all(promises);
    });

  });
}

describe('getAppRouter', () => {

  // The below items are more end-to-end tests than unit ones.

  httpMethodTest('DELETE');

  httpMethodTest('GET');

  httpMethodTest('PATCH');

  httpMethodTest('POST');

  httpMethodTest('PUT');

  describe('for each route of each controller of the given app', () => {

    describe('when route.httpMethod === "GET", route.path === "/foo/:id/bar/:id2" and the route returns '
             + 'an HttpResponseOK(\'Success\')', () => {

      let app;

      beforeEach(() => {
        app = express();
        const foalApp = new App({
          controllers: [
            route.attachHandler('GET', '/foo/:id/bar/:id2', ctx => new HttpResponseOK('Success'))
          ]
        });
        app.use(getAppRouter(foalApp));
        app.use((req, res) => res.sendStatus(404));
      });

      it('should respond to GET /foo/12/bar/13 by 200 "Success".', () => {
        return request(app)
          .get('/foo/12/bar/13')
          .expect(200)
          .expect('Success');
      });

      it('should not respond to GET /foo/12/bar/.', () => {
        return request(app)
          .get('/foo/12/bar/')
          .expect(404);
      });

    });

  });

});
