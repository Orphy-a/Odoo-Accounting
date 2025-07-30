import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { checkHealth } from './services/api.ts';

// 컴포넌트들
import Dashboard from './components/Dashboard.tsx';
import Accounts from './components/Accounts.tsx';
import JournalEntries from './components/JournalEntries.tsx';
import Partners from './components/Partners.tsx';
import Assets from './components/Assets.tsx';
import Taxes from './components/Taxes.tsx';
import TaxReports from './components/TaxReports.tsx';


function App() {
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await checkHealth();
        setHealthStatus(response.success);
      } catch (error) {
        setHealthStatus(false);
      } finally {
        setLoading(false);
      }
    };

    checkApiHealth();
  }, []);

  const navigation = [
    { name: '대시보드', href: '/', icon: HomeIcon },
    { name: '계정과목', href: '/accounts', icon: ChartBarIcon },
    { name: '거래처', href: '/partners', icon: UserGroupIcon },
    { name: '분개장', href: '/journal-entries', icon: DocumentTextIcon },
    { name: '고정자산', href: '/assets', icon: BuildingOfficeIcon },
    { name: '세금 관리', href: '/taxes', icon: CalculatorIcon },
    { name: '세금 신고서', href: '/tax-reports', icon: DocumentChartBarIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">Odoo Accounting</h1>
                </div>
                <div className="ml-4 flex items-center">
                  {healthStatus !== null && (
                    <div className="flex items-center">
                      {healthStatus ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`ml-2 text-sm ${healthStatus ? 'text-green-600' : 'text-red-600'}`}>
                        {healthStatus ? 'API 연결됨' : 'API 연결 실패'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <CogIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* 사이드바 */}
          <nav className="w-64 bg-white shadow-sm">
            <div className="h-full px-3 py-4 overflow-y-auto">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100 group"
                    >
                      <item.icon className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/journal-entries" element={<JournalEntries />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/taxes" element={<Taxes />} />
              <Route path="/tax-reports" element={<TaxReports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App; 