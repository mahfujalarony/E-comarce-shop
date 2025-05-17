// import Navbar from "./Components/Navbar"
import Main from "./Components/Main/Main.tsx";
import InsertOne from "./Components/Admin/InsertOne";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./Components/About/About.tsx";
import Navbar from "./Components/Main/Navbar.tsx";
import Footer from "./Components/Main/Footer.tsx";
import SignUp from "./Components/auth/SignUp.tsx";
import Login from "./Components/auth/Login.tsx";
import Contact from "./Components/contuct/Contact.tsx";
import NotFound from "./Components/error/NotFound.tsx";
import ProductDetails from "./Components/product/ProductDetails.tsx";

function App() {


  return (
    <div>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path='/about' element={<About />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
          <Route path="details" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/insert" element={<InsertOne />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
