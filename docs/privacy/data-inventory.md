## Data Inventory & Flows

This document captures the personal and device data handled by the MalloAI app today.

### 1. Authentication & Identity

| Data                                  | Source                          | Purpose                                         | Storage / Processor                  | Shared with third parties? | Retention |
|---------------------------------------|---------------------------------|-------------------------------------------------|-------------------------------------|----------------------------|-----------|
| Email & password                      | Collected directly in app       | Account creation & login                        | Supabase Auth (Postgres)            | No                         | Until user deletes account |
| Google profile (name, email, avatar)  | Google Sign-In SDK (optional)   | Federated login; populate Supabase user profile | Supabase Auth; Google as identity provider | Yes – Google supplies identity data | Until user deletes account |
| Session tokens / refresh tokens       | Supabase Auth client + AsyncStorage | Keep user signed in                               | Secure token managed by Supabase Auth SDK (stored in `@react-native-async-storage/async-storage`) | No | Removed on logout/account deletion |

### 2. Chat Content & AI Processing

| Data                         | Source                  | Purpose                                                 | Storage / Processor                                   | Shared?                               | Retention |
|------------------------------|-------------------------|---------------------------------------------------------|------------------------------------------------------|----------------------------------------|-----------|
| Chat prompts & assistant replies | Collected in app        | Persist chat history, power AI responses               | Supabase Postgres table `messages`                   | Yes – forwarded to AI providers (OpenAI, Anthropic) via Supabase Edge Functions | Until user deletes room/history |
| Search context / scraped snippets | Generated in Supabase functions | Provide references for answers                          | In-memory during request; cached optionally in Supabase | Yes – external APIs (Tavily, Bing, SerpAPI, Microlink, Jina, Cohere) receive query text | Cache TTL defined in Supabase function settings |

### 3. Device & Diagnostic Data

| Data                         | Source                         | Purpose                                         | Storage / Processor                     | Shared? | Retention |
|------------------------------|--------------------------------|-------------------------------------------------|----------------------------------------|---------|-----------|
| Basic device info (platform, locale) | React Native runtime             | Localize UI, analytics-like logging (console only) | Not persisted remotely                | No      | N/A |
| Clipboard contents           | User initiated copy actions    | Provide “copy” feature for code/messages        | Not persisted; passed to OS clipboard  | No      | Immediate |
| Saved images / downloads     | User triggered via Markdown renderer | Allow saving AI-generated images                   | Only written locally via Expo FileSystem + MediaLibrary | No | Local OS handles retention |

### 4. Permissions & Platform Features

- **Media Library** – Requested at runtime only when a user taps “Save to Photos” for an image. Needed to download to camera roll.
- **Clipboard** – Uses `expo-clipboard` API; no explicit permission but copies user-selected text.
- No camera, microphone, location, or contacts access is implemented.

### 5. Third-Party Services

| Service            | Role                                        | Data Received |
|--------------------|---------------------------------------------|---------------|
| Supabase           | Authentication, Postgres DB, Edge Functions | Account info, chat rooms, chat messages, session tokens |
| Google Sign-In     | Federated identity provider                 | Email/profile for consenting users |
| OpenAI & Anthropic | Large language models via Supabase functions | User prompts + conversation context |
| Tavily, Bing, SerpAPI, Microlink, Jina, Cohere | Optional search/rerank providers when “search mode” enabled | Query text and URL snippets |

### 6. Retention & Deletion Notes

- Deleting a chat room removes associated messages from Supabase.
- Logging out clears Supabase session tokens from AsyncStorage.
- Account deletion is available in Settings → Delete Account. Users have a 14-day grace period during which they can cancel by logging back in. After 14 days, a scheduled cron job permanently deletes the user and all associated data.

### 7. Data Not Collected

- No advertising IDs, precise location, health, fitness, or payment data.
- No third-party analytics SDKs (Firebase, Segment, etc.) are integrated.

