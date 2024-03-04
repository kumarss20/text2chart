import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { prompt, openAIModel } = (await req.json()) as {
    prompt?: string;
    openAIModel?:string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const system_message = `You are a helpfull assistant`
  const payload: OpenAIStreamPayload = {
    model: openAIModel??"gpt-4",
    // model:"gpt-3.5-turbo-16k",
    messages: [
      {role: "system", content: system_message},
      {  role: "user", content: prompt}
    ],
    temperature: 0.0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1500,
    stream: true,
    n: 1,
  };


  const stream = await OpenAIStream(payload);
  // console.log('from server', stream)
  return new Response(stream);
};

//export default withApiAuthRequired(handler);
export default handler;
