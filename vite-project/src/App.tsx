import Navbar from "./Components/Navbar"
import InsertOne from "./Components/Admin/InsertOne";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {


  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/admin/insert" element={<InsertOne />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
