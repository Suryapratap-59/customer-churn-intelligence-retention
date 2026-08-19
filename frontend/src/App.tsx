import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { RiskQueue } from './pages/RiskQueue';
import { CustomerProfile } from './pages/CustomerProfile';
import { PredictCustomer } from './pages/PredictCustomer';
import { ChurnAnalytics } from './pages/ChurnAnalytics';
import { ModelPerformance } from './pages/ModelPerformance';
import { ExplainabilityHub } from './pages/ExplainabilityHub';
import { BatchScoring } from './pages/BatchScoring';
import { DataQuality } from './pages/DataQuality';
import { ModelManagement } from './pages/ModelManagement';
import { Settings } from './pages/Settings';

import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('executive-dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [activeModelName, setActiveModelName] = useState<string>('Random Forest');
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  useEffect(() => {
    fetchHealthAndModelInfo();
  }, []);

  const fetchHealthAndModelInfo = async () => {
    try {
      const h = await api.getHealth();
      if (h.active_model) {
        setActiveModelName(h.active_model);
      }
    } catch (err) {
      console.warn('Backend server not connected yet:', err);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await api.retrainModel();
      if (res.details?.best_model) {
        setActiveModelName(res.details.best_model);
      }
      alert(`Retraining pipeline completed cleanly! Selected active model: ${res.details?.best_model}`);
    } catch (err: any) {
      alert(`Retraining error: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'executive-dashboard': return 'Executive Dashboard';
      case 'risk-queue': return 'Customer Risk Prioritization Queue';
      case 'customer-profiles': return `Customer Intelligence Profile (CUST-${selectedCustomerId})`;
      case 'predict-customer': return 'Single Customer Churn Evaluator';
      case 'churn-analytics': return 'Exploratory Churn Behavior Analytics';
      case 'model-performance': return 'Machine Learning Performance Hub';
      case 'explainability': return 'Model Explainability & Risk Attribution';
      case 'batch-scoring': return 'Bulk CSV Batch Scoring Workbench';
      case 'data-quality': return 'Data Quality & Ingestion Audit';
      case 'model-management': return 'Model Registry & Lifecycle';
      case 'settings': return 'Risk Engine Configuration & Outcome Audit';
      default: return 'Customer Churn Intelligence';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={getPageTitle()}
          activeModelName={activeModelName}
          onRetrain={handleRetrain}
          isRetraining={isRetraining}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'executive-dashboard' && (
            <ExecutiveDashboard 
              onNavigate={(tab, custId) => {
                if (custId) setSelectedCustomerId(custId);
                setActiveTab(tab);
              }} 
            />
          )}

          {activeTab === 'risk-queue' && (
            <RiskQueue 
              onSelectCustomer={(custId) => {
                setSelectedCustomerId(custId);
                setActiveTab('customer-profiles');
              }} 
            />
          )}

          {activeTab === 'customer-profiles' && (
            <CustomerProfile 
              customerId={selectedCustomerId}
              onBack={() => setActiveTab('risk-queue')}
            />
          )}

          {activeTab === 'predict-customer' && <PredictCustomer />}

          {activeTab === 'churn-analytics' && <ChurnAnalytics />}

          {activeTab === 'model-performance' && <ModelPerformance />}

          {activeTab === 'explainability' && <ExplainabilityHub />}

          {activeTab === 'batch-scoring' && <BatchScoring />}

          {activeTab === 'data-quality' && <DataQuality />}

          {activeTab === 'model-management' && <ModelManagement />}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default App;
