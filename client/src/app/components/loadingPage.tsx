import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}