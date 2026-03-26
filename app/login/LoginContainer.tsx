"use client";

import { useState } from "react";
import SimpleLoginForm from "./tabs/SimpleLoginForm";
import OTPLoginForm from "./tabs/OTPLoginForm";
import AadhaarLoginForm from "./tabs/AadhaarLoginForm";
import styles from "./login.module.css";

type Tab = "simple" | "otp" | "aadhaar";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "simple", label: "Password", icon: "🔐" },
  { id: "otp", label: "OTP", icon: "📱" },
  { id: "aadhaar", label: "Aadhaar", icon: "🪪" },
];

export default function LoginContainer() {
  const [activeTab, setActiveTab] = useState<Tab>("simple");

  return (
    <div className={styles.wrapper}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className={styles.brandName}>AuthApp</span>
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Choose how you&apos;d like to sign in</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Login methods">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={styles.panel}
        >
          {activeTab === "simple" && <SimpleLoginForm />}
          {activeTab === "otp" && <OTPLoginForm />}
          {activeTab === "aadhaar" && <AadhaarLoginForm />}
        </div>
      </div>

      <p className={styles.footer}>
        By signing in, you agree to our{" "}
        <a href="#" className={styles.link}>Terms of Service</a>{" "}
        and{" "}
        <a href="#" className={styles.link}>Privacy Policy</a>.
      </p>
    </div>
  );
}