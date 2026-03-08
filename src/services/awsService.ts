// Mock AWS Service — Replace with actual AWS SDK calls (Lambda, S3, etc.)

export interface ReportPayload {
  id: string;
  videoBlob?: Blob;
  audioBlob?: Blob;
  wardArea?: string;
  description: string;
  location: { lat: number; lng: number };
  language: string;
  timestamp: number;
  status: "pending" | "in-review" | "resolved";
  confirmations?: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

let mockReports: ReportPayload[] = [
  {
    id: "RPT-001",
    wardArea: "Shivajinagar (Ward 15)",
    description: "Broken streetlight on 5th Avenue causing safety concerns at night",
    location: { lat: 18.52, lng: 73.856 },
    language: "en",
    timestamp: Date.now() - 3600000,
    status: "pending",
    confirmations: 12,
  },
  {
    id: "RPT-002",
    wardArea: "Kothrud (Ward 9)",
    description: "Overflowing drainage near Ward 12 community center",
    location: { lat: 18.535, lng: 73.875 },
    language: "en",
    timestamp: Date.now() - 7200000,
    status: "in-review",
    confirmations: 45,
  },
  {
    id: "RPT-003",
    wardArea: "Shivajinagar (Ward 15)",
    description: "Illegal garbage dump spotted behind municipal school",
    location: { lat: 18.505, lng: 73.84 },
    language: "en",
    timestamp: Date.now() - 86400000,
    status: "resolved",
    confirmations: 89,
  },
  {
    id: "RPT-004",
    wardArea: "Shivajinagar",
    description: "Road cave-in near Shivaji Nagar junction after heavy rain",
    location: { lat: 18.53, lng: 73.845 },
    language: "en",
    timestamp: Date.now() - 172800000,
    status: "pending",
    confirmations: 2,
  },
  {
    id: "RPT-005",
    wardArea: "Kothrud",
    description: "Water pipeline leak flooding residential area in Sector 7",
    location: { lat: 18.545, lng: 73.87 },
    language: "en",
    timestamp: Date.now() - 43200000,
    status: "resolved",
    confirmations: 34,
  },
];

// Simulates S3 upload (Keeping mock active for file storage since S3 bucket isn't physically wired up)
export async function uploadToS3(file: Blob, key: string): Promise<UploadResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeUrl = `https://civic-trust-bucket.s3.amazonaws.com/${key}`;
      console.log(`[Mock S3] Uploaded ${key} (${file.size} bytes)`);
      resolve({ success: true, url: fakeUrl });
    }, 800);
  });
}

// Submits report to the in-memory store
export async function submitReport(payload: ReportPayload): Promise<{ success: boolean; reportId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReport: ReportPayload = {
        ...payload,
        id: `RPT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: "pending",
        confirmations: 0,
        timestamp: Date.now(),
      };

      mockReports = [newReport, ...mockReports];
      console.log(`[Mock Lambda] Report submitted: ${newReport.id}`);
      resolve({ success: true, reportId: newReport.id });
    }, 600);
  });
}

// Confirms report via in-memory store
export async function confirmReport(reportId: string, evidenceBlob: Blob, location: { lat: number, lng: number }): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockReports = mockReports.map(r =>
        r.id === reportId ? { ...r, confirmations: (r.confirmations || 0) + 1 } : r
      );
      console.log(`[Mock Lambda] Report ${reportId} confirmed at [${location.lat}, ${location.lng}]`);
      resolve({ success: true });
    }, 600);
  });
}

// Marks a report as resolved by an official
export async function markReportResolved(reportId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockReports = mockReports.map(r =>
        r.id === reportId ? { ...r, status: "resolved" } : r
      );
      console.log(`[Mock Lambda] Report ${reportId} marked as resolved`);
      resolve({ success: true });
    }, 500);
  });
}

// Fetches all reports feed from in-memory store
export async function fetchReportsFeed(): Promise<ReportPayload[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockReports]); // Return a copy of the in-memory array
    }, 400);
  });
}

// Simulates transcription (voice-to-text)
export async function transcribeAudio(audioBlob: Blob, language: string): Promise<string> {
  const transcriptions: Record<string, string> = {
    en: "There is a large pothole on MG Road near the bus stop causing accidents.",
    hi: "एमजी रोड पर बस स्टॉप के पास एक बड़ा गड्ढा है जिससे दुर्घटनाएं हो रही हैं।",
    mr: "एमजी रोडवर बस स्टॉपजवळ एक मोठा खड्डा आहे ज्यामुळे अपघात होत आहेत.",
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(transcriptions[language] || transcriptions.en);
    }, 1200);
  });
}


