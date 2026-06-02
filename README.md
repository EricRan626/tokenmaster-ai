# TokenMaster AI

**Cost Intelligence for AI Agents**

TokenMaster AI is an interactive MVP for predicting and reducing AI agent execution cost. It estimates token usage, compares model/API routes, optimizes prompts, and includes a live MiroMind API integration through a Netlify Function.

## Demo Features

- Agent task cost prediction
- Model routing across premium, best-value, and marketplace strategies
- Prompt templates for lowest-token, best-value, and fastest-run modes
- Trusted API marketplace concept
- MiroMind live API call via serverless proxy
- Correction feedback loop

## Tech Stack

- HTML
- CSS
- JavaScript
- Netlify
- Netlify Functions
- MiroMind API

## MiroMind API Setup

Set this environment variable in Netlify:

```text
MIROMIND_API_KEY=your_miromind_api_key
```

Then redeploy the site.

## Netlify Deployment

This repository can be deployed directly on Netlify.

- Publish directory: project root
- Functions directory: `netlify/functions`

The included `netlify.toml` configures the functions directory.

## Project Positioning

TokenMaster AI helps builders and teams stop wasting tokens before an AI agent runs. It can evolve into a broader platform for usage monitoring, model benchmarking, trusted API procurement, and global model discovery.
