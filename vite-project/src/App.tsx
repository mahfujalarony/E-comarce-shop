// import Navbar from "./Components/Navbar"
import Main from "./Components/Main";
import InsertOne from "./Components/Admin/InsertOne";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {


  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/admin/insert" element={<InsertOne />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
