# Nexus App

Nexus is a voice-first cognitive architecture designed to accelerate the journey from fleeting thought to executed strategy. It provides specialized AI agents that act as your Scribe, Skeptic, and Coach—all through natural conversation.

## Features
- **Voice-first capture:** Speak your ideas, and Nexus structures them into high-fidelity Markdown notes.
- **Debate mode:** Simulate adversarial feedback with a skeptical AI agent to stress-test your ideas.
- **Coaching mode:** Practice your pitch and receive real-time feedback from a pitch coach persona.
- **Persistent vector memory:** Nexus remembers your ideas and context across sessions.
- **Memory Vault:** Transparent archive of your intellectual property—transcripts, summaries, and debate reports.


## Project Structure

```
|   README.md
|   
|   
|---backend
|   |   app_logic.py
|   |   database.py
|   |   dtos.py
|   |   init_env.py
|   |   llm_client.py
|   |   main.py
|   |   PROMPTS.py
|   |   requirements.txt
|   |
|   +---credentials
|           creds.json
|
|---frontend
      |   eslint.config.mjs
      |   next-env.d.ts
      |   next.config.ts
      |   package.json
      |   postcss.config.mjs
      |   README.md
      |   tsconfig.json
      |
      +---app
      |   |   globals.css
      |   |   home.module.css
      |   |   layout.tsx
      |   |   page.tsx
      |   |
      |   +---components
      |   |       HelpModal.tsx
      |   |       HistoryOverlay.module.css
      |   |       HistoryOverlay.tsx
      |   |
      |   +---local
      |   |       tt.txt
      |   |
      |   +---public
```
------

- **backend/**: Python FastAPI backend for business logic, LLM integration, and data persistence.
- **frontend/**: Next.js React frontend for user interaction, including UI components and styles.
- **credentials/**: Secure storage for API keys and sensitive configuration.

## Getting Started

### Backend
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```sh
   uvicorn main:app --reload
   ```

### Frontend
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Usage
- Access the frontend at `http://localhost:3000`.
- Use the Help modal in the UI for a detailed user manual.

## License

This project is licensed under the [MIT License](LICENSE), which is an [OSI Approved License](https://opensource.org/licenses/MIT).

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
