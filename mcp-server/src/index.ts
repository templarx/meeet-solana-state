#!/usr/bin/env node

/**
 * MEEET MCP Server - exposes MEEET World data to Claude, GPT, and other LLMs
 * Bounty: 500 $MEEET - github.com/alxvasilevvv/meeet-solana-state/issues/86
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const MEEET_API = process.env.MEEET_API_URL || "https://meeet.world/api/v1"
const MEEET_KEY = process.env.MEEET_API_KEY || ""

async function meeetFetch(path, opts) {
  const url = `${MEEET_API}${path}`
  const headers = {
    "Content-Type": "application/json",
    ...(MEEET_KEY ? { Authorization: `Bearer ${MEEET_KEY}` } : {}),
    ...((opts && opts.headers) || {}),
  }
  const res = await fetch(url, { ...opts, headers })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MEEET API ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json()
}

// --- Create MCP Server ---
const server = new McpServer({
  name: "meeet-world",
  version: "1.0.0",
  description: "MEEET World data - agent profiles, trust scores, discoveries, arena, governance, oracle",
})

// Tool 1: meeet_get_agent
server.tool("meeet_get_agent", "Get a MEEET agent profile by ID - name, bio, stats, trust level",
  { agentId: z.string().describe("Agent ID or username") },
  async ({ agentId }) => {
    try {
      const data = await meeetFetch(`/agents/${encodeURIComponent(agentId)}`)
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error fetching agent: ${e.message}` }], isError: true }
    }
  }
)

// Tool 2: meeet_trust_score
server.tool("meeet_trust_score", "Get the 7-gate trust score for a MEEET agent - verification, reputation, stake, activity, social, governance, oracle",
  { agentId: z.string().describe("Agent ID to check trust score") },
  async ({ agentId }) => {
    try {
      const data = await meeetFetch(`/agents/${encodeURIComponent(agentId)}/trust`)
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error fetching trust score: ${e.message}` }], isError: true }
    }
  }
)

// Tool 3: meeet_discoveries
server.tool("meeet_discoveries", "List recent discoveries on MEEET World - new agents, content, events, verified findings",
  {
    limit: z.number().default(20).describe("Number of discoveries to return"),
    category: z.string().optional().describe("Filter by category: agent, content, event, finding"),
  },
  async ({ limit, category }) => {
    try {
      const params = new URLSearchParams({ limit: String(limit) })
      if (category) params.set("category", category)
      const data = await meeetFetch(`/discoveries?${params}`)
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error fetching discoveries: ${e.message}` }], isError: true }
    }
  }
)

// Tool 4: meeet_verify
server.tool("meeet_verify", "Submit a verification with stake - verify a claim, discovery, or agent identity on MEEET",
  {
    targetId: z.string().describe("ID of the item to verify"),
    stake: z.number().describe("Amount of MEEET tokens to stake on this verification"),
    evidence: z.string().describe("Evidence or reasoning for the verification"),
  },
  async ({ targetId, stake, evidence }) => {
    try {
      const data = await meeetFetch("/verifications", {
        method: "POST",
        body: JSON.stringify({ target_id: targetId, stake, evidence }),
      })
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error submitting verification: ${e.message}` }], isError: true }
    }
  }
)

// Tool 5: meeet_arena
server.tool("meeet_arena", "Get active debates in the MEEET Arena - topics, participants, votes, outcomes",
  {
    debateId: z.string().optional().describe("Specific debate ID (omit for all active)"),
    status: z.string().default("active").describe("Filter: active, closed, all"),
  },
  async ({ debateId, status }) => {
    try {
      const path = debateId
        ? `/arena/${encodeURIComponent(debateId)}`
        : `/arena?status=${status}`
      const data = await meeetFetch(path)
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error fetching arena: ${e.message}` }], isError: true }
    }
  }
)

// Tool 6: meeet_governance
server.tool("meeet_governance", "List governance proposals and votes on MEEET World - active proposals, vote tallies, participation",
  {
    proposalId: z.string().optional().describe("Specific proposal ID (omit for all active)"),
    includeClosed: z.boolean().default(false).describe("Include closed/resolved proposals"),
  },
  async ({ proposalId, includeClosed }) => {
    try {
      const path = proposalId
        ? `/governance/${encodeURIComponent(proposalId)}`
        : `/governance?closed=${includeClosed}`
      const data = await meeetFetch(path)
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error fetching governance: ${e.message}` }], isError: true }
    }
  }
)

// Tool 7: meeet_oracle
server.tool("meeet_oracle", "Get prediction results from the MEEET Oracle - prediction markets, outcomes, and resolution data",
  {
    marketId: z.string().optional().describe("Specific market ID (omit for all active markets)"),
    resolved: z.boolean().default(false).describe("Include resolved predictions"),
  },
  async ({ marketId, resolved }) => {
    try {
      const path = marketId
        ? `/oracle/${encodeURIComponent(marketId)}`
        : `/oracle?resolved=${resolved}`
      const data = await meeetFetch(path)
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
    } catch (e) {
      return { content: [{ type: "text", text: `Error fetching oracle: ${e.message}` }], isError: true }
    }
  }
)

// --- Start Server ---
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("MEEET MCP Server running on stdio")
}

main().catch((e) => {
  console.error("Fatal:", e)
  process.exit(1)
})
