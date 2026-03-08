import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import IntegrityFeed from "@/components/dashboard/IntegrityFeed";
import CivicReceipts from "@/components/dashboard/CivicReceipts";
import ReportMap from "@/components/dashboard/ReportMap";
import { fetchReportsFeed, type ReportPayload } from "@/services/awsService";
import { Loader2, List, Map } from "lucide-react";

const Dashboard = () => {
  const [reports, setReports] = useState<ReportPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"feed" | "map">("feed");

  useEffect(() => {
    fetchReportsFeed().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <AppHeader />
      <main className="space-y-6 p-4">
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <CivicReceipts reports={reports} />

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Community Reports</h2>
              <div className="flex rounded-lg bg-secondary p-1">
                <button
                  onClick={() => setView("feed")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${view === "feed"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Feed
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${view === "map"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Map className="h-3.5 w-3.5" />
                  Map
                </button>
              </div>
            </div>

            {view === "feed" ? (
              <IntegrityFeed reports={reports} />
            ) : (
              <ReportMap reports={reports} isVisible={view === "map"} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
