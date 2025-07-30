import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getTaxReports, createTaxReport, updateTaxReport, deleteTaxReport, generateTaxReportData, getTaxes } from '../services/api.ts';
import { TaxReport, Tax } from '../types';

interface TaxReportFormData {
  name: string;
  report_type: 'monthly' | 'quarterly' | 'yearly' | 'half_yearly';
  additional_period?: string; // 분기별/연간/반기별 추가 선택
  year?: string; // 연도 선택 (분기별/반기별/연간용)
  tax_ids: number[]; // 선택된 세금 ID들
  selected_taxes?: string[]; // 선택된 세금명들
  vat_payable?: number; // 납부세액
  start_date?: string; // 시작일
  end_date?: string; // 종료일
}

const TaxReports: React.FC = () => {
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [editingReport, setEditingReport] = useState<TaxReport | null>(null);
  const [formData, setFormData] = useState<TaxReportFormData>({
    name: '',
    report_type: 'monthly',
    additional_period: '',
    tax_ids: [],
    vat_payable: 0,
    start_date: '',
    end_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<'all' | 'draft' | 'confirmed' | 'submitted'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [periodSearch, setPeriodSearch] = useState<string>('');
  const [dateSearch, setDateSearch] = useState<string>('');

  useEffect(() => {
    fetchTaxReports();
    fetchTaxes();
  }, []);

  const fetchTaxReports = async () => {
    try {
      const response = await getTaxReports();
      console.log('🔍 세금 신고서 목록 응답:', response);
      if (response.success) {
        console.log('📊 세금 신고서 데이터:', response.data);
        setTaxReports(response.data || []);
      } else {
        setErrorMessage(response.message || '세금 신고서 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('세금 신고서 조회 실패:', error);
      setErrorMessage('세금 신고서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxes = async () => {
    try {
      const response = await getTaxes();
      if (response.success) {
        setTaxes(response.data || []);
      }
    } catch (error) {
      console.error('세금 조회 실패:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      report_type: 'monthly',
      additional_period: '',
      year: '',
      tax_ids: [],
      vat_payable: 0,
      start_date: '',
      end_date: '',
    });
    setEditingReport(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleOpenModal = (report?: TaxReport) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        name: report.name,
        report_type: report.report_type || 'monthly',
        additional_period: report.additional_period || '',
        year: report.additional_period ? report.additional_period.split('-')[0] : '',
        tax_ids: report.tax_ids || [],
        vat_payable: report.vat_payable || 0,
        start_date: '',
        end_date: '',
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
      setErrorMessage('신고서명은 필수입니다.');
      return;
    }

    if (formData.tax_ids.length === 0) {
      setErrorMessage('세금을 하나 이상 선택해주세요.');
      return;
    }

    // 모든 유형에서 추가 선택 검증
    if (!formData.additional_period) {
      setErrorMessage('기간을 선택해주세요.');
      return;
    }

    // 납부세액 검증
    if (formData.vat_payable === undefined || formData.vat_payable === null || formData.vat_payable < 0) {
      setErrorMessage('납부세액을 올바르게 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('🚀 신고서 저장 데이터:', formData);
      
      if (editingReport) {
        const response = await updateTaxReport(editingReport.id, formData);
        console.log('✅ 신고서 수정 응답:', response);
        if (response.success) {
          setSuccessMessage('세금 신고서가 성공적으로 수정되었습니다.');
          await fetchTaxReports();
          handleCloseModal();
        } else {
          setErrorMessage(response.message || '세금 신고서 수정에 실패했습니다.');
        }
      } else {
        const response = await createTaxReport(formData);
        console.log('✅ 신고서 생성 응답:', response);
        if (response.success) {
          setSuccessMessage('세금 신고서가 성공적으로 생성되었습니다.');
          await fetchTaxReports();
          
          // 새로 생성된 신고서의 ID를 찾아서 데이터 생성
          const newReports = await getTaxReports();
          if (newReports.success && newReports.data) {
            const latestReport = newReports.data[newReports.data.length - 1];
            if (latestReport && latestReport.id) {
              try {
                await generateTaxReportData(latestReport.id);
                await fetchTaxReports(); // 데이터 생성 후 다시 목록 갱신
                setSuccessMessage('세금 신고서가 성공적으로 생성되었습니다. 데이터도 자동으로 생성되었습니다.');
              } catch (error) {
                console.error('데이터 생성 실패:', error);
                setSuccessMessage('세금 신고서가 성공적으로 생성되었습니다. (데이터 생성은 별도로 진행해주세요)');
              }
            }
          }
          
          handleCloseModal();
        } else {
          setErrorMessage(response.message || '세금 신고서 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('세금 신고서 저장 실패:', error);
      setErrorMessage('세금 신고서 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (window.confirm('정말로 이 세금 신고서를 삭제하시겠습니까?')) {
      try {
        const response = await deleteTaxReport(reportId);
        if (response.success) {
          setSuccessMessage('세금 신고서가 성공적으로 삭제되었습니다.');
          await fetchTaxReports();
          
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } else {
          setErrorMessage(response.message || '세금 신고서 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('세금 신고서 삭제 실패:', error);
        setErrorMessage('세금 신고서 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleGenerateData = async (reportId: number) => {
    try {
      const response = await generateTaxReportData(reportId);
      if (response.success) {
        setSuccessMessage('신고서 데이터가 성공적으로 생성되었습니다.');
        await fetchTaxReports();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(response.message || '신고서 데이터 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고서 데이터 생성 실패:', error);
      setErrorMessage('신고서 데이터 생성 중 오류가 발생했습니다.');
    }
  };

  const handleViewDetail = (report: TaxReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'draft': return '작성중';
      case 'confirmed': return '확정';
      case 'submitted': return '신고완료';
      default: return state;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return '월별';
      case 'quarterly': return '분기별';
      case 'yearly': return '연간';
      case 'half_yearly': return '반기별';
      default: return type;
    }
  };

  // 기간 포맷팅 함수 (필터링에서 사용)
  const formatPeriodForFilter = (report: TaxReport) => {
    if (!report.report_type || !report.additional_period) return '-';
    
    switch (report.report_type) {
      case 'monthly':
        // 월별: 2024-01 → 2024년 1월
        const monthlyMatch = report.additional_period.match(/^(\d{4})-(\d{2})$/);
        if (monthlyMatch) {
          const year = monthlyMatch[1];
          const month = parseInt(monthlyMatch[2], 10);
          return `${year}년 ${month}월`;
        }
        return report.additional_period;
        
      case 'quarterly':
        // 분기별: 2024-q1 → 2024년 1분기
        const quarterlyMatch = report.additional_period.match(/^(\d{4})-q(\d)$/);
        if (quarterlyMatch) {
          const year = quarterlyMatch[1];
          const quarter = quarterlyMatch[2];
          return `${year}년 ${quarter}분기`;
        }
        return report.additional_period;
        
      case 'half_yearly':
        // 반기별: 2024-h1 → 2024년 상반기, 2024-h2 → 2024년 하반기
        const halfYearlyMatch = report.additional_period.match(/^(\d{4})-h(\d)$/);
        if (halfYearlyMatch) {
          const year = halfYearlyMatch[1];
          const half = halfYearlyMatch[2];
          const halfText = half === '1' ? '상반기' : '하반기';
          return `${year}년 ${halfText}`;
        }
        return report.additional_period;
        
      case 'yearly':
        // 연간: 2024 → 2024년
        const yearlyMatch = report.additional_period.match(/^(\d{4})$/);
        if (yearlyMatch) {
          const year = yearlyMatch[1];
          return `${year}년`;
        }
        return report.additional_period;
        
      default:
        return report.additional_period;
    }
  };

  // 필터링된 신고서 목록 계산
  const filteredReports = taxReports.filter(report => {
    // 상태 필터
    const matchesFilter = stateFilter === 'all' || report.state === stateFilter;
    
    // 신고서명 검색
    const matchesNameSearch = !searchTerm || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 기간 검색
    const matchesPeriodSearch = !periodSearch || 
      formatPeriodForFilter(report).toLowerCase().includes(periodSearch.toLowerCase());
    
    // 생성일 검색
    const matchesDateSearch = !dateSearch || 
      (report.date && report.date.startsWith(dateSearch));

    return matchesFilter && matchesNameSearch && matchesPeriodSearch && matchesDateSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return '-';
    }
  };

  const formatPeriod = (report: TaxReport) => {
    if (!report.report_type || !report.additional_period) return '-';
    
    console.log('🔍 기간 포맷팅:', {
      report_type: report.report_type,
      additional_period: report.additional_period
    });
    
    switch (report.report_type) {
      case 'monthly':
        // 월별: 2024-01 → 2024년 1월
        const monthlyMatch = report.additional_period.match(/^(\d{4})-(\d{2})$/);
        if (monthlyMatch) {
          const year = monthlyMatch[1];
          const month = parseInt(monthlyMatch[2], 10);
          return `${year}년 ${month}월`;
        }
        return report.additional_period;
        
      case 'quarterly':
        // 분기별: 2024-q1 → 2024년 1분기
        const quarterlyMatch = report.additional_period.match(/^(\d{4})-q(\d)$/);
        if (quarterlyMatch) {
          const year = quarterlyMatch[1];
          const quarter = quarterlyMatch[2];
          return `${year}년 ${quarter}분기`;
        }
        return report.additional_period;
        
      case 'half_yearly':
        // 반기별: 2024-h1 → 2024년 상반기, 2024-h2 → 2024년 하반기
        const halfYearlyMatch = report.additional_period.match(/^(\d{4})-h(\d)$/);
        if (halfYearlyMatch) {
          const year = halfYearlyMatch[1];
          const half = halfYearlyMatch[2];
          const halfText = half === '1' ? '상반기' : '하반기';
          return `${year}년 ${halfText}`;
        }
        return report.additional_period;
        
      case 'yearly':
        // 연간: 2024 → 2024년
        const yearlyMatch = report.additional_period.match(/^(\d{4})$/);
        if (yearlyMatch) {
          const year = yearlyMatch[1];
          return `${year}년`;
        }
        return report.additional_period;
        
      default:
        return report.additional_period;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">세금 신고서 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            세금 신고서를 생성하고 관리하세요.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          새 신고서
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as 'all' | 'draft' | 'confirmed' | 'submitted')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체</option>
              <option value="draft">작성중</option>
              <option value="confirmed">확정</option>
              <option value="submitted">신고완료</option>
            </select>
          </div>

          {/* 신고서명 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">신고서명</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="신고서명 검색"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* 기간 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기간</label>
            <input
              type="text"
              value={periodSearch}
              onChange={(e) => setPeriodSearch(e.target.value)}
              placeholder="기간 검색 (예: 2024년 1월)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* 생성일 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">생성일</label>
            <input
              type="date"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* 신고서 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                신고서명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                세금 종류
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                납부세액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => {
              console.log('📋 신고서 데이터:', {
                id: report.id,
                name: report.name,
                report_type: report.report_type,
                selected_taxes: report.selected_taxes,
                tax_ids: report.tax_ids,
                vat_payable: report.vat_payable
              });
              return (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {report.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(report.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPeriod(report)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.report_type ? getReportTypeLabel(report.report_type) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.selected_taxes && report.selected_taxes.length > 0 ? 
                      report.selected_taxes.join(', ') : 
                      report.tax_ids && report.tax_ids.length > 0 ? 
                      `${report.tax_ids.length}개 세금` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={report.vat_payable && report.vat_payable < 0 ? 'text-red-600' : ''}>
                      {report.vat_payable !== undefined && report.vat_payable !== null ? 
                        `${formatCurrency(report.vat_payable)}원` : 
                        report.vat_payable === 0 ? '0원' : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(report)}
                        className="text-blue-400 hover:text-blue-500"
                        title="상세보기"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(report)}
                        className="text-gray-400 hover:text-gray-500"
                        title="수정"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(report.id)}
                        className="text-red-400 hover:text-red-500"
                        title="삭제"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 신고서 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingReport ? '신고서 수정' : '새 신고서'}
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
                    신고서명 *
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
                    신고서 유형 *
                  </label>
                  <select
                    value={formData.report_type}
                    onChange={(e) => setFormData({ ...formData, report_type: e.target.value as any, additional_period: '' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={submitting}
                  >
                    <option value="monthly">월별</option>
                    <option value="quarterly">분기별</option>
                    <option value="half_yearly">반기별</option>
                    <option value="yearly">연간</option>
                  </select>
                </div>



                {/* 월별일 때 월 선택 */}
                {formData.report_type === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      월 선택 *
                    </label>
                    <input
                      type="month"
                      value={formData.additional_period}
                      onChange={(e) => setFormData({ ...formData, additional_period: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={submitting}
                    />
                  </div>
                )}

                {/* 분기별/반기별/연간일 때 연도 선택 */}
                {(formData.report_type === 'quarterly' || formData.report_type === 'half_yearly' || formData.report_type === 'yearly') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      연도 선택 *
                    </label>
                    <select
                      value={formData.year || ''}
                      onChange={(e) => {
                        console.log('🔄 연도 선택 변경:', e.target.value);
                        setFormData({ ...formData, year: e.target.value, additional_period: '' });
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={submitting}
                    >
                      <option value="">연도를 선택하세요</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <option key={year} value={year.toString()}>
                            {year}년
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* 분기별/반기별일 때 추가 선택박스 */}
                {(formData.report_type === 'quarterly' || formData.report_type === 'half_yearly') && formData.year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.report_type === 'quarterly' ? '분기 선택' : '반기 선택'} *
                    </label>
                    <select
                      value={formData.additional_period ? formData.additional_period.split('-')[1] : ''}
                      onChange={(e) => {
                        console.log('🔄 분기/반기 선택 변경:', e.target.value);
                        setFormData({ ...formData, additional_period: `${formData.year}-${e.target.value}` });
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={submitting}
                    >
                      <option value="">선택하세요</option>
                      {formData.report_type === 'quarterly' && (
                        <>
                          <option value="q1">1분기</option>
                          <option value="q2">2분기</option>
                          <option value="q3">3분기</option>
                          <option value="q4">4분기</option>
                        </>
                      )}
                      {formData.report_type === 'half_yearly' && (
                        <>
                          <option value="h1">상반기</option>
                          <option value="h2">하반기</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* 연간일 때 추가 선택박스 */}
                {formData.report_type === 'yearly' && formData.year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      연도 선택 *
                    </label>
                    <select
                      value={formData.additional_period}
                      onChange={(e) => setFormData({ ...formData, additional_period: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={submitting}
                    >
                      <option value="">선택하세요</option>
                      <option value={formData.year}>{formData.year}년</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    세금 선택 *
                  </label>
                                     <select
                     multiple
                     value={formData.tax_ids.map(String)}
                     onChange={(e) => {
                       const selectedOptions = Array.from(e.target.selectedOptions);
                       const selectedIds = selectedOptions.map(option => parseInt(option.value, 10));
                       const selectedNames = selectedOptions.map(option => option.text);
                       setFormData({ 
                         ...formData, 
                         tax_ids: selectedIds,
                         selected_taxes: selectedNames
                       });
                     }}
                     className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                     required
                     disabled={submitting}
                   >
                    {taxes.map((tax) => (
                      <option key={tax.id} value={tax.id}>
                        {tax.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    납부세액 *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.vat_payable || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      console.log('💰 납부세액 입력:', value);
                      setFormData({ ...formData, vat_payable: value });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={submitting}
                    placeholder="납부세액을 입력하세요"
                  />
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
                    {submitting ? '저장 중...' : (editingReport ? '수정' : '생성')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 신고서 상세 모달 */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">신고서 상세</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">신고서명:</span>
                      <div className="text-sm font-medium">{selectedReport.name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">기간:</span>
                      <div className="text-sm font-medium">
                        {selectedReport.period_start} ~ {selectedReport.period_end}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">유형:</span>
                      <div className="text-sm font-medium">{selectedReport.tax_period_name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">상태:</span>
                      <div className="text-sm font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(selectedReport.state)}`}>
                          {getStateLabel(selectedReport.state)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">세금 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">매출 부가세:</span>
                      <div className="text-sm font-medium">{formatCurrency(selectedReport.sale_vat_amount)}원</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">매입 부가세:</span>
                      <div className="text-sm font-medium">{formatCurrency(selectedReport.purchase_vat_amount)}원</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">납부세액:</span>
                      <div className="text-sm font-medium">{formatCurrency(selectedReport.vat_payable)}원</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">면세:</span>
                      <div className="text-sm font-medium">{formatCurrency(selectedReport.exempt_amount)}원</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">영세율:</span>
                      <div className="text-sm font-medium">{formatCurrency(selectedReport.zero_rated_amount)}원</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">원천징수:</span>
                      <div className="text-sm font-medium">{formatCurrency(selectedReport.withholding_amount)}원</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">일정 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">생성일:</span>
                      <div className="text-sm font-medium">{formatDate(selectedReport.created_at || '')}</div>
                    </div>
                    {selectedReport.submitted_at && (
                      <div>
                        <span className="text-sm text-gray-500">신고일:</span>
                        <div className="text-sm font-medium">{formatDate(selectedReport.submitted_at)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxReports; 