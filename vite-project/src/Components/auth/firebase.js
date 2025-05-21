import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const handleGoogleSignUp = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Google user:", result.user);
      // ব্যাকএন্ডে টোকেন পাঠান
    })
    .catch((error) => {
      setError("Google সাইন-আপ ব্যর্থ!");
    });
};