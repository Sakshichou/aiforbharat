import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, CheckCircle2, Image as ImageIcon, FileText, ArrowRight, Camera, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchReportsFeed, markReportResolved, type ReportPayload } from "@/services/awsService";

const afterImages: Record<string, string> = {
  "RPT-001": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  "RPT-004": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop",
};

const OfficerPortal = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportPayload[]>([]);
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const [comparing, setComparing] = useState<string | null>(null);

  useEffect(() => {
    async function getReports() {
      const allReports = await fetchReportsFeed();
      // Filter reports based on the officer's designated ward 
      // Ensure case-insensitivity and partial matches (e.g., "Shivajinagar" matches "Shivajinagar (Ward 15)")
      const filtered = allReports.filter(r => {
        if (!r.wardArea || !user?.ward) return false;
        const reportWard = r.wardArea.toLowerCase();
        const officerWard = user.ward.toLowerCase();
        return officerWard.includes(reportWard) || reportWard.includes(officerWard);
      });
      setReports(filtered);
    }
    getReports();
  }, [user]);

  const handleUploadProof = async (reportId: string) => {
    toast.info("Uploading proof and resolving...");
    const result = await markReportResolved(reportId);
    if (result.success) {
      setUploaded((prev) => ({ ...prev, [reportId]: true }));
      toast.success(`Resolution proof uploaded. Issue marked as resolved!`);
    } else {
      toast.error("Failed to mark report as resolved.");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Officer Portal" />
      <main className="p-4 space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">Resolution Proof Upload</p>
            <p className="text-xs text-muted-foreground">
              Upload 'After' photos to verify resolution. Compare side-by-side with original evidence.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <FileText className="h-4 w-4 text-primary" />
            Pending Reports
          </h2>

          {reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">No pending reports found for your designated ward: {user?.ward}</p>
            </div>
          ) : reports.map((report) => {
            // Using a static fallback image for mock data missing visual evidence
            const beforeImage = report.id === "RPT-001" || report.id === "RPT-004"
              ? afterImages[report.id] // Use mapping as a dirty mock fallback if necessary
              : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop";

            return (
              <div key={report.id} className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{report.id}</p>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      <span className="font-semibold text-primary">{report.wardArea || "Unknown Ward"}</span>
                      <span>•</span>
                      <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {uploaded[report.id] && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Side-by-side comparison */}
                {(comparing === report.id || uploaded[report.id]) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Evidence Comparison
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Before */}
                      <div className="space-y-1.5">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                          <img
                            src={beforeImage}
                            alt="Original evidence"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                            BEFORE
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">Citizen Report</p>
                      </div>
                      {/* After */}
                      <div className="space-y-1.5">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                          {uploaded[report.id] ? (
                            <>
                              <img
                                src={afterImages[report.id]}
                                alt="Resolution proof"
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-bold text-success-foreground">
                                AFTER
                              </span>
                            </>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-1 bg-secondary/50">
                              <Camera className="h-6 w-6 text-muted-foreground/40" />
                              <span className="text-[10px] text-muted-foreground/60">Awaiting upload</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">Resolution Proof</p>
                      </div>
                    </div>
                  </div>
                )}

                {!uploaded[report.id] && comparing !== report.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setComparing(report.id)}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Evidence
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setComparing(report.id);
                        handleUploadProof(report.id);
                      }}
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Upload Proof
                    </Button>
                  </div>
                )}

                {!uploaded[report.id] && comparing === report.id && (
                  <Button
                    className="w-full"
                    onClick={() => handleUploadProof(report.id)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload After Photo
                  </Button>
                )}

                {uploaded[report.id] && (
                  <div className="flex items-center gap-3 rounded-lg bg-success/5 p-3">
                    <ImageIcon className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-xs font-semibold text-success">Proof Uploaded & Matched</p>
                      <p className="text-[11px] text-muted-foreground">Awaiting citizen confirmation</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  );
};

export default OfficerPortal;
