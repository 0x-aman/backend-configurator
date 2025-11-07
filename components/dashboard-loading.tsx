import Image from "next/image";

export function DashboardLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-[312px]">
          <Image
            src="/logo.png"
            alt="Logo"
            className="object-contain"
            fill
            priority
          />
        </div>

        {/* Loader bar */}
        <div className="relative w-52 h-[3px] overflow-hidden rounded-full bg-foreground/10">
          <div className="absolute h-full w-1/3 bg-foreground/40 animate-loader" />
        </div>
      </div>
    </div>
  );
}
