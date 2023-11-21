const connection = require('./elastic')
const { MongoClient } = require('mongodb');


// Writing it only to test git
async function start(){
    let DbConnect = await connectionToMongo();
    let Client = await connection();

    // async function run(){
    //     var response = await Client.search({
    //         index: 'elasticdeliveries',
    //         body: {
    //           query: {
    //             bool: {
    //               must: [
    //                 {
    //                   term: {
    //                     "callInfo.agentLegUuid.keyword":"26fe698a-c50d-4543-ae27-a20c45a46919",
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         }
    //     })
    //     console.log(response.hits.hits);

    // }
    // run().catch(console.log);
}


//Mongo Connection
const url = "mongodb://localhost:27017";
const mongoClient = new MongoClient(url);
const dbName = "elasticDB";


//Elastic Update Query
const updateElasticData = async (data)=> {
    let Client = await connection();
    const update = {
        script: {
          source: 
                `ctx._source.callInfo.callTime.talkTime = ${data.agent_talktime_sec}`,
        },
        query: {
          bool: {
            must: {
              term: {
                "callInfo.agentLegUuid.keyword":`${data.cdrid}`,
              },
            },
          },
        },
    };
    Client.updateByQuery({
      index: "elasticdeliveries",
      body: update,
    })
    .then(
      (res) => {
        console.log("Success", res);
      },
      (err) => {
        console.log("Error", err);
      }
    );
    
}

async function connectionToMongo() {
  const tClient = await mongoClient.connect();
  const DbConnect = await tClient.db(dbName);
  console.log("Connected successfully to mongo");

  const cursorStream = DbConnect.collection('logs').find().stream();
  cursorStream.on('data', (doc) => {
      updateElasticData(doc);
  });
  cursorStream.on('end', () => {
      tClient.close();
  });

  return DbConnect;
}


start();

