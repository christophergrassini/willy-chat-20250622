export default async function handler(req, res) {
  const { thread } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: thread,
      stream: true
    })
  });

  if (!response.ok || !response.body) {
    res.status(500).send("OpenAI error");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");

  const reader = response.body.getReader();
  const encoder = new TextEncoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(encoder.encode("data:" + new TextDecoder().decode(value)));
  }

  res.end();
}
