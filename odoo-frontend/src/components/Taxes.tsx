import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { getTaxes, createTax, updateTax, deleteTax, calculateTax } from '../services/api.ts';
import { Tax, TaxCalculation } from '../types';

interface TaxFormData {
  name: string;
  rate: number;
  type: 'sale' | 'purchase' | 'both';
  active: boolean;
  description: string;
}

const Taxes: React.FC = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState<TaxFormData>({
    name: '',
    rate: 0,
    type: 'sale',
    active: true,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 세금 계산기 상태
  const [calculatorData, setCalculatorData] = useState({
    supplyAmount: '',
    taxRate: 10,
  });
  const [calculationResult, setCalculationResult] = useState<TaxCalculation | null>(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const response = await getTaxes();
      if (response.success) {
        setTaxes(response.data || []);
      } else {
        setErrorMessage(response.message || '세금 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('세금 조회 실패:', error);
      setErrorMessage('세금 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rate: 0,
      type: 'sale',
      active: true,
      description: '',
    });
    setEditingTax(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleOpenModal = (tax?: Tax) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        name: tax.name,
        rate: tax.rate,
        type: tax.type,
        active: tax.active,
        description: tax.description || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrorMessage('세금명은 필수입니다.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingTax) {
        const response = await updateTax(editingTax.id, formData);
        if (response.success) {
          setSuccessMessage('세금이 성공적으로 수정되었습니다.');
          await fetchTaxes();
          handleCloseModal();
        } else {
          setErrorMessage(response.message || '세금 수정에 실패했습니다.');
        }
      } else {
        const response = await createTax(formData);
        if (response.success) {
          setSuccessMessage('세금이 성공적으로 생성되었습니다.');
          await fetchTaxes();
          handleCloseModal();
        } else {
          setErrorMessage(response.message || '세금 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('세금 저장 실패:', error);
      setErrorMessage('세금 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taxId: number) => {
    if (window.confirm('정말로 이 세금을 삭제하시겠습니까?')) {
      try {
        const response = await deleteTax(taxId);
        if (response.success) {
          setSuccessMessage('세금이 성공적으로 삭제되었습니다.');
          await fetchTaxes();
          
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } else {
          setErrorMessage(response.message || '세금 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('세금 삭제 실패:', error);
        setErrorMessage('세금 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCalculateTax = async () => {
    if (!calculatorData.supplyAmount || Number(calculatorData.supplyAmount) <= 0) {
      setErrorMessage('공급가액을 입력해주세요.');
      return;
    }

    try {
      const response = await calculateTax(Number(calculatorData.supplyAmount), calculatorData.taxRate);
      if (response.success && response.data) {
        setCalculationResult(response.data);
      } else {
        setErrorMessage(response.message || '세금 계산에 실패했습니다.');
      }
    } catch (error) {
      console.error('세금 계산 실패:', error);
      setErrorMessage('세금 계산 중 오류가 발생했습니다.');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '매출';
      case 'purchase': return '매입';
      case 'both': return '매출/매입';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-blue-100 text-blue-800';
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링된 세금 목록 계산
  const filteredTaxes = taxes.filter(tax => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'active' && tax.active) || 
      (activeFilter === 'inactive' && !tax.active);
    
    const matchesSearch = !searchTerm || 
      tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tax.code && tax.code.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 성공/에러 메시지 */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">세금 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            세금 정보를 관리하고 세금 계산을 수행하세요.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCalculator(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <CalculatorIcon className="h-4 w-4 mr-2" />
            세금 계산기
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            세금 작성
          </button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">상태:</label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">검색:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="세금명 또는 코드 검색"
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* 세금 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                세금명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                세율
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTaxes.map((tax) => (
              <tr key={tax.id} className={!tax.active ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${!tax.active ? 'text-gray-500' : 'text-gray-900'}`}>
                    {tax.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {tax.code || '자동생성'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tax.rate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(tax.type)}`}>
                    {getTypeLabel(tax.type)}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tax.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tax.active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(tax)}
                      className="text-gray-400 hover:text-gray-500"
                      title="수정"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tax.id)}
                      className="text-red-400 hover:text-red-500"
                      title="삭제"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 세금 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTax ? '세금 수정' : '세금 작성'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    세금명 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={submitting}
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    세율 (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    세금 유형 *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={submitting}
                  >
                    <option value="sale">매출</option>
                    <option value="purchase">매입</option>
                    <option value="both">매출/매입</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={submitting}
                  />
                </div>



                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    활성 상태
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    disabled={submitting}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {submitting ? '저장 중...' : (editingTax ? '수정' : '생성')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 세금 계산기 모달 */}
      {showCalculator && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">세금 계산기</h3>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    공급가액 *
                  </label>
                  <input
                    type="number"
                    value={calculatorData.supplyAmount}
                    onChange={(e) => setCalculatorData({ ...calculatorData, supplyAmount: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="공급가액을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    세율 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={calculatorData.taxRate}
                    onChange={(e) => setCalculatorData({ ...calculatorData, taxRate: Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <button
                  onClick={handleCalculateTax}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  계산하기
                </button>

                {calculationResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">계산 결과</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>공급가액:</span>
                        <span className="font-medium">{formatCurrency(calculationResult.supply_amount)}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>세율:</span>
                        <span className="font-medium">{calculationResult.tax_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>세액:</span>
                        <span className="font-medium">{formatCurrency(calculationResult.tax_amount)}원</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">합계:</span>
                        <span className="font-medium text-lg">{formatCurrency(calculationResult.total_amount)}원</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Taxes; 