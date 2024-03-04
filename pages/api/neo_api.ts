
import neo4j from "neo4j-driver";

export const config = {
  runtime: "edge",
};

// this is to overcome runtime errors where it's looking for window
//   without this you get: err:  [ReferenceError: window is not defined]
if (global && typeof global.window === 'undefined') {
  global.window = {};
  // used in bolt-agent.js
  global.window.navigator = {};
  // we'll pretend that this is our browser
  global.window.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';
}


const run = async ( cypher:string, options: Map) => {

    const url:string = process.env.HOST_URL;
    const uid:string = process.env.USERNAME;
    const pwd: string = process.env.PASSWORD;
    const db:string = process.env.DB_NAME;
    var session:any 

    let driver = neo4j.driver(url, neo4j.auth.basic(uid, pwd), {
        disableLosslessIntegers: true,
        userAgent: `neoconverse-api`
    });
    if (db) {
        session = driver.session({database:db});
    } else {
        session = driver.session();
    }
    
    //let results = { headers: [], rows: [] };
    let results:any = [];
    let runResult = null;
    await session.run(cypher, {}, { timeout: 120000 })
      .then(result => {
        runResult = result;
        result.records.forEach((record, i) => {
          let oneRecord = {};
          // if (i === 0) {
          //   results.headers = record.keys.slice();
          // }
          record.keys.forEach(key => {
            oneRecord[key] = record.get(key);
          })
          //results.rows.push(oneRecord);
          results.push(oneRecord);
        })
      })

    //console.log('runResult: ', runResult);
    if (options && options.returnResultSummary) {
      return {
        summary: (runResult) ? runResult.summary : {},
        results: results
      }
    } else {
      return results;
    }
}

const handler = async (req: Request): Promise<Response> => {
  //res.status(200).json({ name: 'John Doe' })
  let json = await req.json();
  //console.log('json: ', json);
  const { cypher, options } = json;
  try {
    //console.log("before run");
    const result = await run(cypher, options);
    console.log("result: ", result);
    return Response.json({ result })
  } catch (err) {
    console.log("err: ", err);
    return Response.json({ error: err.toString() }, { status: 500 })
  } 
};

export default handler;

