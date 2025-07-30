import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { 
  getAccounts, 
  getJournalEntries, 
  getPartners, 
  getAssets, 
  getBudgets 
} from '../services/api.ts';

interface DashboardStats {
  accounts: number;
  journalEntries: number;
  partners: number;
  assets: number;
  budgets: number;
  totalAssets: number;
  totalLiabilities: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    accounts: 0,
    journalEntries: 0,
    partners: 0,
    assets: 0,
    budgets: 0,
    totalAssets: 0,
    totalLiabilities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accountsRes, journalRes, partnersRes, assetsRes, budgetsRes] = await Promise.all([
          getAccounts(),
          getJournalEntries(),
          getPartners(),
          getAssets(),
          getBudgets(),
        ]);

        const accounts = accountsRes.data || [];
        const totalAssets = accounts
          .filter(acc => acc.type === 'asset')
          .reduce((sum, acc) => sum + (acc.id || 0), 0);
        const totalLiabilities = accounts
          .filter(acc => acc.type === 'liability')
          .reduce((sum, acc) => sum + (acc.id || 0), 0);

        setStats({
          accounts: accounts.length,
          journalEntries: (journalRes.data || []).length,
          partners: (partnersRes.data || []).length,
          assets: (assetsRes.data || []).length,
          budgets: (budgetsRes.data || []).length,
          totalAssets,
          totalLiabilities,
        });
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: '계정과목',
      value: stats.accounts,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: '분개장',
      value: stats.journalEntries,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: '거래처',
      value: stats.partners,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: '고정자산',
      value: stats.assets,
      icon: BuildingOfficeIcon,
      color: 'bg-yellow-500',
      change: '+3%',
      changeType: 'increase',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          회계 시스템의 주요 지표와 현황을 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`h-6 w-6 text-white ${item.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center">
                  {item.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`ml-2 text-sm font-medium ${
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">지난 달 대비</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 재무 요약 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            재무 요약
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">총 자산</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₩{stats.totalAssets.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">총 부채</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₩{stats.totalLiabilities.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            최근 활동
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <DocumentTextIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            새로운 분개장이 생성되었습니다.
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime="2024-01-01">1시간 전</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <UserGroupIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            새로운 거래처가 등록되었습니다.
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime="2024-01-01">2시간 전</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            고정자산 정보가 업데이트되었습니다.
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime="2024-01-01">3시간 전</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 