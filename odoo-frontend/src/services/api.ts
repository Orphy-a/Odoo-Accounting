import axios from 'axios';
import { ApiResponse, Account, JournalEntry, Partner, Asset, Budget, Currency, Tax, TaxCalculation, TaxReport } from '../types';

const API_BASE_URL = '/api/accounting';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API 요청:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ 응답 에러:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Health Check
export const checkHealth = async (): Promise<ApiResponse> => {
  try {
    console.log('API 호출 - checkHealth: GET /health');
    const response = await api.get('/health');
    console.log('API 응답 - checkHealth:', response.data);
    return response.data;
  } catch (error) {
    console.error('checkHealth 에러:', error);
    return { success: false, message: '백엔드 서버와 통신에 실패했습니다.' };
  }
};

// 계정과목 API
export const getAccounts = async (): Promise<ApiResponse<Account[]>> => {
  try {
    console.log('API 호출 - getAccounts: GET /accounts');
    const response = await api.get('/accounts');
    console.log('API 응답 - getAccounts:', response.data);
    return response.data;
  } catch (error) {
    console.error('getAccounts 에러:', error);
    return { success: false, message: '계정과목 조회 실패' };
  }
};

export const createAccount = async (account: Partial<Account>): Promise<ApiResponse<Account>> => {
  try {
    console.log('API 호출 - createAccount: POST /accounts', account);
    const response = await api.post('/accounts', account);
    console.log('API 응답 - createAccount:', response.data);
    return response.data;
  } catch (error) {
    console.error('createAccount 에러:', error);
    return { success: false, message: '계정과목 생성 실패' };
  }
};

export const updateAccount = async (id: number, account: Partial<Account>): Promise<ApiResponse> => {
  try {
    console.log('API 호출 - updateAccount: PUT /accounts/' + id, account);
    const response = await api.put(`/accounts/${id}`, account);
    console.log('API 응답 - updateAccount:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateAccount 에러:', error);
    return { success: false, message: '계정과목 수정 실패' };
  }
};

export const deleteAccount = async (id: number): Promise<ApiResponse> => {
  try {
    console.log('API 호출 - deleteAccount: DELETE /accounts/' + id);
    const response = await api.delete(`/accounts/${id}`);
    console.log('API 응답 - deleteAccount:', response.data);
    return response.data;
  } catch (error) {
    console.error('deleteAccount 에러:', error);
    return { success: false, message: '계정과목 삭제 실패' };
  }
};

// 분개장 API
export const getJournalEntries = async (): Promise<ApiResponse<JournalEntry[]>> => {
  try {
    console.log('API 호출 - getJournalEntries: GET /journal-entries');
    const response = await api.get('/journal-entries');
    console.log('API 응답 - getJournalEntries:', response.data);
    return response.data;
  } catch (error) {
    console.error('getJournalEntries 에러:', error);
    return { success: false, message: '분개장 조회 실패' };
  }
};

export const createJournalEntry = async (entry: any): Promise<ApiResponse<JournalEntry>> => {
  try {
    console.log('API 호출 - createJournalEntry: POST /journal-entries', entry);
    const response = await api.post('/journal-entries', entry);
    console.log('API 응답 - createJournalEntry:', response.data);
    return response.data;
  } catch (error) {
    console.error('createJournalEntry 에러:', error);
    return { success: false, message: '분개장 생성 실패' };
  }
};

export const updateJournalEntry = async (id: number, entry: any): Promise<ApiResponse<JournalEntry>> => {
  try {
    console.log('API 호출 - updateJournalEntry: PUT /journal-entries/' + id, entry);
    const response = await api.put(`/journal-entries/${id}`, entry);
    console.log('API 응답 - updateJournalEntry:', response.data);
    return response.data;
  } catch (error) {
    console.error('updateJournalEntry 에러:', error);
    return { success: false, message: '분개장 수정 실패' };
  }
};

