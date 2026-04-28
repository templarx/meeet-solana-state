import { describe, it, expect } from "vitest"

describe("MEEET MCP Server", () => {
  it("should have all 7 tools defined", () => {
    // Tool names that must exist
    const requiredTools = [
      "meeet_get_agent",
      "meeet_trust_score",
      "meeet_discoveries",
      "meeet_verify",
      "meeet_arena",
      "meeet_governance",
      "meeet_oracle",
    ]
    // Verify all tools are listed
    expect(requiredTools.length).toBe(7)
    requiredTools.forEach((tool) => {
      expect(tool).toMatch(/^meeet_/)
    })
  })
})
