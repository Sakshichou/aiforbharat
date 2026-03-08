import { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertTriangle, MapPin, ThumbsUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PhotoCapture, { GeoLocation } from "@/components/report/PhotoCapture";
import { confirmReport, uploadToS3, type ReportPayload } from "@/services/awsService";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning",
    icon: AlertTriangle,
  },
  "in-review": {
    label: "In Review",
    className: "bg-primary/10 text-primary",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    className: "bg-success/15 text-success",
    icon: CheckCircle2,
  },
};

const IntegrityFeed = ({ reports: initialReports }: { reports: ReportPayload[] }) => {
  const { role } = useAuth();
  const [reports, setReports] = useState<ReportPayload[]>(initialReports);
  const [confirmingReportId, setConfirmingReportId] = useState<string | null>(null);

  // Initialize data and synchronize state when initialReports changes
  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  const handleConfirmReport = async (blob: Blob, location: GeoLocation) => {
    if (!confirmingReportId) return;

    // Simulate upload and confirmation
    const key = `confirmations/photo-${Date.now()}.jpg`;
    const uploadResult = await uploadToS3(blob, key);

    if (uploadResult.success) {
      const confirmResult = await confirmReport(confirmingReportId, blob, location);

      if (confirmResult.success) {
        toast.success("Evidence submitted and report confirmed!");

        // Optimistically update the local report confirmations count
        setReports(prev => prev.map(report => {
          if (report.id === confirmingReportId) {
            return {
              ...report,
              confirmations: (report.confirmations || 0) + 1
            };
          }
          return report;
        }));
        setConfirmingReportId(null);
      }
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        Global Integrity Feed
      </h2>
      <div className="space-y-2">
        {reports.map((report) => {
          const status = statusConfig[report.status];
          const StatusIcon = status.icon;
          const timeAgo = getTimeAgo(report.timestamp);

          return (
            <div
              key={report.id}
              className="glass-card rounded-xl p-3 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{report.id}</span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{report.confirmations || 0} confirmations</span>
                </div>
                {role !== "official" && (
                  <button
                    onClick={() => setConfirmingReportId(report.id)}
                    disabled={report.status === "resolved"}
                    className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                  >
                    Confirm Issue
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!confirmingReportId} onOpenChange={(open) => !open && setConfirmingReportId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Report</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-4 text-xs text-muted-foreground">
              Please submit a live geotagged photo to confirm that this issue exists at the reported location.
            </p>
            <PhotoCapture onCapture={handleConfirmReport} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default IntegrityFeed;
