# Smart Doctor Connect AI

A high-tech, motion-driven medical console designed to connect patients with doctors using advanced AI triage and secure data management.

## 🚀 Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animations**: [Framer Motion (Motion/React)](https://motion.dev/) for fluid, high-tech transitions.
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) with a custom cyber-medical glassmorphism theme.
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI) & [Sonner](https://sonner.stevenly.me/) for premium toast notifications.

### Intelligence & AI
- **Engine**: [Google Gemini AI](https://aistudio.google.com/) (Gemini 1.5 Flash)
- **Integration**: Automated symptom triage, medical specialization recommendations, and empathetic AI assistant chat.

### Backend & Infrastructure
- **BaaS**: [Firebase](https://firebase.google.com/)
  - **Authentication**: Secure role-based Google Auth.
  - **Firestore**: Real-time database for appointments, profiles, and health records.
  - **Storage**: Cloud storage for medical documentation and profile assets.
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) (Structured for scalability).

### Architecture
- **Structure**: Monorepo (Optimized `frontend/` and `backend/` separation).
- **Deployment**: [Vercel](https://vercel.com/) Ready (Configured for standard monorepo builds).

## 🛠️ Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   Create a `.env` file in the root and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run Locally**:
   ```bash
   npm run dev
   ```

---
Built for the MTM Hackathon - Modernizing Medical Connectivity.
