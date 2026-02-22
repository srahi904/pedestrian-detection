import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { LiveMonitor } from "./pages/LiveMonitor";
import { Analytics } from "./pages/Analytics";
import { Documentation } from "./pages/Documentation";
import { DetectionEngine } from "./pages/DetectionEngine";
import { Settings } from "./pages/Settings";
import { AlertsPage } from "./pages/AlertsPage";
import { SystemLogs } from "./pages/SystemLogs";

export type Page = "dashboard" | "live" | "detection" | "analytics" | "alerts" | "documentation" | "settings" | "logs";

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "live":
        return <LiveMonitor />;
      case "detection":
        return <DetectionEngine />;
      case "analytics":
        return <Analytics />;
      case "alerts":
        return <AlertsPage />;
      case "documentation":
        return <Documentation />;
      case "settings":
        return <Settings />;
      case "logs":
        return <SystemLogs />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}
