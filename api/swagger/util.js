import fs from 'fs'
import path from 'path'
import url from 'url';
import {resolveRefs} from 'json-refs';
import YAML from 'yaml-js';
import toYaml from 'yamljs';
import SwaggerExpress from 'swagger-express-mw';
import SwaggerUi from 'swagger-tools/middleware/swagger-ui';
import promisify from 'es6-promisify';

const src = path.resolve(process.cwd() + '/api/swagger/src.yaml');
const dest = path.resolve(process.cwd() + '/api/swagger/swagger.yaml');

/**
 * Various methods to build and register your Swagger API
 */
export default {

    /**
     * Registers the Swagger middleware with the Express app instance
     * @param app
     * @returns {Promise.<*>}
     */
    register: async(app) => {

        const options = {
            appRoot: process.cwd()
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
     * Concatenates individual Swagger files following JSON $ref tags into a single file that is used at runtime
     * @returns {Promise.<*>}
     */
    build: async() => {

        let swaggerSpecSrc;

        try{
            swaggerSpecSrc = YAML.load(
                fs.readFileSync(src)
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
        await fs.writeFileSync(dest, yaml);

        console.log(`Swagger spec successfully built:`);
        console.log(`    src: ${src}`);
        console.log(`    dest: ${dest}`);
    },

    /**
     * Depending on runtime env bakes specific variables into the Swagger file
     * This is useful when running http on localhost and https on production
     * @returns {Promise.<*>}
     */
    bake: async() => {

        let swaggerConfig;

        try{
            swaggerConfig = YAML.load(
                fs.readFileSync(src).toString()
            );
        } catch(e){
            return Promise.reject(e);
        }

        if(process.env.HOST){
            swaggerConfig.schemes = process.env.HOST.indexOf('https') !== -1 ? ['https'] : ['http'];
            swaggerConfig.host = url.parse(process.env.HOST).host; // strip protocol from hostname, Swagger doens't like it
        } else{
            swaggerConfig.schemes = ['http'];
        }

        console.log(`\nBaking Swagger config:`);
        console.log(`    UI protocol: ${swaggerConfig.schemes}`);
        console.log(`    UI host: ${swaggerConfig.host}`);

        const yaml = toYaml.stringify(swaggerConfig, 8, 2);
        await fs.writeFile(src, yaml);
    }
}
