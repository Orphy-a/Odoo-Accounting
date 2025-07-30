import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { getPartners, createPartner, updatePartner, deletePartner } from '../services/api.ts';
import { Partner } from '../types';

interface PartnerFormData {
  name: string;
  code: string;
  type: 'customer' | 'supplier' | 'both';
  email: string;
  phone: string;
  active: boolean;
}

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    code: '',
    type: 'customer',
    email: '',
    phone: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      console.log('거래처 목록 새로고침 중...');
      const response = await getPartners();
      console.log('거래처 목록 응답:', response);
      if (response.success) {
        setPartners(response.data || []);
        console.log('업데이트된 거래처 목록:', response.data);
      } else {
        setErrorMessage(response.message || '거래처 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('거래처 조회 실패:', error);
      setErrorMessage('거래처 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'customer',
      email: '',
      phone: '',
      active: true,
    });
    setEditingPartner(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleOpenModal = (partner?: Partner) => {
    if (partner) {
      console.log('수정할 거래처:', partner);
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        code: partner.code || '',
        type: partner.type,
        email: partner.email || '',
        phone: partner.phone || '',
        active: partner.active,
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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('거래처명은 필수입니다.');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
            if (editingPartner) {
        // 수정
        console.log('수정 중:', editingPartner.id, formData);
        const response = await updatePartner(editingPartner.id, formData);
        console.log('수정 응답:', response);
        console.log('응답 성공 여부:', response.success);
        console.log('응답 메시지:', response.message);
                  if (response.success) {
            console.log('수정 성공, 목록 새로고침...');
            setSuccessMessage('거래처가 성공적으로 수정되었습니다.');
            
            // 백엔드에서 최신 데이터 다시 가져오기
            await fetchPartners();
            
            // 즉시 모달 닫기
            handleCloseModal();
          } else {
          setErrorMessage(response.message || '거래처 수정에 실패했습니다.');
        }
      } else {
        // 생성
        console.log('생성 중:', formData);
        const response = await createPartner(formData);
        console.log('생성 응답:', response);
                  if (response.success) {
            console.log('생성 성공, 목록 새로고침...');
            setSuccessMessage('거래처가 성공적으로 생성되었습니다.');
            
            // 백엔드에서 최신 데이터 다시 가져오기
            await fetchPartners();
            
            // 즉시 모달 닫기
            handleCloseModal();
          } else {
          setErrorMessage(response.message || '거래처 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('거래처 저장 실패:', error);
      setErrorMessage('거래처 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (partnerId: number) => {
    if (window.confirm('정말로 이 거래처를 삭제하시겠습니까?')) {
      try {
        const response = await deletePartner(partnerId);
        if (response.success) {
          setSuccessMessage('거래처가 성공적으로 삭제되었습니다.');
          
          // 백엔드에서 최신 데이터 다시 가져오기
          await fetchPartners();
          
          // 3초 후 성공 메시지 제거
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } else {
          setErrorMessage(response.message || '거래처 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('거래처 삭제 실패:', error);
        setErrorMessage('거래처 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customer': return '고객';
      case 'supplier': return '공급업체';
      case 'both': return '고객/공급업체';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'supplier': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링된 거래처 목록 계산
  const filteredPartners = partners.filter(partner => {
    switch (activeFilter) {
      case 'active':
        return partner.active;
      case 'inactive':
        return !partner.active;
      default:
        return true; // 'all' - 모든 거래처 표시
    }
  });

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
          <h1 className="text-2xl font-bold text-gray-900">거래처 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            거래처 정보를 관리하고 조회하세요.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* 활성 상태 필터 */}
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
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            새 거래처
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPartners.map((partner) => (
            <li key={partner.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      partner.active ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-sm font-medium ${
                        partner.active ? 'text-purple-800' : 'text-gray-500'
                      }`}>
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`text-sm font-medium ${
                      partner.active ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {partner.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(partner.type)}`}>
                        {getTypeLabel(partner.type)}
                      </span>
                      {partner.email && (
                        <span className="flex items-center text-gray-500">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          {partner.email}
                        </span>
                      )}
                      {partner.phone && (
                        <span className="flex items-center text-gray-500">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {partner.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    partner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {partner.active ? '활성' : '비활성'}
                  </span>
                  <button
                    onClick={() => handleOpenModal(partner)}
                    className="text-gray-400 hover:text-gray-500"
                    title="수정"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="text-red-400 hover:text-red-500"
                    title="삭제"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 거래처 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingPartner ? '거래처 수정' : '새 거래처'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* 모달 내 에러 메시지 */}
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    거래처명 *
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
                    거래처 코드
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="자동 생성"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    거래처 유형 *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={submitting}
                  >
                    <option value="customer">고객</option>
                    <option value="supplier">공급업체</option>
                    <option value="both">고객/공급업체</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    {submitting ? '저장 중...' : (editingPartner ? '수정' : '생성')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners; 