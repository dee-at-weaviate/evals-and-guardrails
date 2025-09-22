import { OpenAIEmbeddings } from "@langchain/openai";
import { WeaviateStore } from "@langchain/weaviate";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as dotenv from "dotenv";
import weaviate, { dataType, vectorizer } from "weaviate-client";
import * as weave from 'weave';
import { retailDocuments, retailQuestions } from './retail-data.js';

dotenv.config();

// Initialize Weaviate client
const client = await (weaviate as any).connectToWeaviateCloud(
  process.env.WEAVIATE_URL, { 
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ''),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',  
    }
  }
);

const setupVectorStore = async () => {
  const collectionName = "Clothing_Inventory";
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY
  });

  const exists = await client.collections.exists(collectionName); 
  if (exists) {
    return new WeaviateStore(embeddings, { client, indexName: collectionName });
  }

  const schema = {
    name: collectionName,
    description: "Retail clothing store inventory",
    properties: [
      { name: "product_name", dataType: dataType.TEXT },
      { name: "description", dataType: dataType.TEXT },
      { name: "category", dataType: dataType.TEXT },
      { name: "brand", dataType: dataType.TEXT },
      { name: "price", dataType: dataType.NUMBER },
      { name: "sizes", dataType: dataType.TEXT },
      { name: "colors", dataType: dataType.TEXT }
    ],
    vectorizers: [
      vectorizer.text2VecOpenAI({
        name: "product_vector",
        sourceProperties: ["description", "product_name", "category", "brand", "price", "sizes", "colors"], 
      }),
    ],
  };

  const weaviateArgs = { client, schema };
  return await WeaviateStore.fromDocuments(retailDocuments, embeddings, weaviateArgs);
};

const buildJudgeChain = (
  promptTemplate: ChatPromptTemplate,
  modelName: string
) => {
  const llm = new ChatOpenAI({ model: modelName, temperature: 0 });

  const parseJudgment = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return {
        score: Math.max(1, Math.min(5, parsed.score || 1)),
        reason: parsed.reason || "No reason provided",
      };
    } catch (error) {
      return {
        score: 1,
        reason: `Failed to parse judge output: ${text.substring(0, 200)}...`,
      };
    }
  };

  return promptTemplate.pipe(llm).pipe(new StringOutputParser()).pipe(parseJudgment);
};



const evaluateWithJudge = async (
  questions: string[],
  passThreshold: number,
  modelJudge: string,
  judgePrompt: ChatPromptTemplate
) => {
  try {
    await weave.init('Retail-Search-Evaluation');
  } catch (error) {
    console.error("Weave initialization failed:", error);
    throw error;
  }
  
  const vectorStore = await setupVectorStore();
  const judgeChain = buildJudgeChain(judgePrompt, modelJudge);

  const dataset = new weave.Dataset({
    rows: questions.map((q, i) => ({
      id: i.toString(),
      question: q
    }))
  });

  const evaluationModel = weave.op(async ({ datasetRow }) => {
    const question = datasetRow.question;
    const retrievedDocs = await vectorStore.hybridSearch(question, {limit: 1});
    
    const judgment = await judgeChain.invoke({
      question,
      answer: retrievedDocs.map(doc => doc.pageContent).join('\n')
    });

    return {
      question,
      retrievedText: retrievedDocs.map(doc => doc.pageContent).join('\n'),
      retrievedCount: retrievedDocs.length,
      score: judgment.score,
      reason: judgment.reason,
      passed: judgment.score >= passThreshold
    };
  }, { name: 'LLM-as-Judge' });

  const simpleScorer = weave.op(
    ({ modelOutput }) => ({ score: modelOutput.score, passed: modelOutput.passed }),
    { name: 'simpleScore' }
  );

  const evaluation = new weave.Evaluation({
    dataset,
    scorers: [simpleScorer],
  });

  const results = await evaluation.evaluate({ model: evaluationModel });  
  return results;
};

const LLM_AS_JUDGE_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", `You are evaluating a retail product search system. Customers search for clothing items using natural language, and you need to determine if the retrieved products are relevant to their search intent.

IMPORTANT: Focus on search relevance, not perfect matches. A customer searching for "dress for party" should find cocktail dresses, evening dresses, etc. Consider synonyms, related items, and search intent.

Scoring Scale (1-5):
- 5: Excellent - The retrieved product perfectly matches or highly relates to the customer's search intent.
- 4: Good - The retrieved product is relevant with minor differences (e.g., slightly different style/color than ideal).
- 3: Fair - The retrieved product is somewhat relevant but may not fully meet the search intent.
- 2: Poor - The retrieved product has minimal relevance to the search query.
- 1: Unacceptable - The retrieved product is completely irrelevant to the customer's search.

Examples:
- Search: "black dress for evening" → Retrieved: "Elegant Black Cocktail Dress" → Score: 5 (Perfect match)
- Search: "warm sweater" → Retrieved: "Cozy Winter Wool Sweater" → Score: 5 (Excellent relevance)
- Search: "business attire" → Retrieved: "Professional Business Blazer" → Score: 5 (Highly relevant)
- Search: "casual shoes" → Retrieved: "Leather Ankle Boots" → Score: 3 (Somewhat relevant but more formal)

Return JSON with this exact structure:
{{
  "score": <score_1_to_5>,
  "reason": "<detailed_explanation>"
}}`],
  ["human", `Customer Search: {question}

Retrieved Product: {answer}

Evaluate if this product is relevant to what the customer is searching for. Consider search intent and natural language variations.`]
]);

async function runDemo() {
  console.log("Starting Evaluation with LLM-as-Judge...");
  
  try {
    const results = await evaluateWithJudge(
      retailQuestions,
      3,
      "gpt-4o-mini",
      LLM_AS_JUDGE_PROMPT
    );

    console.log("Evaluation Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Evaluation failed:", error);
  }
}

runDemo();
