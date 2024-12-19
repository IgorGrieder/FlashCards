import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-gray-700">Carregando...</span>
      </div>
    </div>
  );
}
