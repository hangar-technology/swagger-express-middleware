var env = require('../../test-environment');
var api, petParam;

describe('JSON Schema - parse object params', function() {
    'use strict';

    beforeEach(function() {
        api = _.cloneDeep(env.parsed.petStore);
        petParam = api.paths['/pets/{PetName}'].patch.parameters[0];
    });

    it('should parse a valid object param',
        function(done) {
            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .send({Name: 'Fido', Type: 'dog'})
                .end(env.checkSpyResults(done));

            express.patch('/api/pets/fido', env.spy(function(req, res, next) {
                expect(req.body).to.deep.equal({
                    Name: 'Fido',
                    Type: 'dog'
                });
            }));
        }
    );

    it('should parse an optional, unspecified object param',
        function(done) {
            petParam.required = false;

            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .end(env.checkSpyResults(done));

            express.patch('/api/pets/fido', env.spy(function(req, res, next) {
                expect(req.body).to.be.empty;
            }));
        }
    );

    it('should parse the default Object value if no value is specified',
        function(done) {
            petParam.required = false;
            petParam.schema.default = {Name: 'Fido', Type: 'dog'};

            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .end(env.checkSpyResults(done));

            express.patch('/api/pets/fido', env.spy(function(req, res, next) {
                expect(req.body).to.deep.equal({
                    Name: 'Fido',
                    Type: 'dog'
                });
            }));
        }
    );

    it('should parse the default String value if no value is specified',
        function(done) {
            petParam.required = false;
            petParam.schema.default = '{"Name": "Fido", "Type": "dog"}';

            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .end(env.checkSpyResults(done));

            express.patch('/api/pets/fido', env.spy(function(req, res, next) {
                expect(req.body).to.deep.equal({
                    Name: 'Fido',
                    Type: 'dog'
                });
            }));
        }
    );

    it('should parse the default value if the specified value is blank',
        function(done) {
            petParam.required = false;
            petParam.schema.default = '{"Name": "Fido", "Type": "dog"}';

            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .set('content-type', 'text/plain')
                .send('')
                .end(env.checkSpyResults(done));

            express.patch('/api/pets/fido', env.spy(function(req, res, next) {
                expect(req.body).to.deep.equal({
                    Name: 'Fido',
                    Type: 'dog'
                });
            }));
        }
    );

    it('should throw an error if the value is blank',
        function(done) {
            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .set('content-type', 'text/plain')
                .send('')
                .end(env.checkSpyResults(done));

            express.use('/api/pets/fido', env.spy(function(err, req, res, next) {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.status).to.equal(400);
                expect(err.message).to.contain('Missing required body parameter "PetData"');
            }));
        }
    );

    it('should throw an error if schema validation fails',
        function(done) {
            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .send({Name: 'Fido', Type: 'kitty kat'})
                .end(env.checkSpyResults(done));

            express.use('/api/pets/fido', env.spy(function(err, req, res, next) {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.status).to.equal(400);
                expect(err.message).to.contain('No enum match for: "kitty kat"');
            }));
        }
    );

    it('should throw an error if required and not specified',
        function(done) {
            var middleware = env.swagger(api);
            var express = env.express(middleware.metadata(), middleware.parseRequest());

            env.supertest(express)
                .patch('/api/pets/fido')
                .end(env.checkSpyResults(done));

            express.use('/api/pets/fido', env.spy(function(err, req, res, next) {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.status).to.equal(400);
                expect(err.message).to.contain('Missing required body parameter "PetData"');
            }));
        }
    );
});
