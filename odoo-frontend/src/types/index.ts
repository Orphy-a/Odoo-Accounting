// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 계정과목 타입
export interface Account {
  id: number;
  name: string;
  code: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id?: number;
  parent_name?: string;
}

// 분개장 타입
export interface JournalEntry {
  id: number;
  name: string;
  date: string;
  ref?: string;
  amount_total?: number;
  state?: string;
  lines?: JournalLine[];
  line_ids?: JournalLine[];
}

// 분개 라인 타입
export interface JournalLine {
  id: number;
  account_id: number;
  name?: string;
  debit: number;
  credit: number;
  partner_id?: number;
  account_code?: string;
  account_name?: string;
  partner_code?: string;
  partner_name?: string;
}

// 거래처 타입
export interface Partner {
  id: number;
  name: string;
  code?: string;
  type: 'customer' | 'supplier' | 'both';
  email?: string;
  phone?: string;
  active: boolean;
}

// 고정자산 타입
export interface Asset {
  id: number;
  name: string;
  code: string;
  category: string;
  purchase_date?: string;
  purchase_value: number;
  current_value: number;
  depreciation_method: string;
  useful_life?: number;
}

// 예산 타입
export interface Budget {
  id: number;
  name: string;
  fiscal_year: string;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  state: string;
}

// 통화 타입
export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  rate: number;
  active: boolean;
}

// 세금 타입
export interface Tax {
  id: number;
  name: string;
  code?: string; // 백엔드에서 자동 생성
  rate: number;
  type: 'sale' | 'purchase' | 'both';
  active: boolean;
  description?: string;
  effective_date?: string; // 적용 시작일 (YYYY-MM-DD)
  expiry_date?: string;   // 적용 종료일 (YYYY-MM-DD)
  created_at?: string;    // 생성일
  updated_at?: string;    // 수정일
}

// 세금 계산 결과 타입
export interface TaxCalculation {
  supply_amount: number;
  tax_amount: number;
  total_amount: number;
  tax_rate: number;
}

// 세금 신고서 타입
export interface TaxReport {
  id: number;
  name: string;
  date: string; // 생성일
  period_start: string; // 기간 시작일
  period_end: string; // 기간 종료일
  tax_period_name: string; // 세금 기간명 (유형)
  report_type?: 'monthly' | 'quarterly' | 'yearly' | 'half_yearly'; // 신고서 유형
  additional_period?: string; // 추가 기간 (분기/반기/연도)
  tax_ids?: number[]; // 선택된 세금 ID들
  state: 'draft' | 'confirmed' | 'submitted';
  sale_vat_amount: number; // 매출 부가세
  purchase_vat_amount: number; // 매입 부가세
  vat_payable: number; // 납부세액
  exempt_amount: number; // 면세
  zero_rated_amount: number; // 영세율
  withholding_amount: number; // 원천징수
  notes: boolean;
  tax_period_id: number | null;
  selected_taxes?: string[]; // 선택된 세금명들
  created_at?: string;
  submitted_at?: string;
}

// 세금 신고서 상세 타입
export interface TaxReportDetail {
  id: number;
  report_id: number;
  category: 'sales' | 'purchases';
  amount: number;
  tax_amount: number;
  description?: string;
} 