import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Chart, ReactGoogleChartProps} from 'react-google-charts';
import { Grid, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import LinearProgress from '@mui/material/LinearProgress';
import { MuiMarkdown, getOverrides} from 'mui-markdown';
import { Highlight, themes } from 'prism-react-renderer';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);

export default function Home() {

  const initialChart:ReactGoogleChartProps = {
    chartType: "ColumnChart",
    // data: [
    //   ["Placeholder", "Placeholder"],
    //   ["98005", 12132],
    //   ["98007", 18001],
    // ],
    // options: {
    //   title: "Vehicle Registration by Zip Code",
    //   hAxis: {
    //     title: "Placeholder"
    //   },
    //   vAxis: {
    //     title: "Placeholder"
    //   }
    // }
  };

  const [chartProps, setChartProps] = React.useState<ReactGoogleChartProps | null>(initialChart);
  const [showChart, setShowChart] = React.useState(false);
  const [userInput, setUserInput] = React.useState("");
  const [progress, setProgress] = React.useState("");


  const prompt = `
  The data set contains zip code and no of vehicle registration
  Return only the props for React.createElement without any additional explanation
  98005	12132
  98007	18001
  98004	10000
  98006	39848
  98008	20220
  98006	15000
  `;
  const model = "gpt-4"

  const handleChange = (
    event: MouseEvent<HTMLElement>,
  ) => {
    // generate_chart_props();
    setShowChart(false)
    setProgress("");
    generate_cypher(userInput);
  };

  const generate_cypher = async(question:string) => {
    setProgress((prev) => prev  + " > Generating cypher query for user question \n" +  userInput + '\n');

    let prompt = question;
    const response = await fetch("/api/cypher_api",{
      method:"post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model
      })
    })

    const data = await response.json();
    console.log("cypher data : ",data);

    // const pattern = /```(.*?)```/s;
    // const matches = data.data.kwargs.content.toString().match(pattern);
    // const cypher = matches ? matches[1] :data.data.kwargs.content.toString()
    // console.log("cypher : ", matches ? matches[1] : data.data.kwargs.content.toString())

    console.log("client", data.text);
    // generate_chart_props(data.text.result)
    setProgress((prev) => prev  + "\n"+ "> Here is the generated cypher query "+ "\n");
    // setProgress((prev) => prev + '\n' + JSON.stringify("> "+data.text)+ '\n');
    setProgress((prev) => prev + '\n' + "> "+data.text+ '\n');
    execute_cypher(data.text);
  }

  const execute_cypher = async(cypher:string) => {
    setProgress((prev) => prev  + "\n"+ "> Executing above cypher in neo4j db and getting the result"+ '\n');
    const response = await fetch("/api/neo_api",{
      method:"post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          cypher
      })
    })
    const data = await response.json();
    console.log("client", data.result);
    setProgress((prev) => prev  + "> Here is the result from the database" + '\n');
    // setProgress((prev) => prev + '\n' + JSON.stringify(data.result)+ '\n');
    let result = `
    \`\`\`
    ${JSON.stringify(data.result)}
    \`\`\`
    `
     setProgress((prev) => prev + JSON.stringify(data.result));
    
    generate_chart_props(data.result);
  }

  const generate_chart_props = async(dataset) => {

    setProgress((prev) => prev  +  ">Generating the react google chart meta data with above data");
    let prompt = dataset;
    const response = await fetch("/api/chart_api",{
      method:"post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model
      })
    })

    const data = await response.json();
    setProgress((prev) => prev  +  "Here is the generated google react chart metadata")
    setProgress((prev) => prev + data.text.content);

    console.log(data.text.content);
    const chartConfStr = JSON.stringify(eval("(" + data.text.content.replaceAll("```","").replaceAll("jsx","") + ")"));
    console.log(data.text.content);

    let tempChartProps: ReactGoogleChartProps = JSON.parse(chartConfStr);

    setChartProps(tempChartProps);
    setShowChart(true)
  }

