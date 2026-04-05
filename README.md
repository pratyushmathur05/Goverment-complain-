<div align="center">

<br />

# 🏛️ Government Complaint Portal

### A modern, citizen-first platform for raising and tracking government complaints

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

> **Empowering citizens. Enabling accountability. Transforming governance.**

<br />

</div>

---

## 📌 Overview

The **Government Complaint Portal** is a full-stack web application that bridges the gap between citizens and government authorities. It provides a streamlined interface for:

- 🧑‍💼 **Civilians** to register, track, and escalate complaints
- 🛡️ **Admins** to manage, respond to, and resolve citizen issues
- 📊 **Visualizations** offering real-time insights into complaint trends and resolution rates

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 **Authentication** | Secure login/signup for civilians and admins |
| 📝 **Complaint Filing** | Easy-to-use forms for submitting detailed complaints |
| 📬 **Status Tracking** | Real-time updates on complaint progress |
| 🛠️ **Admin Dashboard** | Manage and respond to all citizen complaints |
| 📈 **Data Visualization** | Interactive charts to analyze complaint patterns |
| 🌐 **Responsive Design** | Works seamlessly across devices |

---

## 🗂️ Project Structure

```
📁 app/
├── 🔒 auth/          # Authentication pages (login, signup)
├── 👤 civilian/      # Civilian dashboard & complaint management
├── 🛡️ admin/         # Admin panel for complaint handling
├── 🏠 home/          # Landing and home pages
├── 📊 visulization/  # Charts & analytics
├── 🔧 components/    # Reusable UI components
├── 🪝 hooks/         # Custom React hooks
├── 📚 lib/           # Utility functions & helpers
├── 🔗 context/       # Global state / context providers
└── 🏷️ types/         # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher → [Download](https://nodejs.org/)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pratyushmathur05/Goverment-complain-.git

# 2. Navigate into the project
cd Goverment-complain-

# 3. Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

> The app supports **hot-reloading** — changes to `app/page.tsx` reflect instantly in the browser.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Fonts** | [Geist](https://vercel.com/font) via `next/font` |
| **Linting** | ESLint with Next.js config |
| **Analytics Engine** | Python 3 + [Streamlit](https://streamlit.io/) |
| **Data & Plotting** | NumPy + Matplotlib (3D Surface & Scatter) |

---

## 🧮 Complaint Priority Score Engine (`fulmula.py`)

> **Located at:** `app/visulization/fulmula.py`

At the heart of this portal is an **AI-powered Priority Scoring System** — a multi-variable mathematical formula that automatically ranks complaints by urgency, ensuring the most critical issues are always addressed first.

This engine is built as an **interactive Streamlit application**, letting admins and analysts explore how different factors influence a complaint's priority score in real time.

---

### 📐 The Priority Formula

$$
P = \Big[\alpha R^{\gamma} + \beta V^{\delta} + \chi \cdot \frac{\log(1+D)}{\log 2} + \eta T + \lambda \cdot Time + \mu (V \cdot D) + \nu (T \cdot urgency)\Big] \times (1 + urgency) \times e^{-\kappa(1-V)}
$$

---

### 🔢 Formula Variables

| Symbol | Variable | Description |
|--------|----------|-------------|
| **R** | User Rating | Credibility/rating of the complaint submitter (0–1) |
| **V** | AI Validation | AI confidence score for complaint legitimacy (0–1) |
| **T** | Complaint Type | Severity class of the complaint category (0–1) |
| **D** | Density | Volume of similar complaints in the area (0–1) |
| **Time** | Time Elapsed | How long the complaint has been unresolved (0–1) |
| **urgency** | Urgency Flag | Manual urgency level tagged by citizen or admin (0–1) |

---

### ⚙️ Tuned Parameters

| Parameter | Symbol | Value | Role |
|-----------|--------|-------|------|
| Rating weight | α (alpha) | `0.15` | Impact of user rating |
| Validation weight | β (beta) | `0.25` | Impact of AI validation |
| Density weight | χ (chi) | `0.20` | Impact of complaint density |
| Type weight | η (eta) | `0.15` | Impact of complaint category |
| Time weight | λ (lambda) | `0.10` | Impact of time elapsed |
| Interaction: V×D | μ (mu) | `0.10` | Rating–density interaction |
| Interaction: T×urgency | ν (nu) | `0.05` | Type–urgency synergy |
| Rating exponent | γ (gamma) | `2` | Non-linearity of rating |
| Validation exponent | δ (delta) | `2` | Non-linearity of AI score |
| Decay constant | κ (kappa) | `2` | Penalty for low AI validation |

---

### 📊 Visualizations Included

| Chart | Description |
|-------|-------------|
| 🌐 **3D Surface Plot** | Priority score across all combinations of Density (D) and Time |
| 🔵 **Scatter Plot** | Priority vs. Density, color-coded by Time elapsed |
| 🔢 **Live Score Display** | Real-time P value computed from slider inputs |

---

### 💻 Formula in Code

```python
P = (
    alpha * (R ** gamma)
    + beta  * (V ** delta)
    + chi   * (log(1 + D) / log(2))
    + eta   * T
    + lambda_ * Time
    + mu    * (V * D)
    + nu    * (T * urgency)
) * (1 + urgency) * exp(-kappa * (1 - V))
```

> **Key insight:** The exponential decay term `e^{-κ(1-V)}` heavily penalises complaints with low AI validation scores, preventing spam or low-quality submissions from getting high priority.

---

### ▶️ Running the Priority Visualizer

Make sure you have Python and the required packages installed:

```bash
# Install dependencies
pip install streamlit numpy matplotlib

# Run the Streamlit app
streamlit run app/visulization/fulmula.py
```

Open [http://localhost:8501](http://localhost:8501) in your browser. Use the **interactive sliders** to tune each variable and watch the priority score and 3D surface update in real time.

---

## 🌍 Deployment

The easiest way to deploy this app is via **[Vercel](https://vercel.com/)** — the platform built by the creators of Next.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

For a step-by-step guide, see the [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for better governance and citizen empowerment.

⭐ **Star this repo** if you find it useful!

</div>
