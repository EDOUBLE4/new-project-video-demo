# Phase 2: MVP (Minimal Viable Product)

This phase focuses on building the core, usable features of the AI property management agent. The goal is to have a functional product that can search for apartments and interact with a user.

---

## Features

1.  **Develop Chat Interface:**
    -   Build the chat UI using Shadcn components.
    -   Implement the ability to send and receive messages.
    -   Display messages from the user and the agent in the chat window.

2.  **Implement Scraping Logic:**
    -   Create an API route (`app/api/scrape/route.ts`) that uses Firecrawl to scrape apartment data from a sample website.
    -   Create a Supabase table to store the scraped apartment data.
    -   Implement the logic to save the scraped data to the Supabase table.

3.  **Build the AI Agent:**
    -   Create an API route (`app/api/chat/route.ts`) to handle the chat logic.
    -   Use the `openai-agents-js` SDK to define our agent.
    -   Define a `search_apartments` tool for the agent to use.
    -   Implement the logic for the `search_apartments` tool to query the Supabase database.

4.  **Connect UI to Agent:**
    -   Connect the chat interface to the chat API route.
    -   Display the agent's responses in the chat window.

5.  **Schedule Daily Scraping:**
    -   Configure a Vercel Cron Job to trigger the scraping API route once a day.
