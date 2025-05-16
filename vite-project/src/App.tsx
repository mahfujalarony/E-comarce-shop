// import Navbar from "./Components/Navbar"
import Main from "./Components/Main/Main.tsx";
import InsertOne from "./Components/Admin/InsertOne";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./Components/About/About.tsx";
import Navbar from "./Components/Main/Navbar.tsx";
import Footer from "./Components/Main/Footer.tsx"

function App() {


  return (
    <div>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path='/about' element={<About />} />
          <Route path="/admin/insert" element={<InsertOne />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
