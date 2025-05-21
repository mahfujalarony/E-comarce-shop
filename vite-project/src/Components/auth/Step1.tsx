import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Step1: React.FC = () => {
  const { authData, setAuthData } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!authData.name || !authData.email || !authData.password) {
      setError("Please fill out all fields.");
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(authData.email)) {
      setError("Please enter a valid email.");
      setIsLoading(false);
      return;
    }

    if (authData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      // await API call if needed
      navigate("/step2");
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Step 1: Basic Info</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          autoFocus
          type="text"
          placeholder="Name"
          value={authData.name}
          onChange={(e) =>
            setAuthData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={authData.email}
          onChange={(e) =>
            setAuthData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={authData.password}
          onChange={(e) =>
            setAuthData((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Loading..." : "Next"}
        </button>
      </form>
    </div>
  );
};

export default Step1;