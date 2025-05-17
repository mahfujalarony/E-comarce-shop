import React from "react";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full  bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Left Image Part */}
        <div className="w-1/2 hidden md:block bg-blue-100">
          <img
            src="/others/log.svg" // চাইলে লগইন উপযোগী ছবি বসাতে পারো
            alt="login illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Part */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Log in to your account</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your credentials below</p>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email or Phone Number"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded">
              Log In
            </button>

            <div className="flex items-center justify-center gap-2">
              <div className="w-full h-px bg-gray-300" />
              <span className="text-sm text-gray-500">or</span>
              <div className="w-full h-px bg-gray-300" />
            </div>

            <button className="w-full flex items-center justify-center gap-2 border py-2 rounded hover:bg-gray-100">
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                alt="Google icon"
                className="w-5 h-5"
              />
              Log in with Google
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-blue-500 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
