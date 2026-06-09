import { useNavigate } from "react-router-dom";

export default function Logo({ light = false }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`dl-logo ${light ? "dl-logo-light" : ""}`}
      onClick={() => navigate("/")}
      aria-label="Go to DocuLyft home"
    >
      <img src="/logo.png" alt="DocuLyft" className="dl-logo-img" />
      <span className="dl-logo-text">DocuLyft</span>
    </button>
  );
}