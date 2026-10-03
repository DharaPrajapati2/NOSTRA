# NOSTRA

### AI-Powered Privacy Intelligence for Nostr

NOSTRA is a privacy intelligence platform for the **Nostr ecosystem** that analyzes publicly available Nostr activity and identifies privacy signals that may reveal information about a user's online identity.

Instead of simply showing raw Nostr events, NOSTRA transforms public activity into an understandable privacy report — helping users see what information is publicly exposed and what an observer may be able to infer from it.

---

## 🚨 The Problem

Nostr is built around public, decentralized communication.

While this provides openness and censorship resistance, users may unintentionally expose connections between their Nostr identity and other parts of their online presence.

A single public post can contain:

- External profile links
- GitHub or other identity references
- Websites
- Hashtags and interests
- Location-related information
- Contact information
- Media links
- Other publicly visible signals

The problem is not necessarily that this information exists.

The problem is that **users may not realize how these individual signals can be connected together.**

---

## 💡 Our Solution

NOSTRA analyzes a user's public Nostr activity and converts it into a structured privacy intelligence report.

The platform:

```text
Nostr Identity
       ↓
Connect to Nostr Relays
       ↓
Collect Public Events
       ↓
Analyze Event Content
       ↓
Detect Privacy Signals
       ↓
Classify Findings
       ↓
Generate Privacy Intelligence
```

This gives users a clearer understanding of the information that their public activity exposes.

---

## ✨ Key Features

### 🔍 Public Identity Analysis

Users can enter a Nostr `npub` and analyze the publicly available activity associated with that identity.

---

### 🌐 Multi-Relay Analysis

NOSTRA connects to multiple Nostr relays to collect public events.

Currently supported relays include:

- `relay.damus.io`
- `relay.primal.net`
- `nos.lol`

The platform also reports successful and failed relay connections as part of the analysis.

---

### 🕵️ Privacy Signal Detection

NOSTRA identifies different types of publicly visible privacy signals.

Current detection includes:

- 🔗 External links
- 👤 External identity references
- # Hashtags
- 📍 Location-related signals
- 📧 Email patterns
- 📱 Phone-like patterns
- 🖼️ Media links
- 💬 Mentions

---

### ⚠️ Severity Classification

Detected signals are classified according to their privacy relevance.

NOSTRA currently uses:

- **Info**
- **Attention**
- **Review**

This allows users to quickly understand which findings deserve closer inspection.

---

### 📊 Privacy Intelligence Dashboard

After analysis, NOSTRA presents a structured report containing:

- Events analyzed
- Total privacy findings
- Severity distribution
- Finding categories
- Relay coverage
- Individual event analysis
- Privacy explanations

---

### 🧠 AI-Assisted Explanation

NOSTRA includes an intelligence layer that converts technical findings into understandable privacy explanations.

Instead of only displaying:

> External identity detected

the platform provides context about why that signal may matter from a privacy perspective.

---

### 👁️ Observer View

NOSTRA provides an observer-oriented perspective of the public information contained within the analyzed activity.

The goal is to help users understand what another person could potentially learn by examining their publicly available Nostr activity.

---

### 🔎 Signal Explorer

Users can explore detected signals and filter findings based on severity.

The explorer allows users to inspect:

- Signal type
- Severity
- Explanation
- Privacy implication
- Related event

---

### 📝 Event-Level Analysis

Each analyzed Nostr event can be inspected individually.

NOSTRA connects an event with the privacy signals detected inside it, allowing users to understand exactly where a finding originated.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       NOSTRA        │
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Nostr SDK       │
                    │   NIP-19 / npub     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Damus Relay       Primal Relay      nos.lol
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Public Nostr      │
                    │       Events        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Privacy Signal      │
                    │     Analyzer        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Privacy Intelligence│
                    │       Report        │
                    └─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Lucide React

### Backend

- Python
- FastAPI
- Uvicorn
- nostr-sdk

### Nostr

- Nostr Protocol
- NIP-19
- `npub` identity handling
- Nostr Relay communication

### Intelligence

- Privacy signal detection
- Rule-based analysis
- AI-assisted explanations

### Development

- Git
- GitHub
- REST API
- Swagger / OpenAPI
- VS Code

---

## 📂 Project Structure

```text
NOSTRA/
│
├── backend/
│   ├── ...
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── profile_test.py
├── test_nostr.py
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Python 3.14+
- Node.js
- npm
- Git

---

## 🔧 Backend Setup

Navigate to the project directory:

```bash
cd NOSTRA
```

Create and activate a virtual environment:

### Windows

```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install the backend dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn backend.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 💻 Frontend Setup

Open another terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔄 How NOSTRA Works

### Step 1 — Enter Identity

The user provides a Nostr public identity in `npub` format.

### Step 2 — Identity Validation

NOSTRA validates and processes the Nostr identity.

### Step 3 — Relay Connection

The backend connects to available Nostr relays.

### Step 4 — Event Collection

Public events associated with the identity are collected.

### Step 5 — Privacy Analysis

The events are inspected for publicly visible privacy signals.

### Step 6 — Classification

Detected signals are organized by category and severity.

### Step 7 — Intelligence Report

The frontend presents the results through an interactive privacy dashboard.

---

## 🔐 Privacy Philosophy

NOSTRA is designed around a simple principle:

> **Public does not always mean obvious.**

Information can be individually harmless while becoming more revealing when multiple public signals are connected.

NOSTRA focuses on helping users understand these connections through their publicly available Nostr activity.

The platform does not require a user's private key to perform public identity analysis.

---

## 🎯 Hackathon Tracks

NOSTRA fits naturally into the following areas:

### 🔐 Privacy

The primary focus of NOSTRA is privacy analysis and public information exposure.

### 🤖 AI

NOSTRA uses an intelligence layer to explain detected privacy signals and make technical findings easier to understand.

### 🟣 Nostr

NOSTRA directly interacts with the Nostr ecosystem, including Nostr identities, events, and relays.

---

## 🚀 Future Scope

Potential future development includes:

- More advanced identity correlation
- Richer privacy exposure scoring
- Visual identity graphs
- Historical privacy analysis
- More sophisticated AI-powered recommendations
- Additional Nostr NIPs and event types
- Expanded relay coverage
- Automated privacy reports
- Privacy trend monitoring

---

## 🧪 Current Analysis Output

NOSTRA currently produces information such as:

```text
Events Analyzed
Total Findings
Severity Distribution
Finding Categories
Successful Relays
Failed Relays
AI Explanation
Event-Level Findings
```

This allows users to move from raw public Nostr activity to a structured privacy intelligence report.

---

## 🌍 Why NOSTRA?

Nostr gives users a decentralized and open communication layer.

NOSTRA adds another layer:

```text
Nostr
  ↓
Public Activity
  ↓
Privacy Signals
  ↓
Context
  ↓
Understanding
```

The goal is not to tell users what they should post.

The goal is to help them understand **what their public activity reveals.**

---

## 👩‍💻 Built For

**Bitshala BOSS Battle**

Track focus:

**Privacy × AI × Nostr**

---

## 📜 License

This project is currently developed as a hackathon project.

---

## ⭐ NOSTRA

**See what your public identity reveals.**
