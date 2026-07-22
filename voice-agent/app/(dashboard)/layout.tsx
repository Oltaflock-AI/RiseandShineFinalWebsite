import { CallsProvider } from "@/lib/useCalls";
import { Sidebar } from "@/components/Sidebar";

// Dashboard chrome: a sticky sidebar + scrollable main area, with one shared
// live-data provider feeding every tab.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CallsProvider>
      <div className="shell">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </CallsProvider>
  );
}
