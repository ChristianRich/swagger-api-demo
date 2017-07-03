if(process.env.NEW_RELIC_LICENSE_KEY){
    console.log('Register NewRelic with key ' + process.env.NEW_RELIC_LICENSE_KEY);
    require('newrelic');
} else{
    console.log('Skip NewRelic (missing NEW_RELIC_LICENSE_KEY)');
}

require('./bin/www');
