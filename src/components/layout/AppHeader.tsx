import { Shield } from "lucide-react";

const AppHeader = ({ title }: { title?: string }) => {
  return (
    <header className="sticky top-0 z-40 navy-gradient px-4 py-3 text-primary-foreground">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight">
            {title || "Civic-Trust"}
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-primary-foreground/60">
            Verified Civic Reporting
          </p>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
