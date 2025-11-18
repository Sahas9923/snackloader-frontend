import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Registration page */}
        <Route path="/" element={<Login />} />
        <Route path="/Register" element ={<Register/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
