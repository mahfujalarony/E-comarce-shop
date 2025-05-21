// import Navbar from "./Components/Navbar"
import Main from "./Components/Main/Main.tsx";
import InsertOne from "./Components/Admin/InsertOne";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./Components/About/About.tsx";
import Navbar from "./Components/Main/Navbar.tsx";
import Footer from "./Components/Main/Footer.tsx";
import Login from "./Components/auth/Login.tsx";
import Contact from "./Components/contuct/Contact.tsx";
import NotFound from "./Components/error/NotFound.tsx";
import ProductDetails from "./Components/product/ProductDetails.tsx";
import ScrollToTop from "./Components/ui/ScrollToTop.tsx";
import { AuthProvider } from "./Components/auth/AuthContext.tsx";
import Step1 from "./Components/auth/Step1.tsx";
import Step2 from "./Components/auth/Step2.tsx";
import Step3 from "./Components/auth/Step3.tsx";
import ForgotPassword from "./Components/auth/ForgotPassword.tsx";

function App() {


  return (
    <div>
      <AuthProvider>

      <BrowserRouter>
      <ScrollToTop />
      <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path='/about' element={<About />} />
          <Route path="/signup" element={<Step1 />} />
          <Route path="/step2" element={<Step2 />} />
          <Route path="/step3" element={<Step3 />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/details/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/insert" element={<InsertOne />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App
