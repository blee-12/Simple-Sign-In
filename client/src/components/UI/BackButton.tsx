import { useNavigate } from "react-router";
import BackIcon from "../../assets/back.svg";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg 
                 bg-gray-100 border border-gray-200 shadow-sm 
                 hover:bg-gray-200 hover:shadow-md transition-all hover:cursor-pointer hover:scale-105"
    >
      <img src={BackIcon} alt="Back" className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-700">Back</span>
    </button>
  );
}
