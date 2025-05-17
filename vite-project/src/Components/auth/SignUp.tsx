import React from "react";

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Left Image Part */}
        <div className="w-1/2 hidden md:block bg-blue-100">
          <img
            src="/others/log.svg" // এখানে তুমি চাইলে নিজের ছবি দিতে পারো
            alt="shopping illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Part */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create an account</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your details below</p>

          <form className="space-y-6">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded">
              Create Account
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
              Sign up with Google
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have account?{" "}
            <a href="#" className="text-blue-500 hover:underline">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
