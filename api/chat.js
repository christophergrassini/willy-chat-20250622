export default async function handler(req, res) {
  const thread = req.body.thread || [];

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: thread,
      stream: true,
    }),
  });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const reader = openaiRes.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(line => line.trim().startsWith("data:"));

    for (const line of lines) {
      const data = line.replace(/^data: /, "").trim();
      if (data === "[DONE]") {
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }
      res.write(`data: ${data}\n\n`);
    }
  }

  res.end();
}
