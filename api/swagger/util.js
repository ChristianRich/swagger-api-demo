import fs from 'fs'
import path from 'path'
import url from 'url';
import {resolveRefs} from 'json-refs';
import YAML from 'yaml-js';
import toYaml from 'yamljs';
import SwaggerExpress from 'swagger-express-mw';
import * as SwaggerTools from 'swagger-tools';
import SwaggerUi from 'swagger-tools/middleware/swagger-ui';
import promisify from 'es6-promisify';

const SRC = path.resolve(process.cwd() + '/api/swagger/src.yaml');
const DEST = path.resolve(process.cwd() + '/api/swagger/swagger.yaml');

/**
 * Various methods to build and register your Swagger API
 */
export default {

    init: async function(app) {
        await this.build();
        await this.setEnv();
        await this.register(app);
        // await this.mw(app);
    },

    /**
     * Concatenates individual Swagger files following JSON $ref tags into a single file that is used at runtime
     * @returns {Promise.<*>}
     */
    build: async() => {

        let swaggerSpecSrc;

        try{
            swaggerSpecSrc = YAML.load(
                fs.readFileSync(SRC)
            );
        } catch(e){
            return Promise.reject(e);
        }

        const options = {
            filter: ['relative', 'remote'],
            loaderOptions : {
                processContent : (res, callback) => {
                    callback(null, YAML.load(res.text));
                }
            }
        };

        let results;

        try{
            results = await promisify(resolveRefs)(
                swaggerSpecSrc,
                options
            );
        } catch(e){
            return Promise.reject(e);
        }

        let yaml = toYaml.stringify(results.resolved, 8, 2);
        await fs.writeFileSync(DEST, yaml);

        console.log(`Swagger spec successfully built:`);
        console.log(`    src: ${SRC}`);
        console.log(`    dest: ${DEST}`);
    },

    /**
     * Depending on runtime env bakes specific variables into the Swagger file
     * This is useful when running http on localhost and https on production
     * @returns {Promise.<*>}
     */
    setEnv: async() => {

        let swaggerConfig;

        try{
            swaggerConfig = YAML.load(
                await fs.readFileSync(DEST).toString()
            );
        } catch(e){
            return Promise.reject(e);
        }

        if(process.env.HOST){
            swaggerConfig.schemes = process.env.HOST.indexOf('https') !== -1 ? ['https'] : ['http'];
            swaggerConfig.host = url.parse(process.env.HOST).host; // strip protocol from hostname, Swagger doens't like it
        } else{
            swaggerConfig.schemes = ['http'];
            swaggerConfig.host = 'localhost:' + (process.env.PORT || 3000);
        }

        console.log(`\nSwagger back env:`);
        console.log(`    host: ${swaggerConfig.host}`);
        console.log(`    protocol: ${swaggerConfig.schemes}`);

        const yaml = toYaml.stringify(swaggerConfig, 8, 2);
        await fs.writeFileSync(DEST, yaml);
    },

    /**
     * Registers the Swagger middleware with the Express app instance
     * @param app
     * @returns {Promise.<*>}
     */
    register: async(app) => {

        const options = {
            appRoot: process.cwd(),
            swaggerSecurityHandlers: {
                api_key: function (req, authOrSecDef, scopesOrApiKey, cb) {

                    const getAuthError = (msg = 'Unauthorized') => {
                        const err = new Error(msg);
                        err.statusCode = 401;
                        return err;
                    };

                    if(scopesOrApiKey === '1234') {
                        return cb();
                    }

                    cb(getAuthError());
                }
            }
        };

        let swaggerExpress;

        try{
            swaggerExpress = await promisify(SwaggerExpress.create)(options);
        } catch(e){
            return Promise.reject(JSON.stringify(e, null, 2)); // Catches Swagger YAML validation errors
        }

        swaggerExpress.register(app);
        console.log('Registered Swagger middleware');

        app.use(SwaggerUi(swaggerExpress.runner.swagger));
        console.log('Registered Swagger UI at /doc');
    },

    /**
     * Swagger middleware (different approach not using swagger-express)
     *
     * Quick start:
     * https://github.com/apigee-127/swagger-tools/blob/master/docs/QuickStart.md
     *
     * Help with setting up security
     * http://miguelduarte.pt/2017/04/19/using-jwt-authentication-with-swagger-and-node-js/
     * https://github.com/swagger-api/swagger-node/issues/228
     * https://github.com/apigee-127/swagger-tools/issues/203
     * @param app
     * @returns {Promise}
     */
    mw: async(app) => {

        return new Promise(async(resolve, reject) => {

            let spec;

            try{
                spec = YAML.load(
                    await fs.readFileSync(DEST).toString()
                )
            } catch(e){
                return reject(e);
            }

            SwaggerTools.initializeMiddleware(spec, (middleware) => {
                app.use(middleware.swaggerMetadata());
                app.use(middleware.swaggerValidator());
                app.use(middleware.swaggerRouter({
                    controllers: process.cwd() + '/api/controllers'
                }));

                app.use(middleware.swaggerUi());
                app.use(middleware.swaggerSecurity({

                    api_key: (req, authOrSecDef, scopesOrApiKey, cb) => {

                        const getAuthError = (msg = 'Unauthorized') => {
                            const err = new Error(msg);
                            err.statusCode = 401;
                            return err;
                        };

                        if(scopesOrApiKey === '1234') {
                            return cb();
                        }

                        cb(getAuthError());
                    }
                }));

                resolve();
            })
        })
    }
}
