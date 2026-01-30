import Spinner from "./Spinner";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] gap-4">
      <Spinner size="lg" className="text-teal-400" />
      <p className="text-slate-300 text-lg">{message}</p>
    </div>
  );
}
