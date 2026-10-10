import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ToastProvider from "./notifications/ToastProvider";
import ToastContainer from "./notifications/ToastContainer";
import CustomersPage from "./customer-page/CustomersPage";
import InventoryPage from "./inventory-page/InventoryPage";
import "./App.css";
import "./styles/buttons.css";

function App() {
  return (
    <ToastProvider>
      <div className="app">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/app/customers" element={<CustomersPage />} />
            <Route path="/app/inventory" element={<InventoryPage />} />
          </Routes>
        </main>

        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

export default App;
