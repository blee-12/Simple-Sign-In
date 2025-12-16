import { Link } from "react-router";
import BackButton from "./UI/BackButton";
import HomeIcon from "../assets/home.svg";
import ReloadIcon from "../assets/reload.svg";

type Props = {
  code: number;
  message: string;
};

export default function ErrorPage({ code, message }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur-md shadow-sm">
          <div className="px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-700 text-sm font-semibold">!</span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  Something went wrong
                </h1>
              </div>

              <span className="inline-flex items-center rounded-lg bg-blue-50 text-blue-700 px-3 py-1 text-sm font-mono border border-blue-200">
                {code}
              </span>
            </div>

            <p className="text-gray-600 leading-relaxed">{message}</p>

            <div className="mt-8 flex items-center gap-3">
              <BackButton />

              <Link
                to="/"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg 
                  bg-gray-100 border border-gray-200 shadow-sm 
                  hover:bg-gray-200 hover:shadow-md transition-all hover:cursor-pointer hover:scale-105"
              >
                <img src={HomeIcon} alt="Home" className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-700">Home</span>
              </Link>

              <button
                onClick={() => location.reload()}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg 
                  bg-blue-600 text-white font-medium shadow-sm 
                  hover:bg-blue-700 hover:shadow-md transition-all hover:cursor-pointer hover:scale-105"
              >
                <img src={ReloadIcon} alt="Retry" className="w-5 h-5 invert" />
                <span className="text-sm font-medium">Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
