import app from '+/api';
import { default as swagger } from '../api/swagger/util';

if(process.env.NEW_RELIC_LICENSE_KEY){
    require('newrelic');
}

console.log('/bin/www');

(async() => {

    try{
        await swagger.build();
        await swagger.bake();
        await swagger.register(app);
    } catch(e){
        console.log('Errors during app startup proc');
        return console.log(e);
    }

	app.server.listen(process.env.PORT || 3000, () => {
		console.log(`Express server started on port ${app.server.address().port}`);
	});
})();