export const deleteJournalEntry = async (id: number): Promise<ApiResponse> => {
  try {
    console.log('API 호출 - deleteJournalEntry: DELETE /journal-entries/' + id);
    const response = await api.delete(`/journal-entries/${id}`);
    console.log('API 응답 - deleteJournalEntry:', response.data);
    return response.data;
  } catch (error) {
    console.error('deleteJournalEntry 에러:', error);
    return { success: false, message: '분개장 삭제 실패' };
  }
};

// 거래처 API
export const getPartners = async (): Promise<ApiResponse<Partner[]>> => {
  try {
    console.log('API 호출 - getPartners: GET /partners');
    const response = await api.get('/partners');
    console.log('API 응답 - getPartners:', response.data);
    return response.data;
  } catch (error) {
    console.error('getPartners 에러:', error);
    return { success: false, message: '거래처 조회 실패' };
  }
};

export const createPartner = async (partner: Partial<Partner>): Promise<ApiResponse<Partner>> => {
  try {
    console.log('API 호출 - createPartner: POST /partners', partner);
    const response = await api.post('/partners', partner);
    console.log('API 응답 - createPartner:', response.data);
    return response.data;
  } catch (error) {
    console.error('createPartner 에러:', error);
    return { success: false, message: '거래처 생성 실패' };
  }
};

export const updatePartner = async (id: number, partner: Partial<Partner>): Promise<ApiResponse<Partner>> => {
  try {
    console.log('API 호출 - updatePartner:', { id, partner });
    const response = await api.put(`/partners/${id}`, partner);
    console.log('API 응답 - updatePartner:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('updatePartner 에러:', error);
    console.error('에러 응답:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || '거래처 수정 실패' 
    };
  }
};

export const deletePartner = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, message: '거래처 삭제 실패' };
  }
};

// 고정자산 API
export const getAssets = async (): Promise<ApiResponse<Asset[]>> => {
  try {
    const response = await api.get('/assets');
    return response.data;
  } catch (error) {
    return { success: false, message: '자산 조회 실패' };
  }
};

export const createAsset = async (asset: Partial<Asset>): Promise<ApiResponse<Asset>> => {
  try {
    const response = await api.post('/assets', asset);
    return response.data;
  } catch (error) {
    return { success: false, message: '자산 생성 실패' };
  }
};

export const updateAsset = async (id: number, asset: Partial<Asset>): Promise<ApiResponse<Asset>> => {
  try {
    const response = await api.put(`/assets/${id}`, asset);
    return response.data;
  } catch (error) {
    return { success: false, message: '자산 수정 실패' };
  }
};

export const deleteAsset = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, message: '자산 삭제 실패' };
  }
};

export const depreciateAssets = async (assetIds: number[]): Promise<ApiResponse<any[]>> => {
  try {
    const response = await api.post('/assets/depreciate', { asset_ids: assetIds });
    return response.data;
  } catch (error) {
    return { success: false, message: '감가상각 실행 실패' };
  }
};

// 세금 API
export const getTaxes = async (): Promise<ApiResponse<Tax[]>> => {
  try {
    const response = await api.get('/taxes');
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 조회 실패' };
  }
};

export const createTax = async (tax: Partial<Tax>): Promise<ApiResponse<Tax>> => {
  try {
    // 코드는 백엔드에서 자동 생성되므로 제외
    const { code, ...taxData } = tax;
    const response = await api.post('/taxes', taxData);
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 생성 실패' };
  }
};

export const updateTax = async (id: number, tax: Partial<Tax>): Promise<ApiResponse<Tax>> => {
  try {
    // 코드는 수정 불가능하므로 제외
    const { code, ...taxData } = tax;
    const response = await api.put(`/taxes/${id}`, taxData);
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 수정 실패' };
  }
};

export const deleteTax = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/taxes/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 삭제 실패' };
  }
};

