exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.MIROMIND_API_KEY;
  if (!apiKey) {
    return json(500, {
      ok: false,
      error: "MIROMIND_API_KEY is not configured on the server."
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  const task = String(payload.task || "").slice(0, 3000);
  const mode = String(payload.mode || "balanced").slice(0, 60);
  const sources = Number(payload.sources || 1);
  if (!task.trim()) {
    return json(400, { ok: false, error: "Task is required." });
  }

  const prompt = [
    "You are TokenMaster AI, a cost intelligence agent for AI agent workflows.",
    "Analyze the user's agent task and return a concise, demo-ready optimization plan.",
    "Do not expose private reasoning. Do not mention hidden chain-of-thought.",
    "",
    `Task: ${task}`,
    `Run mode: ${mode}`,
    `Approximate source count: ${sources}`,
    "",
    "Return exactly these sections:",
    "1. Cost Risk",
    "2. Token Waste Sources",
    "3. Recommended Model Routing",
    "4. Prompt Optimization",
    "5. One-sentence business value"
  ].join("\n");

  try {
    const response = await fetch("https://api.miromind.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mirothinker-1-7-deepresearch-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const text = await response.text();
    if (!response.ok) {
      return json(response.status, {
        ok: false,
        error: "MiroMind API request failed.",
        details: text.slice(0, 800)
      });
    }

    const parsed = parseMiroMindResponse(text);
    return json(200, {
      ok: true,
      model: parsed.model || "mirothinker-1-7-deepresearch-mini",
      content: parsed.content || "MiroMind returned an empty response.",
      usage: parsed.usage || null
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error.message || "Unknown server error."
    });
  }
};

function parseMiroMindResponse(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("data:")) {
    const body = JSON.parse(trimmed);
    return {
      model: body.model,
      content: body.choices?.[0]?.message?.content || "",
      usage: body.usage || null
    };
  }

  let content = "";
  let usage = null;
  let model = "";
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const chunk = line.slice(5).trim();
    if (!chunk || chunk === "[DONE]") continue;
    try {
      const event = JSON.parse(chunk);
      model = event.model || model;
      const delta = event.choices?.[0]?.delta || {};
      if (typeof delta.content === "string") content += delta.content;
      if (typeof delta.agent_summary === "string" && !content.includes(delta.agent_summary)) {
        content += delta.agent_summary;
      }
      if (event.usage) usage = event.usage;
    } catch {
      // Ignore malformed stream chunks.
    }
  }
  return { model, content: content.trim(), usage };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}
