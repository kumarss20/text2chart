import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    prompt
  } = req.body;

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

  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4-1106-preview",
      maxTokens: 4000,
    });

    const instruction = `
    You are a helpful assistant, 
    Provide chart props for react-google-charts that can be used to create dynamic chart element using React.createElement to chart below data set provided inside <dataset> xml tag, 
    Return only the props for React.createElement without any additional explanation 
    Do not include "loader" props for react-google-charts
    Make the chart component width and height to 100% of its container and chart area width and height to fit 70 to 80% based on the content
    Do not use map function to loop through the given input json, rather respond with expanded actual data
    Provide only the props for react-google-charts and do not include React.createElement
    Respond with no formatting and jsx code block  
    Legent position should be at the bottom
    <dataset> {dataset} </dataset>
    `

    console.log("chartInput",prompt)
    const promptTemplate = PromptTemplate.fromTemplate(instruction);
    
    const chain = promptTemplate.pipe(model);
    
    const result = await chain.invoke({dataset:JSON.stringify(prompt)})

    res
      .status(200)
      .json({ text: result.lc_kwargs });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}