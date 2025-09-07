import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700">
      <LoaderIcon className="text-white animate-spin size-10" />
    </div>
  );
};
export default PageLoader;
