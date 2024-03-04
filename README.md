# Text to Chart: Generate chart from natural language question 
This is a simple single page web application that allows users to interact with Neo4j databases using natural language conversation and Generative AI technologies. This repository contains the source code for text-to-chart generation from data sourced from neo4j database 

## Key Features
- **Conversational Interface**: Text-to-Chart enables users to interact with Neo4j databases using plain English conversation. You can ask questions and retrieve complex data effortlessly.

- **Chart based responses using Generative AI**: Text-to-Chart app leverages Generative AI technologies, powered by OpenAI or VertexAI, to generate Cypher queries based on your questions.


## How to use

Install it and run:

```bash
git clone https://github.com/kumarss20/text-to-chart.git
cd text-to-chart

//set below environmental variables on .env file
OPENAI_API_KEY=
HOST_URL = "neo4j://xxxxx:8687"
USERNAME = "xxxx"
PASSWORD = "xxx"
DB_NAME = "neo4j"

npm install
npm run dev
```

## Technology Stack
Text to chart app is built using a powerful stack of technologies:

- **Frontend**: React with Tailwind CSS forms.
- **Language**: TypeScript.
- **Database Connectivity**: Javascript Driver from Neo4j is used to query the underlying Neo4j databases.
- **Langchain**: For LLM orchestration javascript version of LangChain is used
- **Charts**: react-google-chart is used for data visualization.

## Usage
You can easily integrate Text-to-Chart into your web application, providing users with a conversational interface for Neo4j database queries. Customize the code and configurations to suit your specific needs.

## Contributions
We welcome contributions from the community to enhance and improve this repo. Feel free to submit pull requests and help us make this tool even better.

## License
This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software as per the terms of the license.

---
