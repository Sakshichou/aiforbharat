import { FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import type { ReportPayload } from "@/services/awsService";

const CivicReceipts = ({ reports }: { reports: ReportPayload[] }) => {
  const myReports = reports.slice(0, 3);
  const resolved = myReports.filter((r) => r.status === "resolved").length;
  const pending = myReports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <FileText className="h-4 w-4 text-primary" />
        My Civic Receipts
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={FileText} label="Total" value={myReports.length} className="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle2} label="Resolved" value={resolved} className="bg-success/15 text-success" />
        <StatCard icon={AlertTriangle} label="Pending" value={pending} className="bg-warning/15 text-warning" />
      </div>

      <div className="space-y-2">
        {myReports.map((report) => (
          <div key={report.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            {report.status === "resolved" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : report.status === "pending" ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            ) : (
              <Clock className="h-4 w-4 shrink-0 text-primary" />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{report.description}</p>
              <p className="text-xs text-muted-foreground">{report.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  className: string;
}) => (
  <div className="glass-card flex flex-col items-center gap-1 rounded-xl p-3">
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${className}`}>
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-lg font-bold text-foreground">{value}</span>
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </div>
);

export default CivicReceipts;
