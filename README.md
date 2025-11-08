# Verum Omnis - Constitutional Forensic AI (Monorepo)

This repository contains the source code for Verum Omnis, a constitutional AI designed for objective, evidence-based forensic analysis. The project is structured as a pnpm monorepo.

-   `apps/web`: The main frontend application, built with Vite and React.
-   `apps/android`: The Capacitor wrapper project for building the Android APK.
-   `packages/core`: Shared, offline-first core logic, including the deterministic rule engine and sealed report generator.

## Core Features

-   **Offline-First Analysis:** Utilizes a powerful on-device rule engine for instant, private analysis of evidence without needing an internet connection.
-   **Sealed PDF Reports:** Generates court-admissible, tamper-proof PDF/A-3B reports directly on the user's device.
-   **Cloud Escalation:** Offers the ability to escalate analysis to the powerful Gemini AI for a deeper, more nuanced forensic examination when online.
-   **9-Brain Architecture:** The offline engine simulates the multi-lens approach (legal, financial, behavioral, etc.) using deterministic rule packs.
-   **Cross-Platform:** Runs as a Progressive Web App (PWA) in any modern browser and can be packaged as a native Android application.

---

## Getting Started

### Prerequisites

-   Node.js (v20 or higher recommended)
-   [pnpm](https://pnpm.io/installation)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd verum-omnis
    ```

2.  **Install dependencies from the root:**
    ```sh
    pnpm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env` in the `apps/web/` directory and add your Gemini API key (for the online escalation feature):
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY
    ```

### Running Locally

To start the web development server, run from the **root directory**:

```sh
pnpm dev
```

This will open the application in your browser at `http://localhost:5173`.

---

## Build & Deployment

### Web App (Firebase)

The web application is configured for continuous deployment to Firebase Hosting via GitHub Actions.

1.  **Build:**
    ```sh
    pnpm build:web
    ```
2.  **Deploy:** Pushing to the `main` branch will automatically trigger the `web-deploy.yml` workflow, which builds and deploys the contents of `apps/web/dist` to Firebase.

### Android APK (Capacitor)

The Android app is a native wrapper around the compiled web application.

1.  **Sync Web Assets:**
    ```sh
    pnpm android:sync
    ```
2.  **Open in Android Studio:**
    ```sh
    pnpm android:open
    ```
    From Android Studio, you can build a signed release APK.
3.  **CI/CD Build:** Pushing a Git tag (e.g., `v1.0.0`) will trigger the `android-apk.yml` workflow, which builds the APK and uploads it as a release artifact.
