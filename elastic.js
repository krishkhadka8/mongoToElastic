//Elastic Connection
const elasticsearch = require('elasticsearch');
const  ELASTIC_SEARCH_URL='https://slashAdmin:FlawedByDesign@1612$@elastic-50-uat.slashrtc.in/elastic' ;
let client = null;

const connect = async () => {
  client = await new elasticsearch.Client({
    host: ELASTIC_SEARCH_URL,
    log: { type: 'stdio', levels: [] }
  });
  return client;
};

const ping = async () => {
  let attempts = 0;
  const pinger = ({ resolve, reject }) => {
    attempts += 1;
    client
      .ping({ requestTimeout: 30000 })
      .then(() => {
        console.log('Elasticsearch server available');
        resolve(true);
      })
      .catch(() => {
        if (attempts > 100) reject(new Error('Elasticsearch failed to ping'));
        console.log('Waiting for elasticsearch server...');
        setTimeout(() => {
          pinger({ resolve, reject });
        }, 1000);
      });
  };

  return new Promise((resolve, reject) => {
    pinger({ resolve, reject });
  });
};

module.exports = async () => {
    if (client != null) {
      return client;
    }
    client = await connect();
    await ping();
    return client;
  };