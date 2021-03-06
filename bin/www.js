import app from '+/api';
import { default as swagger } from '../api/swagger/util';

console.log('/bin/www');

(async() => {

    try{
        await swagger.init(app);
    } catch(e){
        console.log('Errors during app startup proc');
        return console.log(e);
    }

	app.server.listen(process.env.PORT || 3000, () => {
		console.log(`Express server started on port ${app.server.address().port}`);
	});
})();
