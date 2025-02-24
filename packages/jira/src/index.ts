import { connectServer, createMcpServer, formatToolResponse } from '@atlassian-dc-mcp/common';
import { JiraService, jiraToolSchemas } from './jira-service.js';

// Validate required environment variables
const missingEnvVars = JiraService.validateConfig();
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const jiraService = new JiraService(
  process.env.JIRA_HOST!,
  process.env.JIRA_API_TOKEN!
);

// Initialize MCP server
const server = createMcpServer({
  name: "atlassian-jira-mcp",
  version: "0.1.0"
});

// Add JIRA issue search tool
server.tool(
  "jira_searchIssues",
  "Search for JIRA issues using JQL",
  jiraToolSchemas.searchIssues,
  async ({ jql, maxResults = 10 }) => {
    const result = await jiraService.searchIssues(jql, maxResults);
    return formatToolResponse(result);
  }
);

// Add get JIRA issue tool
server.tool(
  "jira_getIssue",
  "Get details of a JIRA issue by its key",
  jiraToolSchemas.getIssue,
  async ({ issueKey }) => {
    const result = await jiraService.getIssue(issueKey);
    return formatToolResponse(result);
  }
);

// Add create JIRA issue tool
server.tool(
  "jira_createIssue",
  "Create a new JIRA issue",
  jiraToolSchemas.createIssue,
  async (params) => {
    const result = await jiraService.createIssue(params);
    return formatToolResponse(result);
  }
);

// Connect the server after all tools are registered
await connectServer(server);
