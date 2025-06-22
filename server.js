import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  const { thread = [] } = req.body;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'system', content: 'Sei Willy, assistente F&B creato da Christopher. Rispondi in modo cordiale, competente e conciso.' },
      ...thread
    ]
  });

  for await (const chunk of completion) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) res.write(`data:${token}\n\n`);
  }

  res.write('event:done\ndata:\u2714\ufe0f\n\n');
  res.end();
});

app.listen(3001, () => console.log('✅ Server partito su http://localhost:3001'));
