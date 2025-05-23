import Main from "./Components/Main/Main.tsx";
import InsertOne from "./Components/Admin/InsertOne.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./Components/About/About.tsx";
import Navbar from "./Components/Main/Navbar.tsx"; // Removed duplicate import
import Footer from "./Components/Main/Footer.tsx";
import Login from "./Components/auth/Login.tsx";
import Contact from "./Components/contuct/Contact.tsx"; // Kept typo as is
import NotFound from "./Components/error/NotFound.tsx";
import ProductDetails from "./Components/product/ProductDetails.tsx";
import ScrollToTop from "./Components/ui/ScrollToTop.tsx";
import { AuthProvider } from "./Components/auth/AuthContext.tsx";
import Step1 from "./Components/auth/Step1.tsx";
import Step2 from "./Components/auth/Step2.tsx";
import Step3 from "./Components/auth/Step3.tsx";
import ForgotPassword from "./Components/auth/ForgotPassword.tsx";
import ManageAccount from "./Components/AccountDropdown/ManageAccount.tsx";
import MyOrders from "./Components/AccountDropdown/MyOrders.tsx";
import MyReviws from "./Components/AccountDropdown/MyReviws.tsx"; // Kept typo as is
import OrderReturn from "./Components/AccountDropdown/OrderReturn.tsx";
import Pyment from "./Components/AccountDropdown/Pyment.tsx"; // Fixed syntax, kept typo
import Refer from "./Components/AccountDropdown/Refer.tsx";
import WishList from "./Components/AccountDropdown/WishList.tsx";
import HelpCenter from "./Components/AccountDropdown/HelpCenter.tsx"; // Added missing import

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Step1 />} />
          <Route path="/step2" element={<Step2 />} />
          <Route path="/step3" element={<Step3 />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/details/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/insert" element={<InsertOne />} />
          {/* Dropdown Routes */}
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/payment-methods/:id" element={<Pyment />} />
          <Route path="/returns" element={<OrderReturn />} />
          <Route path="/refer" element={<Refer />} />
          <Route path="/support" element={<HelpCenter />} />
          <Route path="/reviews" element={<MyReviws />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;