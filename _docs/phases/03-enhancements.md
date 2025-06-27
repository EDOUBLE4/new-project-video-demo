# Phase 3: Enhancements

This phase focuses on improving and expanding the MVP by adding advanced features, polish, and scalability.

---

## Features

1.  **Advanced Search Capabilities:**
    -   Implement semantic search using `pgvector`.
    -   Generate vector embeddings for apartment descriptions.
    -   Update the `search_apartments` tool to perform hybrid searches (keyword + semantic).

2.  **Improved User Experience:**
    -   Add user authentication with Supabase to allow users to save their favorite apartments.
    -   Implement real-time streaming of agent responses for a more interactive feel.
    -   Add loading indicators and other UI polish.

3.  **Expanded Scraping:**
    -   Add support for scraping multiple property management websites.
    -   Implement more robust error handling and monitoring for the scraping process.

4.  **Multi-Agent System (Future):**
    -   Explore breaking down the single agent into multiple specialized agents (e.g., a `SearchAgent` and a `TourSchedulingAgent`) using the handoff features of the `openai-agents-js` library.
