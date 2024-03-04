import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { OpenAI } from "@langchain/openai";
import { GraphCypherQAChain } from "langchain/chains/graph_qa/cypher";
import { ContactSupportOutlined } from '@mui/icons-material';
import {patient_journey_schema} from './schema/patient_journey'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

    const {
        prompt
        } = req.body;

    const url = process.env.HOST_URL||"";
    const username = process.env.USERNAME||"";;
    const password = process.env.PASSWORD||"";;

    // const graph = await Neo4jGraph.initialize({ url, username, password });
    // const schema = await graph.getSchema();
    const openAIapiKey = process.env.OPENAI_API_KEY;

    if (!openAIapiKey) {
        return res.status(500).json({ error: 'OpenAI API key not set' });
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    if (!prompt) {
        return res.status(400).json({ message: 'No question in the request' });
    }

 


    // console.log("schema:",schema);
    const cypherTemplate = `
    Task:
    Generate Cypher statement to query a graph database.

    Strict instruction to follow while generating cypher query: 
    1. Do not include any explanations or apologies in your responses.
    2. Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
    3. Do not include any text except the generated Cypher statement.
    4. If any of the cypher queries you are writing require UNION, make sure to have same column names in RETURN clause on each part of the query
    5. Apply toLower(p.<property_name>) contains toLower(<searchTerm>) pattern on filtering any properties
    6. Drug, Condition, CarePlan, Allergy, Procedure names are represented by description property on that node
    7. Do not use sql syntax like GROUP BY, JOIN while generating cypher. GROUP BY and JOINs are implicit in cypher query language
    8. Use only the provided relationship types and properties in the schema.
    9. Do not use any other relationship types or properties that are not provided.

    Schema:
    {schema}

    The question is:
    {question}`;

    try {
        const model = new ChatOpenAI({ temperature: 0 , modelName: "gpt-4-1106-preview" });
        const promptTemplate = PromptTemplate.fromTemplate(cypherTemplate);
        const chain = promptTemplate.pipe(model);
        const result = await chain.invoke({schema:patient_journey_schema, question:prompt})

        const pattern = /```(.*?)```/s;
        const matches = result.content.toString().match(pattern);
        const cypher = matches ? matches[1] : result.content.toString()
        console.log("cypher : ", matches ? matches[1] : result.content.toString())

        // console.log("url : ", url, username);

        // const response = await fetch("http://localhost:3001/api/neo_api",{
        //     method:"post",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         cypher
        //     })
        //   })

        // const data = await response.json();

        // const context = await graph.query("MATCH (n) RETURN COUNT(n)", {
        //     topK: 10,
        //   });
        // console.log("context :", context)
        res
        .status(200)
        .json({ text: cypher});


    } catch (error: any) {
        console.log('error', error)
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}