export const calculateTax = async (supplyAmount: number, taxRate: number): Promise<ApiResponse<TaxCalculation>> => {
  try {
    const response = await api.post('/taxes/calculate', { 
      supply_amount: supplyAmount, 
      tax_rate: taxRate 
    });
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 계산 실패' };
  }
};

// 세금 신고서 API
export const getTaxReports = async (): Promise<ApiResponse<TaxReport[]>> => {
  try {
    const response = await api.get('/tax-reports');
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 신고서 조회 실패' };
  }
};

export const createTaxReport = async (report: Partial<TaxReport>): Promise<ApiResponse<TaxReport>> => {
  try {
    console.log('📥 원본 데이터:', report);
    
    // 백엔드에 보낼 데이터 구조 변환
    const reportData = {
      name: report.name,
      report_type: report.report_type,
      additional_period: report.additional_period,
      tax_ids: report.tax_ids,
      vat_payable: report.vat_payable || 0,
      sale_vat_amount: 0,
      purchase_vat_amount: 0,
      exempt_amount: 0,
      zero_rated_amount: 0,
      withholding_amount: 0,
      state: 'draft'
    };
    
    console.log('🚀 세금 신고서 생성 요청 데이터:', reportData);
    console.log('💰 납부세액 확인:', report.vat_payable, '→', reportData.vat_payable);
    const response = await api.post('/tax-reports', reportData);
    console.log('✅ 세금 신고서 생성 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 세금 신고서 생성 에러:', error);
    return { success: false, message: '세금 신고서 생성 실패' };
  }
};

export const updateTaxReport = async (id: number, report: Partial<TaxReport>): Promise<ApiResponse<TaxReport>> => {
  try {
    console.log('📥 수정 원본 데이터:', report);
    
    // 백엔드에 보낼 데이터 구조 변환
    const reportData = {
      name: report.name,
      report_type: report.report_type,
      additional_period: report.additional_period,
      tax_ids: report.tax_ids,
      vat_payable: report.vat_payable || 0,
      sale_vat_amount: report.sale_vat_amount || 0,
      purchase_vat_amount: report.purchase_vat_amount || 0,
      exempt_amount: report.exempt_amount || 0,
      zero_rated_amount: report.zero_rated_amount || 0,
      withholding_amount: report.withholding_amount || 0
    };
    
    console.log('🚀 세금 신고서 수정 요청 데이터:', reportData);
    console.log('💰 납부세액 확인:', report.vat_payable, '→', reportData.vat_payable);
    const response = await api.put(`/tax-reports/${id}`, reportData);
    console.log('✅ 세금 신고서 수정 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 세금 신고서 수정 에러:', error);
    return { success: false, message: '세금 신고서 수정 실패' };
  }
};

export const deleteTaxReport = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete(`/tax-reports/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, message: '세금 신고서 삭제 실패' };
  }
};

export const generateTaxReportData = async (id: number): Promise<ApiResponse<TaxReport>> => {
  try {
    const response = await api.post(`/tax-reports/${id}/generate`);
    return response.data;
  } catch (error) {
    return { success: false, message: '신고서 데이터 생성 실패' };
  }
};

// 예산 API
export const getBudgets = async (): Promise<ApiResponse<Budget[]>> => {
  try {
    const response = await api.get('/budgets');
    return response.data;
  } catch (error) {
    return { success: false, message: '예산 조회 실패' };
  }
};

// 통화 API
export const getCurrencies = async (): Promise<ApiResponse<Currency[]>> => {
  try {
    const response = await api.get('/currencies');
    return response.data;
  } catch (error) {
    return { success: false, message: '통화 조회 실패' };
  }
};

export const runAutoJournalEntries = async (rules: any[]): Promise<ApiResponse<any[]>> => {
  try {
    const response = await api.post('/auto-journal-entries', { rules });
    return response.data;
  } catch (error) {
    return { success: false, message: '자동분개 실행 실패' };
  }
}; 