function ChartComponent() {
  return React.createElement(
    Chart,
    chartProps
  );
}

  const call_llm_api = async(dataset) => {

    const prompt = `You are a helpful assistant, provide chart props for react-google-charts that can be 
    used to create dynamic chart element using React.createElement to chart below data set provided inside <dataset> xml tag, 
    Return only the props for React.createElement without any additional explanation 
    Do not use dataset.map function to loop through the given input json, rather respond with expanded actual data
    <dataset> ${JSON.stringify({dataset})} </dataset>
    `

    console.log('call_llm_api', prompt)
    const response = await fetch("/api/llm_api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    let responseText = ''

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value,{ stream: true });
      responseText+=chunkValue;
    }
    console.log(responseText);

    const chartConfStr = JSON.stringify(eval("(" + responseText + ")"));
    console.log(responseText);

    let tempChartProps: ReactGoogleChartProps = JSON.parse(chartConfStr);

    setChartProps(tempChartProps);

  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Container maxWidth="lg">
          <Box
            sx={{
              my: 8,
              width:'80%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
              
            </Typography>
            <Typography
              sx={{ display: 'inline' ,color:"rgba(0, 0, 0, 0.6)", fontWeight: 400, fontSize:30, fontFamily:"sans-serif"}}
              component="span"
              variant="h4"
              color="text.primary"
            >
              Natural langauage to charts
           </Typography>
            <TextField  fullWidth id="standard-basic" label="How can i help you today ?" variant="standard" 
              sx={{fontWeight: 400, fontSize:15}}
              multiline
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                      <Tooltip title="Generate chart">
                        <DonutSmallIcon  sx={{cursor:"pointer"}} onClick={handleChange} /> 
                      </Tooltip>
                      
                  </InputAdornment>
                ),
              }}
              />
            <Stack sx={{width: "100%", height:"500px", marginTop:2}}>
              {showChart ?<ChartComponent sx={{width: "100%", height:"80%"}}/>:
              null}
              {  !showChart ?     
              <Stack sx={{width: "100%", height:"80%", marginTop:1}}>
              {/* <MuiMarkdown
                Highlight={Highlight}
                themes={themes}
                prismTheme={themes.github}
                codeWrapperStyles = {{borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                overflow: 'scroll'}}
                overrides={{
                  ...getOverrides({ Highlight, themes, theme: themes.github }), // This will keep the other default overrides.
  
                  h5: {
                    component: 'p',
                    props: {
                      style: { color:"rgba(0, 0, 0, 0.6)", paddingLeft:"20px",  marginLeft :-5,overflow: 'auto', fontWeight:600, fontSize:15, fontFamily:"sans-serif"},
                    } as React.HTMLProps<HTMLParagraphElement>,
                  },
                  p: {
                    component: 'p',
                    props: {
                      style: { color:"rgba(0, 0, 0, 0.6)", paddingLeft:"20px",  marginLeft :-5,overflow: 'auto', fontWeight:400, fontSize:15, fontFamily:"sans-serif"},
                    } as React.HTMLProps<HTMLParagraphElement>,
                  },
                  li:{
                    component: 'li',
                    props: {
                      style: { color:"rgba(0, 0, 0, 0.6)", paddingLeft:"20px",  marginLeft :-5,overflow: 'auto', fontWeight:400, fontSize:15, fontFamily:"sans-serif"},
                    } as React.HTMLProps<HTMLParagraphElement>,
                  }
                }}
                >
                  { progress }
              </MuiMarkdown> */}
               <SyntaxHighlighter language="markdown" wrapLines={true} >
                  {progress}
                </SyntaxHighlighter>

              </Stack>
              :null  }
            </Stack>
          </Box>
        </Container>
      </Grid>
      {/* <Grid item xs={4}>
        <Box
          sx={{
            my: 8,
            width:'80%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Natural langauage to charts
          </Typography>
          <TextField  fullWidth id="standard-basic" label="How can i help you today ?" variant="standard" 
            sx={{fontWeight: 400, fontSize:15}}
            multiline
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                    <Tooltip title="Generate chart">
                      <DonutSmallIcon  sx={{cursor:"pointer"}} onClick={handleChange} /> 
                    </Tooltip>
                    
                </InputAdornment>
              ),
            }}
            />
          <Stack sx={{width: "100%", height:"80%", marginTop:10}}>
            <MuiMarkdown
              codeWrapperStyles = {{borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              overflow: 'scroll'}}
              overrides={{
                ...getOverrides(), // This will keep the other default overrides.

                h5: {
                  component: 'p',
                  props: {
                    style: { color:"rgba(0, 0, 0, 0.6)", paddingLeft:"20px",  marginLeft :-5,overflow: 'auto', fontWeight:600, fontSize:15, fontFamily:"sans-serif"},
                  } as React.HTMLProps<HTMLParagraphElement>,
                },
                p: {
                  component: 'p',
                  props: {
                    style: { color:"rgba(0, 0, 0, 0.6)", paddingLeft:"20px",  marginLeft :-5,overflow: 'auto', fontWeight:400, fontSize:15, fontFamily:"sans-serif"},
                  } as React.HTMLProps<HTMLParagraphElement>,
                },
                li:{
                  component: 'li',
                  props: {
                    style: { color:"rgba(0, 0, 0, 0.6)", paddingLeft:"20px",  marginLeft :-5,overflow: 'auto', fontWeight:400, fontSize:15, fontFamily:"sans-serif"},
                  } as React.HTMLProps<HTMLParagraphElement>,
                }
              }}

              >{ progress }
            </MuiMarkdown>
          </Stack>
        </Box>
      </Grid> */}
    </Grid>


  );
}
