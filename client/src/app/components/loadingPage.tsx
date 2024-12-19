import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <main className="w-full h-full flex items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
    </main>
  );
}
