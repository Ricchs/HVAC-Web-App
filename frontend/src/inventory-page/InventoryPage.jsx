import { useEffect, useState, useContext } from "react";
import { Package, Coins, TriangleAlert, CircleX } from "lucide-react";

import PageHeader from "../components/PageHeader";
import InventoryTab from "./InventoryTab";
import SuppliersTab from "./SuppliersTab";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";
import { formatMoney, formatPercentage } from "../utils/format";

import "../styles/metrics.css";

function InventoryPage() {
  const { addToast } = useContext(ToastContext);

  const [metrics, setMetrics] = useState({
    total_asset: 0,
    no_stock: 0,
    low_stock: 0,
    in_stock: 0,
    total: 0,
  });

  const [activeTab, setActiveTab] = useState("inventory");

  // Load metrics
  async function loadMetrics() {
    try {
      const data = await apiFetch("/api/inventory/summary");

      setMetrics(data);
    } catch (error) {
      addToast({
        message: "Couldn't load metrics",
        submessage: error.message,
        status: "error",
      });
    }
  }
  // Load metrics once
  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <PageHeader title="Inventory" />
      {/* Metrics */}
      <div className="metrics-container">
        {/* Total asset value */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-icon blue">
              <Coins />
            </div>

            <div className="metric-text">
              <p className="metric-title">Total asset value</p>
              <p className="metric-value">{formatMoney(metrics.total_asset)}</p>
            </div>
          </div>
        </div>

        {/* In stock */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-icon green">
              <Package />
            </div>

            <div className="metric-text">
              <p className="metric-title">In stock</p>
              <p className="metric-value">{metrics.in_stock}</p>
              <p className="metric-caption">
                {formatPercentage(metrics.in_stock, metrics.total)} of{" "}
                {metrics.total} products
              </p>
            </div>
          </div>
        </div>

        {/* Low stock */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-icon yellow">
              <TriangleAlert />
            </div>

            <div className="metric-text">
              <p className="metric-title">Low stock</p>
              <p className="metric-value">{metrics.low_stock}</p>
              <p className="metric-caption">
                {formatPercentage(metrics.low_stock, metrics.total)} of{" "}
                {metrics.total} products
              </p>
            </div>
          </div>
        </div>

        {/* No stock */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-icon red">
              <CircleX />
            </div>
            <div className="metric-text">
              <p className="metric-title">No stock</p>
              <p className="metric-value">{metrics.no_stock}</p>
              <p className="metric-caption">
                {formatPercentage(metrics.no_stock, metrics.total)} of{" "}
                {metrics.total} products
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}

      {activeTab === "inventory" ? (
        <InventoryTab
          onTabSwitch={() => setActiveTab("suppliers")}
          onInventoryChange={loadMetrics}
        />
      ) : (
        <SuppliersTab onTabSwitch={() => setActiveTab("inventory")} />
      )}
    </div>
  );
}

export default InventoryPage;
