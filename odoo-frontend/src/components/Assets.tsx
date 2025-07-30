import React, { useState, useEffect } from 'react';
import { getAssets, depreciateAssets, createAsset, updateAsset, deleteAsset } from '../services/api.ts';
import { Asset } from '../types';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const initialForm = {
  name: '',
  purchase_date: '',
  purchase_value: 0,
  depreciation_method: '',
  useful_life: 1,
};

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [deprResult, setDeprResult] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setFetching(true);
    try {
      const response = await getAssets();
      if (response.success) {
        setAssets(response.data || []);
      }
    } catch (error) {
      console.error('고정자산 조회 실패:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleDepreciate = async (assetId?: number) => {
    console.log('감가상각 실행 assetId:', assetId);
    setLoading(true);
    setDeprResult([]);
    try {
      const ids = assetId ? [assetId] : assets.map(a => a.id);
      console.log('API로 전송되는 asset_ids:', ids);
      const res = await depreciateAssets(ids);
      if (res.success) {
        setDeprResult(res.data || []);
        // 감가상각 후 자산 목록 새로고침
        fetchAssets();
      } else {
        alert(res.message || '감가상각 실패');
      }
    } catch (e) {
      alert('감가상각 실행 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(initialForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: name === 'purchase_value' || name === 'useful_life' ? Number(value) : value }));
  };

  const handleEdit = (asset: Asset) => {
    setForm({
      name: asset.name,
      purchase_date: asset.purchase_date || '',
      purchase_value: asset.purchase_value,
      depreciation_method: asset.depreciation_method,
      useful_life: asset.useful_life || 1,
      id: asset.id,
    });
    setShowModal(true);
  };

  const handleDelete = async (assetId: number) => {
    if (!window.confirm('정말로 이 자산을 삭제하시겠습니까?')) return;
    setLoading(true);
    try {
      // deleteAsset 함수는 이미 api.ts에 구현되어 있다고 가정
      const res = await deleteAsset(assetId);
      if (res.success) {
        fetchAssets();
      } else {
        alert(res.message || '삭제 실패');
      }
    } catch (e) {
      alert('삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form.id) {
        // updateAsset 함수는 이미 api.ts에 구현되어 있다고 가정
        const res = await updateAsset(form.id, form);
        if (res.success) {
          handleCloseModal();
          fetchAssets();
        } else {
          alert(res.message || '수정 실패');
        }
      } else {
        const res = await createAsset(form);
        if (res.success) {
          handleCloseModal();
          fetchAssets();
        } else {
          alert(res.message || '등록 실패');
        }
      }
    } catch (err) {
      alert(form.id ? '수정 실패' : '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고정자산 관리</h1>
          <p className="mt-1 text-sm text-gray-500">고정자산 정보를 조회하고 감가상각을 실행할 수 있습니다.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        >
          자산 등록
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-lg font-bold mb-4">{form.id ? '고정자산 수정' : '고정자산 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">자산명</label>
                <input name="name" value={form.name} onChange={handleChange} required className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">취득일</label>
                <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} required className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">취득가</label>
                <input name="purchase_value" type="number" value={form.purchase_value} onChange={handleChange} required min={0} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">감가상각방법</label>
                <select name="depreciation_method" value={form.depreciation_method} onChange={handleChange} required className="mt-1 w-full border rounded px-2 py-1">
                  <option value="">선택</option>
                  <option value="정액법">정액법</option>
                  <option value="정률법">정률법</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">내용연수(년)</label>
                <input name="useful_life" type="number" value={form.useful_life} onChange={handleChange} required min={1} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {submitting ? (form.id ? '수정 중...' : '등록 중...') : (form.id ? '수정' : '등록')}
                </button>
              </div>
            </form>
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
          </div>
        </div>
      )}

      <div className="flex items-center mb-2">
        <button
          onClick={() => handleDepreciate()}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '계산 중...' : '전체 감가상각'}
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 w-1/6 text-center">자산명</th>
              <th className="px-4 py-2 w-1/6 text-center">취득가</th>
              <th className="px-4 py-2 w-1/6 text-center">취득일</th>
              <th className="px-4 py-2 w-1/6 text-center">감가상각방법</th>
              <th className="px-4 py-2 w-1/6 text-center">잔존가치</th>
              <th className="px-4 py-2 w-1/6 text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => {
              console.log('자산:', asset.id, asset.name, asset.purchase_date);
              return (
                <tr key={asset.id} className="border-b">
                  <td className="px-4 py-2 text-center">{asset.name}</td>
                  <td className="px-4 py-2 text-right">₩{asset.purchase_value?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-2 text-center">{asset.purchase_date || '-'}</td>
                  <td className="px-4 py-2 text-center">{asset.depreciation_method}</td>
                  <td className="px-4 py-2 text-right">₩{asset.current_value?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDepreciate(asset.id)}
                      className="px-2 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-blue-100 disabled:opacity-50 mr-1"
                      disabled={loading}
                    >
                      감가상각
                    </button>
                    <button
                      onClick={() => handleEdit(asset)}
                      className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800"
                      title="수정"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800"
                      title="삭제"
                      disabled={loading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deprResult.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-2">감가상각 결과 (분개장)</h3>
          <table className="min-w-full table-fixed border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 w-1/6">자산명</th>
                <th className="px-4 py-2 w-1/6">감가상각액</th>
                <th className="px-4 py-2 w-1/6">일자</th>
                <th className="px-4 py-2 w-1/6">전표번호</th>
                <th className="px-4 py-2 w-2/6">분개라인</th>
              </tr>
            </thead>
            <tbody>
              {deprResult.map((res: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">{assets.find(a => a.id === res.asset_id)?.name || '-'}</td>
                  <td className="px-4 py-2">
                    {res.reason
                      ? <span className="text-red-500">{res.reason}</span>
                      : `₩${res.depreciation_amount?.toLocaleString() || '-'}`}
                  </td>
                  <td className="px-4 py-2">{res.date || '-'}</td>
                  <td className="px-4 py-2">{res.journal_entry?.ref || '-'}</td>
                  <td className="px-4 py-2">
                    {res.journal_entry?.lines?.map((line: any, i: number) => (
                      <div key={i} className="text-xs text-gray-700">
                        {line.account_name}: 차변 {line.debit}, 대변 {line.credit}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Assets; 