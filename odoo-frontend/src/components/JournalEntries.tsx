import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon, PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, getAccounts, getPartners } from '../services/api.ts';
import { JournalEntry, JournalLine, Account, Partner } from '../types';

interface JournalLineForm {
  account_id: number;
  name: string;
  debit: number;
  credit: number;
  partner_id?: number;
}

interface JournalEntryFormData {
  name: string;
  date: string;
  ref: string;
  lines: JournalLineForm[];
}

function getNextRef(entries: JournalEntry[]): string {
  // ref가 6자리 숫자인 경우만 추출
  const nums = entries
    .map(e => e.ref)
    .filter(ref => ref && /^\d{6}$/.test(ref!))
    .map(ref => parseInt(ref!));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return (max + 1).toString().padStart(6, '0');
}

const JournalEntries: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState<JournalEntryFormData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    ref: '',
    lines: [
      { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined },
      { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined }
    ]
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false]);
  const [searchModes, setSearchModes] = useState<boolean[]>([false]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerSearchTerms, setPartnerSearchTerms] = useState<string[]>(['']);
  const [showPartnerDropdowns, setShowPartnerDropdowns] = useState<boolean[]>([false]);
  const [partnerSearchModes, setPartnerSearchModes] = useState<boolean[]>([false]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.account-dropdown')) {
        setShowDropdowns(new Array(formData.lines.length).fill(false));
        setSearchModes(new Array(formData.lines.length).fill(false));
      }
      if (!target.closest('.partner-dropdown')) {
        setShowPartnerDropdowns(new Array(formData.lines.length).fill(false));
        setPartnerSearchModes(new Array(formData.lines.length).fill(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [formData.lines.length]);

  const fetchData = async () => {
    try {
      const [entriesResponse, accountsResponse, partnersResponse] = await Promise.all([
        getJournalEntries(),
        getAccounts(),
        getPartners()
      ]);

      if (entriesResponse.success) {
        setEntries(entriesResponse.data || []);
      }

      if (accountsResponse.success) {
        setAccounts(accountsResponse.data || []);
      }
      if (partnersResponse.success) {
        setPartners(partnersResponse.data || []);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      ref: getNextRef(entries),
      lines: [
        { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined },
        { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined }
      ]
    });
    setSearchTerms(['', '']);
    setShowDropdowns([false, false]);
    setSearchModes([false, false]);
    setPartnerSearchTerms(['', '']);
    setShowPartnerDropdowns([false, false]);
    setPartnerSearchModes([false, false]);
    setEditingEntry(null);
  };

  const handleOpenModal = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        name: entry.name,
        date: entry.date,
        ref: entry.ref || '',
        lines: (entry.lines || []).map(line => ({
          account_id: line.account_id,
          name: line.name || '',
          debit: line.debit,
          credit: line.credit,
          partner_id: line.partner_id
        }))
      });
      setSearchTerms(new Array((entry.lines || []).length).fill(''));
      setShowDropdowns(new Array((entry.lines || []).length).fill(false));
      setSearchModes(new Array((entry.lines || []).length).fill(false));
      setPartnerSearchTerms(new Array((entry.lines || []).length).fill(''));
      setShowPartnerDropdowns(new Array((entry.lines || []).length).fill(false));
      setPartnerSearchModes(new Array((entry.lines || []).length).fill(false));
    } else {
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        ref: getNextRef(entries),
        lines: [
          { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined },
          { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined }
        ]
      });
      setSearchTerms(['', '']);
      setShowDropdowns([false, false]);
      setSearchModes([false, false]);
      setPartnerSearchTerms(['', '']);
      setShowPartnerDropdowns([false, false]);
      setPartnerSearchModes([false, false]);
      setEditingEntry(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: 0, name: '', debit: 0, credit: 0, partner_id: undefined }]
    });
    setSearchTerms([...searchTerms, '']);
    setShowDropdowns([...showDropdowns, false]);
    setSearchModes([...searchModes, false]);
    setPartnerSearchTerms([...partnerSearchTerms, '']);
    setShowPartnerDropdowns([...showPartnerDropdowns, false]);
    setPartnerSearchModes([...partnerSearchModes, false]);
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length > 1) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData({ ...formData, lines: newLines });
      setSearchTerms(searchTerms.filter((_, i) => i !== index));
      setShowDropdowns(showDropdowns.filter((_, i) => i !== index));
      setSearchModes(searchModes.filter((_, i) => i !== index));
      setPartnerSearchTerms(partnerSearchTerms.filter((_, i) => i !== index));
      setShowPartnerDropdowns(showPartnerDropdowns.filter((_, i) => i !== index));
      setPartnerSearchModes(partnerSearchModes.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index: number, field: keyof JournalLineForm, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const handleAccountSelect = (lineIndex: number, accountId: number) => {
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    const newLines = [...formData.lines];
    newLines[lineIndex] = { 
      ...newLines[lineIndex], 
      account_id: accountId,
      name: selectedAccount?.name || ''
    };
    setFormData({ ...formData, lines: newLines });
    
    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[lineIndex] = false;
    setShowDropdowns(newShowDropdowns);
    
    const newSearchTerms = [...searchTerms];
    newSearchTerms[lineIndex] = '';
    setSearchTerms(newSearchTerms);
    
    const newSearchModes = [...searchModes];
    newSearchModes[lineIndex] = false;
    setSearchModes(newSearchModes);
  };

  const handleInputClick = (lineIndex: number) => {
    const newSearchModes = [...searchModes];
    newSearchModes[lineIndex] = true;
    setSearchModes(newSearchModes);
    
    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[lineIndex] = true;
    setShowDropdowns(newShowDropdowns);
    
    const newSearchTerms = [...searchTerms];
    newSearchTerms[lineIndex] = '';
    setSearchTerms(newSearchTerms);
  };

  const getFilteredAccounts = (lineIndex: number) => {
    const searchTerm = searchTerms[lineIndex] || '';
    return accounts.filter(account => 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handlePartnerSelect = (lineIndex: number, partnerId: number) => {
    const newLines = [...formData.lines];
    newLines[lineIndex].partner_id = partnerId;
    setFormData({ ...formData, lines: newLines });
    
    const newPartnerSearchTerms = [...partnerSearchTerms];
    newPartnerSearchTerms[lineIndex] = '';
    setPartnerSearchTerms(newPartnerSearchTerms);
    
    const newShowPartnerDropdowns = [...showPartnerDropdowns];
    newShowPartnerDropdowns[lineIndex] = false;
    setShowPartnerDropdowns(newShowPartnerDropdowns);
    
    const newPartnerSearchModes = [...partnerSearchModes];
    newPartnerSearchModes[lineIndex] = false;
    setPartnerSearchModes(newPartnerSearchModes);
  };

  const handlePartnerInputClick = (lineIndex: number) => {
    const newPartnerSearchModes = [...partnerSearchModes];
    newPartnerSearchModes[lineIndex] = true;
    setPartnerSearchModes(newPartnerSearchModes);
    
    const newShowPartnerDropdowns = [...showPartnerDropdowns];
    newShowPartnerDropdowns[lineIndex] = true;
    setShowPartnerDropdowns(newShowPartnerDropdowns);
    
    const newPartnerSearchTerms = [...partnerSearchTerms];
    newPartnerSearchTerms[lineIndex] = '';
    setPartnerSearchTerms(newPartnerSearchTerms);
  };

  const getFilteredPartners = (lineIndex: number) => {
    const searchTerm = partnerSearchTerms[lineIndex] || '';
    return partners.filter(partner => 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partner.code && partner.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const validateForm = () => {
    // 차변과 대변 검증
    const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert('차변과 대변이 같아야 합니다.');
      return false;
    }

    if (formData.lines.some(line => !line.account_id)) {
      alert('모든 라인의 계정과목을 선택해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      const entryData = {
        ...formData,
        amount_total: formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0),
        line_count: formData.lines.length,
        lines: formData.lines.map(line => ({
          account_id: line.account_id,
          name: line.name,
          debit: line.debit,
          credit: line.credit,
          partner_id: line.partner_id
        }))
      };

      if (editingEntry) {
        // 수정
        const response = await updateJournalEntry(editingEntry.id, entryData);
        if (response.success) {
          handleCloseModal();
          // 데이터 새로고침으로 최신 상태 유지
          await fetchData();
        }
      } else {
        // 생성
        const response = await createJournalEntry(entryData);
        if (response.success) {
          handleCloseModal();
          // 데이터 새로고침으로 최신 상태 유지
          await fetchData();
        }
      }
    } catch (error) {
      console.error('분개장장 저장 실패:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: number) => {
    if (window.confirm('정말로 이 분개장을 삭제하시겠습니까?')) {
      
      try {
        const response = await deleteJournalEntry(entryId);
        
        if (response.success) {
          // 데이터 새로고침으로 최신 상태 유지
          await fetchData();
        } else {
          console.error('삭제 실패:', response);
        }
      } catch (error) {
        console.error('분개장 삭제 실패:', error);
      }
    }
  };

  const handleViewDetail = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  // 날짜 필터링된 entries
  const filteredEntries = entries.filter(entry => {
    if (startDate && entry.date < startDate) return false;
    if (endDate && entry.date > endDate) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // 분개장 목록 렌더링 위에 추가
  if (entries.length > 0) {
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분개장 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            회계 분개장을 관리하고 조회하세요.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          새 분개장
        </button>
      </div>
      {/* 날짜 검색 필터 */}
      <div className="flex items-center space-x-2 mb-2">
        <label className="text-sm">시작일</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <label className="text-sm">~</label>
        <label className="text-sm">종료일</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <button
          type="button"
          className="ml-2 px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => { setStartDate(''); setEndDate(''); }}
        >
          초기화
        </button>
      </div>

      {/* 분개장별(전표별)로 제목/합계 → 해당 라인 테이블 순서로 출력 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md w-full">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="text-xs font-bold text-gray-600 border-b">
                <th className="text-center">전표일자</th>
                <th className="text-center">전표번호</th>
                <th className="text-center">구분</th>
                <th className="text-center">코드</th>
                <th className="text-center">계정과목</th>
                <th className="text-center">차변금액</th>
                <th className="text-center">대변금액</th>
                <th className="text-center">거래처코드</th>
                <th className="text-center">거래처명</th>
                <th className="text-center">적요</th>
                <th className="text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.flatMap(entry =>
                (entry.lines || []).map((line, idx) => (
                  <tr key={entry.id + '-' + line.id} className="border-b min-h-[56px] align-middle">
                    <td className="text-xs text-gray-500 text-center">{entry.date}</td>
                    <td className="text-xs text-gray-500 text-center">{entry.ref}</td>
                    <td className="text-xs text-center">{line.debit > 0 ? '차변' : '대변'}</td>
                    <td className="text-xs text-center">{line.account_code}</td>
                    <td className="text-xs text-center">{line.account_name}</td>
                    <td className="text-xs text-blue-800 text-center">{line.debit > 0 ? line.debit.toLocaleString() : ''}</td>
                    <td className="text-xs text-green-800 text-center">{line.credit > 0 ? line.credit.toLocaleString() : ''}</td>
                    <td className="text-xs text-center">{line.partner_code}</td>
                    <td className="text-xs text-center">{line.partner_name}</td>
                    <td className="text-xs text-center">{line.name}</td>
                    <td>
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => handleOpenModal(entry)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="수정"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="삭제"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 분개장 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEntry ? '분개장 수정' : '새 분개장'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전표번호</label>
                  <input
                    type="text"
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    readOnly
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">분개 라인</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
                  >
                    <PlusCircleIcon className="h-4 w-4 mr-1" />
                    라인 추가
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <div className="relative account-dropdown">
                          <input
                            type="text"
                            placeholder={searchModes[index] ? "계정과목 검색..." : "계정과목 선택"}
                            value={searchModes[index] ? searchTerms[index] : (line.account_id > 0 ? `${accounts.find(acc => acc.id === line.account_id)?.code} - ${line.name}` : "")}
                            onChange={(e) => {
                              if (searchModes[index]) {
                                const newSearchTerms = [...searchTerms];
                                newSearchTerms[index] = e.target.value;
                                setSearchTerms(newSearchTerms);
                                const newShowDropdowns = [...showDropdowns];
                                newShowDropdowns[index] = true;
                                setShowDropdowns(newShowDropdowns);
                              }
                            }}
                            onClick={() => handleInputClick(index)}
                            onFocus={() => {
                              if (!searchModes[index]) {
                                const newSearchModes = [...searchModes];
                                newSearchModes[index] = true;
                                setSearchModes(newSearchModes);
                                const newSearchTerms = [...searchTerms];
                                newSearchTerms[index] = '';
                                setSearchTerms(newSearchTerms);
                              }
                              const newShowDropdowns = [...showDropdowns];
                              newShowDropdowns[index] = true;
                              setShowDropdowns(newShowDropdowns);
                            }}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                            required
                            readOnly={!searchModes[index]}
                          />
                          
                          {showDropdowns[index] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {getFilteredAccounts(index).length > 0 ? (
                                getFilteredAccounts(index).map((account) => (
                                  <div
                                    key={account.id}
                                    onClick={() => handleAccountSelect(index, account.id)}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                  >
                                    <div className="font-medium">{account.code} - {account.name}</div>
                                    <div className="text-gray-500 text-xs">{account.type}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-gray-500 text-sm">검색 결과가 없습니다.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="relative partner-dropdown">
                          <input
                            type="text"
                            placeholder={partnerSearchModes[index] ? "거래처 검색..." : "거래처 선택"}
                            value={partnerSearchModes[index] ? partnerSearchTerms[index] : (line.partner_id ? `${partners.find(p => p.id === line.partner_id)?.code || ''} - ${partners.find(p => p.id === line.partner_id)?.name || ''}` : "")}
                            onChange={(e) => {
                              if (partnerSearchModes[index]) {
                                const newPartnerSearchTerms = [...partnerSearchTerms];
                                newPartnerSearchTerms[index] = e.target.value;
                                setPartnerSearchTerms(newPartnerSearchTerms);
                                const newShowPartnerDropdowns = [...showPartnerDropdowns];
                                newShowPartnerDropdowns[index] = true;
                                setShowPartnerDropdowns(newShowPartnerDropdowns);
                              }
                            }}
                            onClick={() => handlePartnerInputClick(index)}
                            onFocus={() => {
                              if (!partnerSearchModes[index]) {
                                const newPartnerSearchModes = [...partnerSearchModes];
                                newPartnerSearchModes[index] = true;
                                setPartnerSearchModes(newPartnerSearchModes);
                                const newPartnerSearchTerms = [...partnerSearchTerms];
                                newPartnerSearchTerms[index] = '';
                                setPartnerSearchTerms(newPartnerSearchTerms);
                              }
                              const newShowPartnerDropdowns = [...showPartnerDropdowns];
                              newShowPartnerDropdowns[index] = true;
                              setShowPartnerDropdowns(newShowPartnerDropdowns);
                            }}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                            readOnly={!partnerSearchModes[index]}
                          />
                          
                          {showPartnerDropdowns[index] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {getFilteredPartners(index).length > 0 ? (
                                getFilteredPartners(index).map((partner) => (
                                  <div
                                    key={partner.id}
                                    onClick={() => handlePartnerSelect(index, partner.id)}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                  >
                                    <div className="font-medium">{partner.code || ''} - {partner.name}</div>
                                    <div className="text-gray-500 text-xs">{partner.type}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-gray-500 text-sm">검색 결과가 없습니다.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="적요"
                          value={line.name}
                          onChange={(e) => handleLineChange(index, 'name', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div className="col-span-2.75">
                        <input
                          type="number"
                          placeholder="차변"
                          value={line.debit === 0 ? '' : line.debit}
                          onChange={(e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="col-span-2.75">
                        <input
                          type="number"
                          placeholder="대변"
                          value={line.credit === 0 ? '' : line.credit}
                          onChange={(e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      {formData.lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <MinusCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-700">차변 합계</span>
                      <span className="text-lg font-bold text-blue-800">₩{formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">대변 합계</span>
                      <span className="text-lg font-bold text-green-800">₩{formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? '저장 중...' : (editingEntry ? '수정' : '생성')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 분개장 상세보기 모달 */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">분개장 상세</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
                  </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">날짜</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEntry.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전표번호</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEntry.ref || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">분개 라인</h4>
                <div className="space-y-2">
                  {selectedEntry.lines && selectedEntry.lines.length > 0 ? (
                    selectedEntry.lines.map((line, index) => {
                      const account = accounts.find(acc => acc.id === line.account_id);
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">
                              {account ? `${account.code} - ${account.name}` : `계정ID: ${line.account_id}`} 
                              {line.name && ` - ${line.name}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account ? account.type : '계정과목 정보 없음'}
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            <span className="text-blue-600 font-medium">차변: ₩{line.debit?.toLocaleString() || '0'}</span>
                            <span className="text-green-600 font-medium">대변: ₩{line.credit?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-gray-500">
                      분개 라인이 없습니다.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default JournalEntries; 