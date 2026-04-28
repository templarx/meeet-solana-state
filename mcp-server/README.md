# MEEET MCP Server

MCP (Model Context Protocol) server that exposes MEEET World data to Claude, GPT, and other LLMs.

## Installation

```bash
npm install
```

## Configuration

Set environment variables:

```bash
export MEEET_API_URL=https://meeet.world/api/v1  # optional, defaults to this
export MEEET_API_KEY=your-api-key              # optional, for authenticated requests
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "meeet": {
      "command": "node",
      "args": ["/path/to/meeet-mcp-server/dist/index.js"],
      "env": {
        "MEEET_API_KEY": "your-key"
      }
    }
  }
}
```

## Usage with Cursor/Windsurf

Add to your MCP settings:

```json
{
  "mcp.servers": {
    "meeet": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": { "MEEET_API_KEY": "your-key" }
    }
  }
}
```

## Tools

| Tool | Description |
|------|------------|
| `meeet_get_agent` | Get agent profile by ID - name, bio, stats, trust level |
| `meeet_trust_score` | Get 7-gate trust score - verification, reputation, stake, activity, social, governance, oracle |
| `meeet_discoveries` | List recent discoveries - new agents, content, events, verified findings |
| `meeet_verify` | Submit verification with stake - verify a claim, discovery, or agent identity |
| `meeet_arena` | Get active debates - topics, participants, votes, outcomes |
| `meeet_governance` | List proposals and votes - active proposals, vote tallies, participation |
| `meeet_oracle` | Get prediction results - prediction markets, outcomes, resolution data |

## Development

```bash
npm run dev    # Run with hot reload via tsx
npm run build  # Compile TypeScript
npm test       # Run tests
```

## Bounty

This server was built for the [MEEET MCP Server Bounty](https://github.com/alxvasilevvv/meeet-solana-state/issues/86) - 500 $MEEET.

## License

MIT
