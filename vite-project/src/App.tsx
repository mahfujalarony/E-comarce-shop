// App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './Components/auth/AuthContext.tsx';
import { SocketProvider, useSocket } from './Components/socket/SocketContext.tsx'; // নতুন কনটেক্সট
import Navbar from './Components/Main/Navbar.tsx';
import Footer from './Components/Main/Footer.tsx';
import ScrollToTop from './Components/ui/ScrollToTop.tsx';
import Main from './Components/Main/Main.tsx';
import About from './Components/About/About.tsx';
import Contact from './Components/contuct/Contact.tsx';
import Login from './Components/auth/Login.tsx';
import Step1 from './Components/auth/Step1.tsx';
import Step2 from './Components/auth/Step2.tsx';
import Step3 from './Components/auth/Step3.tsx';
import ForgotPassword from './Components/auth/ForgotPassword.tsx';
import NotFound from './Components/error/NotFound.tsx';
import InsertOne from './Components/Admin/InsertOne.tsx';
import ManageAccount from './Components/AccountDropdown/ManageAccount.tsx';
import MyOrders from './Components/AccountDropdown/MyOrders.tsx';
import MyReviews from './Components/AccountDropdown/MyReviws.tsx';
import OrderReturn from './Components/AccountDropdown/OrderReturn.tsx';
import Payment from './Components/AccountDropdown/Pyment.tsx';
import Refer from './Components/AccountDropdown/Refer.tsx';
import WishList from './Components/AccountDropdown/WishList.tsx';
import HelpCenter from './Components/AccountDropdown/HelpCenter.tsx';
import CardPayment from './Components/AccountDropdown/PaymentMethod.tsx';
import AddressForm from './Components/AccountDropdown/AddressForm.tsx';
import ProductDetails from './Components/product/ProductDetails.tsx';
import ReviewComponent from './Components/product/ReviewComponent.tsx';
import Messages from './Components/Main/Message.tsx';
import UnreadMessageNotification from './Components/ui/MessageNotification.tsx';
import socket from './socket.ts';
import { useEffect } from 'react';

function AppWrapper() {
  const location = useLocation();
  const { authData } = useAuth();
  const { onlineUsers } = useSocket();
  const senderId = authData?.userId;
  console.log('senderId', senderId);

  useEffect(() => {
    if (senderId) {
      //socket.io.opts.query.userId = senderId;
      socket.disconnect().connect(); // Reconnect with updated userId
      socket.emit('userOnline', senderId); // Emit userOnline
    }

    return () => {
      if (senderId) {
        socket.emit('userOffline', senderId); // Emit userOffline
      }
    };
  }, [senderId]);

  const hideFooterRoutes = ['/message'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <Navbar onlineUsersCount={onlineUsers.length} /> {/* onlineUsers পাঠানো */}
      <UnreadMessageNotification />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Step1 />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/step3" element={<Step3 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/insert" element={<InsertOne />} />
        <Route path="/account" element={<ManageAccount />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<WishList />} />
        <Route path="/payment-methods/:id" element={<Payment />} />
        <Route path="/returns" element={<OrderReturn />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/support" element={<HelpCenter />} />
        <Route path="/reviews" element={<MyReviews />} />
        <Route path="/details/:id" element={<ProductDetails />} />
        <Route path="/details/payment/:id" element={<CardPayment />} />
        <Route path="/details/payment/address" element={<AddressForm />} />
        <Route path="/review" element={<ReviewComponent />} />
        <Route path="/message" element={<Messages />} />
      </Routes>
      {!shouldHideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider> 
        <BrowserRouter>
          <AppWrapper />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;


// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { AuthProvider } from "./Components/auth/AuthContext.tsx";
// import Navbar from "./Components/Main/Navbar.tsx";
// import Footer from "./Components/Main/Footer.tsx";
// import ScrollToTop from "./Components/ui/ScrollToTop.tsx";
// import Main from "./Components/Main/Main.tsx";
// import About from "./Components/About/About.tsx";
// import Contact from "./Components/contuct/Contact.tsx";
// import Login from "./Components/auth/Login.tsx";
// import Step1 from "./Components/auth/Step1.tsx";
// import Step2 from "./Components/auth/Step2.tsx";
// import Step3 from "./Components/auth/Step3.tsx";
// import ForgotPassword from "./Components/auth/ForgotPassword.tsx";
// import NotFound from "./Components/error/NotFound.tsx";
// import InsertOne from "./Components/Admin/InsertOne.tsx";
// import ManageAccount from "./Components/AccountDropdown/ManageAccount.tsx";
// import MyOrders from "./Components/AccountDropdown/MyOrders.tsx";
// import MyReviws from "./Components/AccountDropdown/MyReviws.tsx";
// import OrderReturn from "./Components/AccountDropdown/OrderReturn.tsx";
// import Pyment from "./Components/AccountDropdown/Pyment.tsx";
// import Refer from "./Components/AccountDropdown/Refer.tsx";
// import WishList from "./Components/AccountDropdown/WishList.tsx";
// import HelpCenter from "./Components/AccountDropdown/HelpCenter.tsx";
// import CardPayment from "./Components/AccountDropdown/PaymentMethod.tsx";
// import AddressForm from "./Components/AccountDropdown/AddressForm.tsx";
// import ProductDetails from "./Components/product/ProductDetails.tsx";
// import ReviewComponent from "./Components/product/ReviewComponent.tsx";
// import Messages from "./Components/Main/Message.tsx";

// // নতুন একটা কম্পোনেন্ট AppWrapper বানাও
// function AppWrapper() {
//   const location = useLocation();

//   const hideFooterRoutes = ["/message"];

//   const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

//   return (
//     <>
//       <ScrollToTop />
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Main />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/signup" element={<Step1 />} />
//         <Route path="/step2" element={<Step2 />} />
//         <Route path="/step3" element={<Step3 />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/forgotpassword" element={<ForgotPassword />} />
//         <Route path="*" element={<NotFound />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/admin/insert" element={<InsertOne />} />
//         <Route path="/account" element={<ManageAccount />} />
//         <Route path="/orders" element={<MyOrders />} />
//         <Route path="/wishlist" element={<WishList />} />
//         <Route path="/payment-methods/:id" element={<Pyment />} />
//         <Route path="/returns" element={<OrderReturn />} />
//         <Route path="/refer" element={<Refer />} />
//         <Route path="/support" element={<HelpCenter />} />
//         <Route path="/reviews" element={<MyReviws />} />
//         <Route path="/details/:id" element={<ProductDetails />} />
//         <Route path="/details/payment/:id" element={<CardPayment />} />
//         <Route path="/details/payment/address" element={<AddressForm />} />
//         <Route path="/review" element={<ReviewComponent />} />
//         <Route path="/message" element={<Messages />} />
//       </Routes>
//       {!shouldHideFooter && <Footer />}
//     </>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppWrapper />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;
