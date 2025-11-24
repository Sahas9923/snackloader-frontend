import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FeederSettings from "./pages/FeederSetting";
import ManualFeed from "./pages/ManualFeed";
import AutomaticFeederService from './services/AutomaticFeederService';

function App() {
  return (
    <BrowserRouter>
      {/* This runs in background and handles automatic feeding */}
      <AutomaticFeederService />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element ={<Register/>} />
        <Route path="/dashboard" element ={<Dashboard/>} />
        <Route path="/feederSetting" element ={<FeederSettings/>}/>
        <Route path="/manualFeed" element ={<ManualFeed/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
