from odoo import http
from odoo.http import request, Response
import json
import logging
from odoo import fields

_logger = logging.getLogger(__name__)

class AccountingAPI(http.Controller):
    
    # ==================== API 테스트 페이지 ====================
    
    @http.route('/api/accounting/test', type='http', auth='user', methods=['GET'], csrf=False)
    def api_test_page(self, **kwargs):
        """API 테스트 페이지"""
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Odoo Accounting API 테스트</title>
            <style>
                body { font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; }
                .api-test-container { padding: 20px; font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; }
                .api-test-section { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .api-test-button { background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; }
                .api-test-button:hover { background-color: #0056b3; }
                .api-result { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; margin-top: 10px; border-radius: 3px; white-space: pre-wrap; font-family: monospace; font-size: 12px; }
                .api-error { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; }
                .api-success { background-color: #d4edda; border-color: #c3e6cb; color: #155724; }
            </style>
        </head>
        <body>
            <div class="api-test-container">
                <h1>Odoo Accounting API 테스트</h1>
                
                <div class="api-test-section">
                    <h3>Health Check</h3>
                    <button class="api-test-button" onclick="testHealth()">Health Check</button>
                    <div id="health-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Chart of Accounts</h3>
                    <button class="api-test-button" onclick="getAccounts()">계정과목 목록 조회</button>
                    <button class="api-test-button" onclick="createAccount()">계정과목 생성</button>
                    <div id="accounts-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Journal Entries</h3>
                    <button class="api-test-button" onclick="getJournalEntries()">분개장 목록 조회</button>
                    <button class="api-test-button" onclick="createJournalEntry()">분개장 생성</button>
                    <div id="journal-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Partners</h3>
                    <button class="api-test-button" onclick="getPartners()">거래처 목록 조회</button>
                    <button class="api-test-button" onclick="createPartner()">거래처 생성</button>
                    <button class="api-test-button" onclick="updatePartner()">거래처 비활성화</button>
                    <button class="api-test-button" onclick="activatePartner()">거래처 활성화</button>
                    <button class="api-test-button" onclick="deletePartner()">거래처 삭제</button>
                    <div id="partners-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Assets</h3>
                    <button class="api-test-button" onclick="getAssets()">고정자산 목록 조회</button>
                    <div id="assets-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Budgets</h3>
                    <button class="api-test-button" onclick="getBudgets()">예산 목록 조회</button>
                    <div id="budgets-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Currencies</h3>
                    <button class="api-test-button" onclick="getCurrencies()">통화 목록 조회</button>
                    <div id="currencies-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Taxes</h3>
                    <button class="api-test-button" onclick="getTaxes()">세금 목록 조회</button>
                    <button class="api-test-button" onclick="createTax()">세금 생성</button>
                    <button class="api-test-button" onclick="computeTax()">세금 계산</button>
                    <div id="taxes-result" class="api-result"></div>
                </div>
                
                <div class="api-test-section">
                    <h3>Tax Reports</h3>
                    <button class="api-test-button" onclick="getTaxReports()">세금 신고서 목록 조회</button>
                    <button class="api-test-button" onclick="createTaxReport()">세금 신고서 생성</button>
                    <button class="api-test-button" onclick="updateTaxReport()">세금 신고서 수정</button>
                    <div id="tax-reports-result" class="api-result"></div>
                </div>
                

            </div>
            
            <script>
                async function makeRequest(url, method = 'GET', data = null) {
                    try {
                        const options = {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        };
                        
                        if (data) {
                            options.body = JSON.stringify(data);
                        }
                        
                        const response = await fetch(url, options);
                        const result = await response.json();
                        return result;
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                }
                
                async function testHealth() {
                    const result = await makeRequest('/api/accounting/health');
                    document.getElementById('health-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('health-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getAccounts() {
                    const result = await makeRequest('/api/accounting/accounts');
                    document.getElementById('accounts-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('accounts-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function createAccount() {
                    const data = {
                        name: '테스트 계정',
                        code: 'TEST001',
                        type: 'asset'
                    };
                    const result = await makeRequest('/api/accounting/accounts', 'POST', data);
                    document.getElementById('accounts-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('accounts-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getJournalEntries() {
                    const result = await makeRequest('/api/accounting/journal-entries');
                    document.getElementById('journal-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('journal-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function createJournalEntry() {
                    // 먼저 계정과목들을 조회
                    const accountsResult = await makeRequest('/api/accounting/accounts');
                    let accountIds = [];
                    if (accountsResult.success && accountsResult.data.length >= 2) {
                        accountIds = [accountsResult.data[0].id, accountsResult.data[1].id];
                    } else {
                        // 계정과목이 없으면 기본 계정 생성
                        await makeRequest('/api/accounting/accounts', 'POST', {
                            name: '자산 계정',
                            code: 'ASSET001',
                            type: 'asset'
                        });
                        await makeRequest('/api/accounting/accounts', 'POST', {
                            name: '부채 계정',
                            code: 'LIAB001',
                            type: 'liability'
                        });
                        // 다시 조회
                        const accountsResult2 = await makeRequest('/api/accounting/accounts');
                        if (accountsResult2.success && accountsResult2.data.length >= 2) {
                            accountIds = [accountsResult2.data[0].id, accountsResult2.data[1].id];
                        }
                    }
                    
                    const data = {
                        name: '테스트 분개',
                        date: '2024-01-01',
                        ref: 'TEST-REF-001',
                        state: 'draft',
                        lines: accountIds.length >= 2 ? [
                            { account_id: accountIds[0], debit: 1000, credit: 0, name: '차변' },
                            { account_id: accountIds[1], debit: 0, credit: 1000, name: '대변' }
                        ] : []
                    };
                    const result = await makeRequest('/api/accounting/journal-entries', 'POST', data);
                    document.getElementById('journal-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('journal-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getPartners() {
                    const result = await makeRequest('/api/accounting/partners');
                    document.getElementById('partners-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('partners-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function createPartner() {
                    const data = {
                        name: '테스트 거래처',
                        code: 'PARTNER001',
                        type: 'customer',
                        email: 'test@example.com',
                        phone: '010-1234-5678'
                    };
                    const result = await makeRequest('/api/accounting/partners', 'POST', data);
                    document.getElementById('partners-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('partners-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function updatePartner() {
                    // 먼저 거래처 목록을 조회하여 첫 번째 거래처의 ID를 가져옴
                    const partnersResult = await makeRequest('/api/accounting/partners');
                    if (!partnersResult.success || partnersResult.data.length === 0) {
                        // 거래처가 없으면 먼저 생성
                        await createPartner();
                        // 다시 조회
                        const partnersResult2 = await makeRequest('/api/accounting/partners');
                        if (!partnersResult2.success || partnersResult2.data.length === 0) {
                            document.getElementById('partners-result').textContent = '거래처를 찾을 수 없습니다.';
                            document.getElementById('partners-result').className = 'api-result api-error';
                            return;
                        }
                        var partnerId = partnersResult2.data[0].id;
                    } else {
                        var partnerId = partnersResult.data[0].id;
                    }
                    
                    // 비활성화 테스트를 위해 active를 false로 설정
                    const data = {
                        name: '수정된 거래처명',
                        code: 'UPDATED001',
                        type: 'both',
                        email: 'updated@example.com',
                        phone: '010-9876-5432',
                        active: false  // 비활성화로 설정
                    };
                    const result = await makeRequest(`/api/accounting/partners/${partnerId}`, 'PUT', data);
                    document.getElementById('partners-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('partners-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function activatePartner() {
                    // 먼저 거래처 목록을 조회하여 첫 번째 거래처의 ID를 가져옴
                    const partnersResult = await makeRequest('/api/accounting/partners');
                    if (!partnersResult.success || partnersResult.data.length === 0) {
                        document.getElementById('partners-result').textContent = '활성화할 거래처가 없습니다.';
                        document.getElementById('partners-result').className = 'api-result api-error';
                        return;
                    }
                    
                    const partnerId = partnersResult.data[0].id;
                    const data = {
                        active: true  // 활성화로 설정
                    };
                    const result = await makeRequest(`/api/accounting/partners/${partnerId}`, 'PUT', data);
                    document.getElementById('partners-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('partners-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function deletePartner() {
                    // 먼저 거래처 목록을 조회하여 첫 번째 거래처의 ID를 가져옴
                    const partnersResult = await makeRequest('/api/accounting/partners');
                    if (!partnersResult.success || partnersResult.data.length === 0) {
                        document.getElementById('partners-result').textContent = '삭제할 거래처가 없습니다.';
                        document.getElementById('partners-result').className = 'api-result api-error';
                        return;
                    }
                    
                    const partnerId = partnersResult.data[0].id;
                    const result = await makeRequest(`/api/accounting/partners/${partnerId}`, 'DELETE');
                    document.getElementById('partners-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('partners-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getAssets() {
                    const result = await makeRequest('/api/accounting/assets');
                    document.getElementById('assets-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('assets-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getBudgets() {
                    const result = await makeRequest('/api/accounting/budgets');
                    document.getElementById('budgets-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('budgets-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getCurrencies() {
                    const result = await makeRequest('/api/accounting/currencies');
                    document.getElementById('currencies-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('currencies-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getTaxes() {
                    const result = await makeRequest('/api/accounting/taxes');
                    document.getElementById('taxes-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('taxes-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function createTax() {
                    const data = {
                        name: '부가가치세',
                        code: 'VAT001',
                        amount: 10.0,
                        amount_type: 'percent',
                        type_tax_use: 'sale',
                        tax_category: 'vat',
                        calculation_method: 'exclusive',
                        is_exempt: false,
                        description: '일반 부가가치세'
                    };
                    const result = await makeRequest('/api/accounting/taxes', 'POST', data);
                    document.getElementById('taxes-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('taxes-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function computeTax() {
                    // 먼저 세금 목록을 조회하여 첫 번째 세금의 ID를 가져옴
                    const taxesResult = await makeRequest('/api/accounting/taxes');
                    if (!taxesResult.success || taxesResult.data.length === 0) {
                        // 세금이 없으면 먼저 생성
                        await createTax();
                        // 다시 조회
                        const taxesResult2 = await makeRequest('/api/accounting/taxes');
                        if (!taxesResult2.success || taxesResult2.data.length === 0) {
                            document.getElementById('taxes-result').textContent = '세금을 찾을 수 없습니다.';
                            document.getElementById('taxes-result').className = 'api-result api-error';
                            return;
                        }
                        var taxId = taxesResult2.data[0].id;
                    } else {
                        var taxId = taxesResult.data[0].id;
                    }
                    
                    const data = {
                        tax_id: taxId,
                        base_amount: 10000,
                        price_unit: 10000,
                        quantity: 1
                    };
                    const result = await makeRequest('/api/accounting/taxes/compute', 'POST', data);
                    document.getElementById('taxes-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('taxes-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function getTaxReports() {
                    const result = await makeRequest('/api/accounting/tax-reports');
                    document.getElementById('tax-reports-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('tax-reports-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function createTaxReport() {
                    // 먼저 세금 목록을 조회하여 세금 ID를 가져옴
                    const taxesResult = await makeRequest('/api/accounting/taxes');
                    let taxIds = [];
                    if (taxesResult.success && taxesResult.data.length > 0) {
                        taxIds = [taxesResult.data[0].id];
                    }
                    
                    const data = {
                        name: "테스트 신고서",
                        report_type: "half_yearly",
                        additional_period: "2024-01",
                        tax_ids: taxIds,
                        vat_payable: 100000,
                        sale_vat_amount: 500000,
                        purchase_vat_amount: 300000,
                        exempt_amount: 100000,
                        zero_rated_amount: 50000,
                        withholding_amount: 50000,
                        state: "draft"
                    };
                    const result = await makeRequest('/api/accounting/tax-reports', 'POST', data);
                    document.getElementById('tax-reports-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('tax-reports-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
                
                async function updateTaxReport() {
                    // 먼저 세금 신고서 목록을 조회하여 첫 번째 신고서의 ID를 가져옴
                    const reportsResult = await makeRequest('/api/accounting/tax-reports');
                    if (!reportsResult.success || reportsResult.data.length === 0) {
                        // 신고서가 없으면 먼저 생성
                        await createTaxReport();
                        // 다시 조회
                        const reportsResult2 = await makeRequest('/api/accounting/tax-reports');
                        if (!reportsResult2.success || reportsResult2.data.length === 0) {
                            document.getElementById('tax-reports-result').textContent = '세금 신고서를 찾을 수 없습니다.';
                            document.getElementById('tax-reports-result').className = 'api-result api-error';
                            return;
                        }
                        var reportId = reportsResult2.data[0].id;
                    } else {
                        var reportId = reportsResult.data[0].id;
                    }
                    
                    const data = {
                        name: "테스트 신고서 (수정)",
                        vat_payable: 200000,
                        sale_vat_amount: 1000000,
                        purchase_vat_amount: 600000,
                        exempt_amount: 200000,
                        zero_rated_amount: 100000,
                        withholding_amount: 100000
                    };
                    const result = await makeRequest(`/api/accounting/tax-reports/${reportId}`, 'PUT', data);
                    document.getElementById('tax-reports-result').textContent = JSON.stringify(result, null, 2);
                    document.getElementById('tax-reports-result').className = result.success ? 'api-result api-success' : 'api-result api-error';
                }
            </script>
        </body>
        </html>
        """
        return Response(html, content_type='text/html')
    
    # ==================== Chart of Accounts API ====================
    
    @http.route('/api/accounting/accounts', type='http', auth='user', methods=['GET'], csrf=False)
    def get_accounts(self, **kwargs):
        """계정과목 목록 조회"""
        try:
            accounts = request.env['custom.account.account'].sudo().search([])
            result = []
            for account in accounts:
                result.append({
                    'id': account.id,
                    'name': account.name,
                    'code': account.code,
                    'type': account.type,
                    'parent_id': account.parent_id.id if account.parent_id else None,
                    'parent_name': account.parent_id.name if account.parent_id else None,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting accounts: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/accounts', type='http', auth='user', methods=['POST'], csrf=False)
    def create_account(self, **kwargs):
        """계정과목 생성"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            account = request.env['custom.account.account'].sudo().create({
                'name': data.get('name'),
                'code': data.get('code'),
                'type': data.get('type'),
                'parent_id': data.get('parent_id'),
            })
            return Response(json.dumps({
                'success': True, 
                'data': {
                    'id': account.id,
                    'name': account.name,
                    'code': account.code,
                    'type': account.type,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error creating account: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/accounts/<int:account_id>', type='http', auth='user', methods=['GET'], csrf=False)
    def get_account(self, account_id, **kwargs):
        """특정 계정과목 조회"""
        try:
            account = request.env['custom.account.account'].sudo().browse(account_id)
            if not account.exists():
                return Response(json.dumps({'success': False, 'error': 'Account not found'}), 
                              content_type='application/json', status=404)
            
            result = {
                'id': account.id,
                'name': account.name,
                'code': account.code,
                'type': account.type,
                'parent_id': account.parent_id.id if account.parent_id else None,
                'child_ids': [child.id for child in account.child_ids],
            }
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting account {account_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/accounts/<int:account_id>', type='http', auth='user', methods=['PUT'], csrf=False)
    def update_account(self, account_id, **kwargs):
        """계정과목 수정"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            account = request.env['custom.account.account'].sudo().browse(account_id)
            if not account.exists():
                return Response(json.dumps({'success': False, 'error': 'Account not found'}), 
                              content_type='application/json', status=404)
            
            account.write({
                'name': data.get('name', account.name),
                'code': data.get('code', account.code),
                'type': data.get('type', account.type),
                'parent_id': data.get('parent_id', account.parent_id.id),
            })
            
            return Response(json.dumps({'success': True, 'message': 'Account updated successfully'}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error updating account {account_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/accounts/<int:account_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_account(self, account_id, **kwargs):
        """계정과목 삭제"""
        try:
            account = request.env['custom.account.account'].sudo().browse(account_id)
            if not account.exists():
                return Response(json.dumps({'success': False, 'error': 'Account not found'}), 
                              content_type='application/json', status=404)
            
            account.unlink()
            return Response(json.dumps({'success': True, 'message': 'Account deleted successfully'}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error deleting account {account_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    # ==================== Journal Entries API ====================
    
    @http.route('/api/accounting/journal-entries', type='http', auth='user', methods=['GET'], csrf=False)
    def get_journal_entries(self, **kwargs):
        """분개장 목록 조회"""
        try:
            entries = request.env['custom.account.move'].sudo().search([])
            result = []
            for entry in entries:
                lines = []
                for line in entry.line_ids:
                    lines.append({
                        'id': line.id,
                        'account_id': line.account_id.id if line.account_id else None,
                        'account_code': line.account_id.code if line.account_id else '',
                        'account_name': line.account_id.name if line.account_id else '',
                        'partner_id': line.partner_id.id if line.partner_id else None,
                        'partner_code': line.partner_id.code if hasattr(line.partner_id, 'code') and line.partner_id else '',
                        'partner_name': line.partner_id.name if line.partner_id else '',
                        'debit': line.debit,
                        'credit': line.credit,
                        'name': line.name,
                    })
                result.append({
                    'id': entry.id,
                    'name': entry.name,
                    'date': entry.date.strftime('%Y-%m-%d') if entry.date else None,
                    'ref': entry.ref,
                    'state': entry.state,
                    'amount_total': entry.amount_total,
                    'lines': lines,
                })
            return Response(json.dumps({'success': True, 'data': result}), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting journal entries: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), content_type='application/json', status=500)
    
    @http.route('/api/accounting/journal-entries', type='http', auth='user', methods=['POST'], csrf=False)
    def create_journal_entry(self, **kwargs):
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            journal = request.env['custom.account.journal'].sudo().search([], limit=1)
            if not journal:
                journal = request.env['custom.account.journal'].sudo().create({
                    'name': 'General Journal',
                    'code': 'GEN',
                    'type': 'general',
                })
            lines = []
            # lines 또는 line_ids 둘 다 지원
            input_lines = data.get('lines', data.get('line_ids', []))
            for line in input_lines:
                lines.append((0, 0, {
                    'account_id': line.get('account_id'),
                    'partner_id': line.get('partner_id'),
                    'name': line.get('name'),
                    'debit': line.get('debit', 0),
                    'credit': line.get('credit', 0),
                }))
            entry = request.env['custom.account.move'].sudo().create({
                'name': data.get('name'),
                'date': data.get('date'),
                'ref': data.get('ref'),
                'journal_id': journal.id,
                'state': data.get('state', 'draft'),
                'line_ids': lines,
            })
            return Response(json.dumps({'success': True, 'data': {'id': entry.id}}), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error creating journal entry: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), content_type='application/json', status=500)
    
    @http.route('/api/accounting/journal-entries/<int:entry_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_journal_entry(self, entry_id, **kwargs):
        try:
            entry = request.env['custom.account.move'].sudo().browse(entry_id)
            if entry.exists():
                entry.unlink()
                return Response(json.dumps({'success': True, 'message': 'Deleted'}), content_type='application/json')
            else:
                return Response(json.dumps({'success': False, 'error': 'Not found'}), content_type='application/json', status=404)
        except Exception as e:
            return Response(json.dumps({'success': False, 'error': str(e)}), content_type='application/json', status=500)
    
    # ==================== Partners API ====================
    
    @http.route('/api/accounting/partners', type='http', auth='user', methods=['GET'], csrf=False)
    def get_partners(self, **kwargs):
        """거래처 목록 조회 (활성/비활성 모두 포함)"""
        try:
            # active=False인 거래처들도 포함하여 모든 거래처 조회
            partners = request.env['custom.account.partner'].sudo().with_context(active_test=False).search([])
            result = []
            for partner in partners:
                result.append({
                    'id': partner.id,
                    'name': partner.name,
                    'code': partner.code,
                    'type': partner.type,
                    'email': partner.email,
                    'phone': partner.phone,
                    'active': partner.active,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting partners: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/partners', type='http', auth='user', methods=['POST'], csrf=False)
    def create_partner(self, **kwargs):
        """거래처 생성"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            partner = request.env['custom.account.partner'].sudo().create({
                'name': data.get('name'),
                'code': data.get('code'),
                'type': data.get('type'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'active': data.get('active', True),
            })
            return Response(json.dumps({
                'success': True, 
                'data': {
                    'id': partner.id,
                    'name': partner.name,
                    'code': partner.code,
                    'type': partner.type,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error creating partner: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/partners/<int:partner_id>', type='http', auth='user', methods=['GET'], csrf=False)
    def get_partner(self, partner_id, **kwargs):
        """특정 거래처 조회 (활성/비활성 모두 조회 가능)"""
        try:
            # active=False인 거래처도 조회할 수 있도록 with_context 사용
            partner = request.env['custom.account.partner'].sudo().with_context(active_test=False).browse(partner_id)
            if not partner.exists():
                return Response(json.dumps({'success': False, 'error': '거래처를 찾을 수 없습니다.'}), 
                              content_type='application/json', status=404)
            
            result = {
                'id': partner.id,
                'name': partner.name,
                'code': partner.code,
                'type': partner.type,
                'email': partner.email,
                'phone': partner.phone,
                'active': partner.active,
            }
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting partner {partner_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/partners/<int:partner_id>', type='http', auth='user', methods=['PUT'], csrf=False)
    def update_partner(self, partner_id, **kwargs):
        """거래처 수정 (활성/비활성 모두 수정 가능)"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            # active=False인 거래처도 수정할 수 있도록 with_context 사용
            partner = request.env['custom.account.partner'].sudo().with_context(active_test=False).browse(partner_id)
            if not partner.exists():
                return Response(json.dumps({'success': False, 'error': '거래처를 찾을 수 없습니다.'}), 
                              content_type='application/json', status=404)
            
            # 수정할 필드들만 업데이트
            update_fields = {}
            if 'name' in data:
                update_fields['name'] = data['name']
            if 'code' in data:
                update_fields['code'] = data['code']
            if 'type' in data:
                update_fields['type'] = data['type']
            if 'email' in data:
                update_fields['email'] = data['email']
            if 'phone' in data:
                update_fields['phone'] = data['phone']
            if 'active' in data:
                update_fields['active'] = data['active']
            
            partner.write(update_fields)
            
            return Response(json.dumps({
                'success': True, 
                'message': '거래처가 성공적으로 수정되었습니다.',
                'data': {
                    'id': partner.id,
                    'name': partner.name,
                    'code': partner.code,
                    'type': partner.type,
                    'email': partner.email,
                    'phone': partner.phone,
                    'active': partner.active,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error updating partner {partner_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/partners/<int:partner_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_partner(self, partner_id, **kwargs):
        """거래처 삭제"""
        try:
            partner = request.env['custom.account.partner'].sudo().browse(partner_id)
            if not partner.exists():
                return Response(json.dumps({'success': False, 'error': '거래처를 찾을 수 없습니다.'}), 
                              content_type='application/json', status=404)
            
            partner.unlink()
            return Response(json.dumps({'success': True, 'message': '거래처가 성공적으로 삭제되었습니다.'}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error deleting partner {partner_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    # ==================== Assets API ====================
    
    @http.route('/api/accounting/assets', type='http', auth='user', methods=['GET'], csrf=False)
    def get_assets(self, **kwargs):
        """고정자산 목록 조회"""
        try:
            assets = request.env['custom.account.asset'].sudo().search([])
            result = []
            for asset in assets:
                # 감가상각방법 한글 변환
                if asset.depreciation_method == 'linear':
                    depreciation_method_kr = '정액법'
                elif asset.depreciation_method == 'degressive':
                    depreciation_method_kr = '정률법'
                else:
                    depreciation_method_kr = asset.depreciation_method
                result.append({
                    'id': asset.id,
                    'name': asset.name,
                    'code': asset.code,
                    'purchase_date': asset.purchase_date.strftime('%Y-%m-%d') if asset.purchase_date else None,
                    'purchase_value': asset.value,
                    'current_value': asset.value,
                    'depreciation_method': depreciation_method_kr,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting assets: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/assets', type='http', auth='user', methods=['POST'], csrf=False)
    def create_asset(self, **kwargs):
        """고정자산 등록(생성) API"""
        try:
            import json
            data = {}
            if request.httprequest.data:
                try:
                    data = json.loads(request.httprequest.data.decode('utf-8'))
                except Exception:
                    data = {}
            if not data and hasattr(request, 'jsonrequest'):
                data = request.jsonrequest or {}

            name = data.get('name')
            purchase_date = data.get('purchase_date')
            purchase_value = data.get('purchase_value')
            depreciation_method = data.get('depreciation_method')

            # 필수값 체크
            if not name:
                return Response(json.dumps({'success': False, 'error': '필수 필드 누락: name'}), content_type='application/json', status=400)
            if not purchase_date:
                return Response(json.dumps({'success': False, 'error': '필수 필드 누락: purchase_date'}), content_type='application/json', status=400)
            if purchase_value is None:
                return Response(json.dumps({'success': False, 'error': '필수 필드 누락: purchase_value'}), content_type='application/json', status=400)
            if not depreciation_method:
                return Response(json.dumps({'success': False, 'error': '필수 필드 누락: depreciation_method'}), content_type='application/json', status=400)

            # 코드 자동증가(시퀀스) 처리
            last_asset = request.env['custom.account.asset'].sudo().search([], order='id desc', limit=1)
            if last_asset and last_asset.code and last_asset.code.isdigit():
                next_code = str(int(last_asset.code) + 1).zfill(5)
            else:
                next_code = '00001'

            # Odoo 모델 필드명 매핑
            asset_vals = {
                'name': name,
                'code': next_code,
                'purchase_date': purchase_date,
                'value': purchase_value,  # value 필드에만 저장
                'depreciation_method': 'linear' if depreciation_method == '정액법' else 'degressive',
            }

            asset_model = request.env['custom.account.asset']
            asset = asset_model.sudo().create(asset_vals)

            return Response(json.dumps({
                'success': True,
                'data': {
                    'id': asset.id,
                    'name': asset.name,
                    'purchase_date': asset.purchase_date.strftime('%Y-%m-%d') if asset.purchase_date else None,
                    'purchase_value': asset.value,
                    'depreciation_method': '정액법' if asset.depreciation_method == 'linear' else '정률법',
                    'current_value': asset.value
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error creating asset: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), content_type='application/json', status=500)
    
    @http.route('/api/accounting/assets/<int:asset_id>', type='http', auth='user', methods=['PUT'], csrf=False)
    def update_asset(self, asset_id, **kwargs):
        """고정자산 수정 API"""
        try:
            import json
            data = kwargs
            if not data and hasattr(request, 'jsonrequest') and request.jsonrequest:
                data = request.jsonrequest
            elif not data and hasattr(request, 'httprequest') and request.httprequest.data:
                try:
                    data = json.loads(request.httprequest.data.decode('utf-8'))
                except Exception:
                    data = {}
            asset = request.env['custom.account.asset'].sudo().browse(asset_id)
            if not asset.exists():
                return Response(json.dumps({'success': False, 'error': '자산을 찾을 수 없습니다.'}), content_type='application/json', status=404)
            update_fields = {}
            for field in ['name', 'code', 'purchase_date', 'value', 'depreciation_method', 'useful_life', 'residual_value', 'active']:
                if field in data:
                    update_fields[field] = data[field]
            asset.write(update_fields)
            return Response(json.dumps({'success': True, 'data': {'id': asset.id}}), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error updating asset: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), content_type='application/json', status=500)

    @http.route('/api/accounting/assets/<int:asset_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_asset(self, asset_id, **kwargs):
        """고정자산 삭제 API"""
        try:
            asset = request.env['custom.account.asset'].sudo().browse(asset_id)
            if not asset.exists():
                return Response(json.dumps({'success': False, 'error': '자산을 찾을 수 없습니다.'}), content_type='application/json', status=404)
            asset.unlink()
            return Response(json.dumps({'success': True, 'message': '자산이 삭제되었습니다.'}), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error deleting asset: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), content_type='application/json', status=500)
    
    @http.route('/api/accounting/assets/depreciate', type='json', auth='user', methods=['POST'], csrf=False)
    def depreciate_assets(self, **kwargs):
        """감가상각 자동 계산 및 회계 반영 API (정액법/정률법, 취득일/내용연수/실행일/월단위 감가상각)"""
        try:
            import json
            from dateutil.relativedelta import relativedelta
            # POST body 파싱 보완
            if kwargs:
                data = kwargs
            elif hasattr(request, 'jsonrequest') and request.jsonrequest:
                data = request.jsonrequest
            elif hasattr(request, 'httprequest') and request.httprequest.data:
                try:
                    data = json.loads(request.httprequest.data.decode('utf-8'))
                except Exception:
                    data = {}
            else:
                data = {}
            asset_ids = data.get('asset_ids', [])
            results = []
            Asset = request.env['custom.account.asset'].sudo()
            today = fields.Date.today()
            for idx, asset_id in enumerate(asset_ids):
                asset = Asset.browse(asset_id)
                if not asset.exists():
                    continue
                purchase_value = asset.value or 0
                useful_life = asset.useful_life or 1
                residual_value = asset.residual_value or 0
                depreciation_method = asset.depreciation_method
                purchase_date = asset.purchase_date
                accumulated_depr = 0  # 실제 누적감가상각은 별도 관리 필요, 여기선 0으로 가정

                if not purchase_date or purchase_date > today:
                    results.append({
                        'asset_id': asset_id,
                        'depreciation_amount': 0,
                        'date': today.strftime('%Y-%m-%d'),
                        'journal_entry': None,
                        'reason': "취득일이 미래이거나 없음",
                        'useful_life': useful_life
                    })
                    continue

                # 감가상각 종료일 계산
                end_date = purchase_date + relativedelta(years=useful_life)
                if today < purchase_date or today > end_date:
                    results.append({
                        'asset_id': asset_id,
                        'depreciation_amount': 0,
                        'date': today.strftime('%Y-%m-%d'),
                        'journal_entry': None,
                        'reason': "감가상각 기간 아님",
                        'useful_life': useful_life
                    })
                    continue

                # 월 단위 감가상각: 취득일~오늘까지 경과한 월수 계산
                months_passed = (today.year - purchase_date.year) * 12 + (today.month - purchase_date.month)
                total_months = useful_life * 12
                months_to_depreciate = min(months_passed + 1, total_months)  # +1: 이번달 포함

                # 감가상각금액(월)
                if depreciation_method == 'linear':
                    monthly_amount = (purchase_value - residual_value) / total_months
                elif depreciation_method == 'degressive':
                    rate = 1.0 / useful_life
                    monthly_amount = ((purchase_value - accumulated_depr) * rate) / 12
                else:
                    monthly_amount = 0

                monthly_amount = max(0, round(monthly_amount, 2))

                # 각 월별 감가상각 결과 반환
                for m in range(months_to_depreciate):
                    dep_date = (purchase_date + relativedelta(months=m)).strftime('%Y-%m-%d')
                    journal_ref = f"JV{dep_date.replace('-', '')}-{str(idx+1).zfill(3)}"
                    results.append({
                        'asset_id': asset_id,
                        'depreciation_amount': monthly_amount,
                        'date': dep_date,
                        'journal_entry': {
                            'ref': journal_ref,
                            'lines': [
                                { 'account_name': '감가상각비', 'debit': monthly_amount, 'credit': 0 },
                                { 'account_name': '감가상각누계액', 'debit': 0, 'credit': monthly_amount }
                            ]
                        },
                        'reason': f"{m+1}회차 감가상각",
                        'useful_life': useful_life
                    })
            return {
                'success': True,
                'data': results
            }
        except Exception as e:
            _logger.error(f"Error in depreciate_assets: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== Budget API ====================
    
    @http.route('/api/accounting/budgets', type='http', auth='user', methods=['GET'], csrf=False)
    def get_budgets(self, **kwargs):
        """예산 목록 조회"""
        try:
            budgets = request.env['custom.account.budget'].sudo().search([])
            result = []
            for budget in budgets:
                result.append({
                    'id': budget.id,
                    'name': budget.name,
                    'fiscal_year': budget.fiscal_year,
                    'amount': budget.amount,
                    'spent_amount': budget.spent_amount,
                    'remaining_amount': budget.remaining_amount,
                    'state': budget.state,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting budgets: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    # ==================== Currency API ====================
    
    @http.route('/api/accounting/currencies', type='http', auth='user', methods=['GET'], csrf=False)
    def get_currencies(self, **kwargs):
        """통화 목록 조회"""
        try:
            currencies = request.env['custom.account.currency'].sudo().search([])
            result = []
            for currency in currencies:
                result.append({
                    'id': currency.id,
                    'name': currency.name,
                    'code': currency.code,
                    'symbol': currency.symbol,
                    'rate': currency.rate,
                    'active': currency.active,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting currencies: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    # ==================== Taxes API ====================
    
    @http.route('/api/accounting/taxes', type='http', auth='user', methods=['GET'], csrf=False)
    def get_taxes(self, **kwargs):
        """세금 목록 조회"""
        try:
            taxes = request.env['custom.account.tax'].sudo().search([])
            result = []
            for tax in taxes:
                result.append({
                    'id': tax.id,
                    'name': tax.name,
                    'code': tax.code,
                    'rate': tax.amount,
                    'type': tax.type_tax_use,
                    'active': tax.active,
                    'description': tax.description,
                    'effective_date': tax.effective_date.strftime('%Y-%m-%d') if tax.effective_date else None,
                    'expiry_date': tax.expiry_date.strftime('%Y-%m-%d') if tax.expiry_date else None,
                    'created_at': tax.created_at.strftime('%Y-%m-%d %H:%M:%S') if tax.created_at else None,
                    'updated_at': tax.updated_at.strftime('%Y-%m-%d %H:%M:%S') if tax.updated_at else None,
                    # 추가 정보 (필요시 사용)
                    'amount_type': tax.amount_type,
                    'tax_category': tax.tax_category,
                    'calculation_method': tax.calculation_method,
                    'is_exempt': tax.is_exempt,
                    'exempt_reason': tax.exempt_reason,
                    'account_id': tax.account_id.id if tax.account_id else None,
                    'account_name': tax.account_id.name if tax.account_id else '',
                    'refund_account_id': tax.refund_account_id.id if tax.refund_account_id else None,
                    'refund_account_name': tax.refund_account_id.name if tax.refund_account_id else '',
                    'tax_group_id': tax.tax_group_id.id if tax.tax_group_id else None,
                    'tax_group_name': tax.tax_group_id.name if tax.tax_group_id else '',
                    'report_frequency': tax.report_frequency,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting taxes: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/taxes', type='http', auth='user', methods=['POST'], csrf=False)
    def create_tax(self, **kwargs):
        """세금 생성"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            
            # 필수 필드 검증
            if not data.get('name'):
                return Response(json.dumps({'success': False, 'error': '세금명은 필수입니다.'}), 
                              content_type='application/json', status=400)
            
            # 세금 데이터 준비 (코드는 자동 생성되므로 제외)
            tax_vals = {
                'name': data.get('name'),
                'amount': data.get('rate', 10.0),
                'amount_type': data.get('amount_type', 'percent'),
                'type_tax_use': data.get('type', 'sale'),
                'tax_category': data.get('tax_category', 'vat'),
                'calculation_method': data.get('calculation_method', 'exclusive'),
                'is_exempt': data.get('is_exempt', False),
                'exempt_reason': data.get('exempt_reason'),
                'effective_date': data.get('effective_date'),
                'expiry_date': data.get('expiry_date'),
                'account_id': data.get('account_id'),
                'refund_account_id': data.get('refund_account_id'),
                'tax_group_id': data.get('tax_group_id'),
                'report_frequency': data.get('report_frequency', 'monthly'),
                'description': data.get('description'),
                'active': data.get('active', True),
            }
            
            # 코드가 제공된 경우에만 포함 (자동 생성 우선)
            if data.get('code'):
                tax_vals['code'] = data.get('code')
            
            tax = request.env['custom.account.tax'].sudo().create(tax_vals)
            
            return Response(json.dumps({
                'success': True, 
                'data': {
                    'id': tax.id,
                    'name': tax.name,
                    'code': tax.code,
                    'rate': tax.amount,
                    'type': tax.type_tax_use,
                    'active': tax.active,
                    'description': tax.description,
                    'effective_date': tax.effective_date.strftime('%Y-%m-%d') if tax.effective_date else None,
                    'expiry_date': tax.expiry_date.strftime('%Y-%m-%d') if tax.expiry_date else None,
                    'created_at': tax.created_at.strftime('%Y-%m-%d %H:%M:%S') if tax.created_at else None,
                    'updated_at': tax.updated_at.strftime('%Y-%m-%d %H:%M:%S') if tax.updated_at else None,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error creating tax: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/taxes/<int:tax_id>', type='http', auth='user', methods=['GET'], csrf=False)
    def get_tax(self, tax_id, **kwargs):
        """특정 세금 조회"""
        try:
            tax = request.env['custom.account.tax'].sudo().browse(tax_id)
            if not tax.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax not found'}), 
                              content_type='application/json', status=404)
            
            result = {
                'id': tax.id,
                'name': tax.name,
                'code': tax.code,
                'rate': tax.amount,
                'type': tax.type_tax_use,
                'active': tax.active,
                'description': tax.description,
                'effective_date': tax.effective_date.strftime('%Y-%m-%d') if tax.effective_date else None,
                'expiry_date': tax.expiry_date.strftime('%Y-%m-%d') if tax.expiry_date else None,
                'created_at': tax.created_at.strftime('%Y-%m-%d %H:%M:%S') if tax.created_at else None,
                'updated_at': tax.updated_at.strftime('%Y-%m-%d %H:%M:%S') if tax.updated_at else None,
                # 추가 정보 (필요시 사용)
                'amount_type': tax.amount_type,
                'tax_category': tax.tax_category,
                'calculation_method': tax.calculation_method,
                'is_exempt': tax.is_exempt,
                'exempt_reason': tax.exempt_reason,
                'account_id': tax.account_id.id if tax.account_id else None,
                'account_name': tax.account_id.name if tax.account_id else '',
                'refund_account_id': tax.refund_account_id.id if tax.refund_account_id else None,
                'refund_account_name': tax.refund_account_id.name if tax.refund_account_id else '',
                'tax_group_id': tax.tax_group_id.id if tax.tax_group_id else None,
                'tax_group_name': tax.tax_group_id.name if tax.tax_group_id else '',
                'report_frequency': tax.report_frequency,
            }
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting tax {tax_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/taxes/<int:tax_id>', type='http', auth='user', methods=['PUT'], csrf=False)
    def update_tax(self, tax_id, **kwargs):
        """세금 수정"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            tax = request.env['custom.account.tax'].sudo().browse(tax_id)
            if not tax.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax not found'}), 
                              content_type='application/json', status=404)
            
            update_fields = {}
            # 프론트엔드 호환성을 위한 필드 매핑
            field_mapping = {
                'name': 'name',
                'code': 'code',
                'rate': 'amount',
                'amount': 'amount',
                'amount_type': 'amount_type',
                'type': 'type_tax_use',
                'type_tax_use': 'type_tax_use',
                'tax_category': 'tax_category',
                'calculation_method': 'calculation_method',
                'is_exempt': 'is_exempt',
                'exempt_reason': 'exempt_reason',
                'effective_date': 'effective_date',
                'expiry_date': 'expiry_date',
                'account_id': 'account_id',
                'refund_account_id': 'refund_account_id',
                'tax_group_id': 'tax_group_id',
                'report_frequency': 'report_frequency',
                'description': 'description',
                'active': 'active',
            }
            
            for frontend_field, backend_field in field_mapping.items():
                if frontend_field in data:
                    update_fields[backend_field] = data[frontend_field]
            
            tax.write(update_fields)
            
            return Response(json.dumps({
                'success': True, 
                'message': 'Tax updated successfully',
                'data': {
                    'id': tax.id,
                    'name': tax.name,
                    'code': tax.code,
                    'rate': tax.amount,
                    'type': tax.type_tax_use,
                    'active': tax.active,
                    'description': tax.description,
                    'effective_date': tax.effective_date.strftime('%Y-%m-%d') if tax.effective_date else None,
                    'expiry_date': tax.expiry_date.strftime('%Y-%m-%d') if tax.expiry_date else None,
                    'created_at': tax.created_at.strftime('%Y-%m-%d %H:%M:%S') if tax.created_at else None,
                    'updated_at': tax.updated_at.strftime('%Y-%m-%d %H:%M:%S') if tax.updated_at else None,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error updating tax {tax_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/taxes/<int:tax_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_tax(self, tax_id, **kwargs):
        """세금 삭제"""
        try:
            tax = request.env['custom.account.tax'].sudo().browse(tax_id)
            if not tax.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax not found'}), 
                              content_type='application/json', status=404)
            
            tax.unlink()
            return Response(json.dumps({'success': True, 'message': 'Tax deleted successfully'}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error deleting tax {tax_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/taxes/compute', type='http', auth='user', methods=['POST'], csrf=False)
    def compute_tax(self, **kwargs):
        """세금 계산"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            tax_id = data.get('tax_id')
            base_amount = data.get('base_amount', 0.0)
            price_unit = data.get('price_unit', 0.0)
            quantity = data.get('quantity', 1.0)
            
            if not tax_id:
                return Response(json.dumps({'success': False, 'error': 'Tax ID is required'}), 
                              content_type='application/json', status=400)
            
            tax = request.env['custom.account.tax'].sudo().browse(tax_id)
            if not tax.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax not found'}), 
                              content_type='application/json', status=404)
            
            result = tax.compute_all(base_amount, price_unit, quantity)
            
            return Response(json.dumps({
                'success': True, 
                'data': {
                    'tax_id': tax_id,
                    'base_amount': base_amount,
                    'tax_amount': result['tax'],
                    'total_amount': result['total'],
                    'calculation_method': tax.calculation_method,
                    'tax_rate': tax.amount,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error computing tax: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                                                     content_type='application/json', status=500)
    
    # ==================== Tax Reports API ====================
    
    @http.route('/api/accounting/tax-reports', type='http', auth='user', methods=['GET'], csrf=False)
    def get_tax_reports(self, **kwargs):
        """세금 신고서 목록 조회"""
        try:
            reports = request.env['custom.account.tax.report'].sudo().search([])
            result = []
            for report in reports:
                # 선택된 세금들의 이름 목록
                selected_taxes = []
                if report.tax_ids:
                    selected_taxes = [tax.name for tax in report.tax_ids]
                
                result.append({
                    'id': report.id,
                    'name': report.name,
                    'date': report.date.strftime('%Y-%m-%d') if report.date else None,
                    'period_start': report.period_start.strftime('%Y-%m-%d') if report.period_start else None,
                    'period_end': report.period_end.strftime('%Y-%m-%d') if report.period_end else None,
                    'tax_period_name': report.tax_period_id.name if report.tax_period_id else '',
                    'report_type': report.report_type,
                    'additional_period': report.additional_period,
                    'tax_ids': [tax.id for tax in report.tax_ids] if report.tax_ids else [],
                    'state': report.state,
                    'sale_vat_amount': report.sale_vat_amount,
                    'purchase_vat_amount': report.purchase_vat_amount,
                    'vat_payable': report.vat_payable,
                    'exempt_amount': report.exempt_amount,
                    'zero_rated_amount': report.zero_rated_amount,
                    'withholding_amount': report.withholding_amount,
                    'notes': report.notes or False,
                    'tax_period_id': report.tax_period_id.id if report.tax_period_id else None,
                    'selected_taxes': selected_taxes,
                    'created_at': report.create_date.strftime('%Y-%m-%dT%H:%M:%SZ') if report.create_date else None,
                    'submitted_at': report.submitted_at.strftime('%Y-%m-%dT%H:%M:%SZ') if report.submitted_at else None,
                })
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting tax reports: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/tax-reports', type='http', auth='user', methods=['POST'], csrf=False)
    def create_tax_report(self, **kwargs):
        """세금 신고서 생성"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            _logger.info(f"Creating tax report with data: {data}")
            
            # 필수 필드 검증 (더 유연하게)
            if not data.get('name'):
                return Response(json.dumps({'success': False, 'error': '신고서명은 필수입니다.'}), 
                              content_type='application/json', status=400)
            
            # 기간 필드는 선택적으로 처리
            period_start = data.get('period_start')
            period_end = data.get('period_end')
            
            # 기간이 없으면 현재 날짜 기준으로 설정
            if not period_start:
                period_start = fields.Date.today()
            if not period_end:
                period_end = fields.Date.today()
            
            report_vals = {
                'name': data.get('name'),
                'date': data.get('date', fields.Date.today()),
                'period_start': period_start,
                'period_end': period_end,
                'report_type': data.get('report_type', 'monthly'),
                'additional_period': data.get('additional_period'),
                'sale_vat_amount': data.get('sale_vat_amount', 0.0),
                'purchase_vat_amount': data.get('purchase_vat_amount', 0.0),
                'exempt_amount': data.get('exempt_amount', 0.0),
                'zero_rated_amount': data.get('zero_rated_amount', 0.0),
                'withholding_amount': data.get('withholding_amount', 0.0),
                'state': data.get('state', 'draft'),
                'notes': data.get('notes'),
                'tax_period_id': data.get('tax_period_id'),
            }
            
            # 세금 목록 처리
            if data.get('tax_ids'):
                report_vals['tax_ids'] = [(6, 0, data.get('tax_ids'))]
            
            report = request.env['custom.account.tax.report'].sudo().create(report_vals)
            
            # vat_payable이 제공된 경우 직접 설정
            if data.get('vat_payable') is not None:
                report.write({'vat_payable': data.get('vat_payable')})
            else:
                # 자동 계산된 vat_payable 사용
                report._compute_vat_payable()
            
            return Response(json.dumps({
                'success': True, 
                'data': {
                    'id': report.id,
                    'name': report.name,
                    'date': report.date.strftime('%Y-%m-%d') if report.date else None,
                    'period_start': report.period_start.strftime('%Y-%m-%d') if report.period_start else None,
                    'period_end': report.period_end.strftime('%Y-%m-%d') if report.period_end else None,
                    'tax_period_name': report.tax_period_id.name if report.tax_period_id else '',
                    'report_type': report.report_type,
                    'additional_period': report.additional_period,
                    'tax_ids': [tax.id for tax in report.tax_ids] if report.tax_ids else [],
                    'state': report.state,
                    'sale_vat_amount': report.sale_vat_amount,
                    'purchase_vat_amount': report.purchase_vat_amount,
                    'vat_payable': report.vat_payable,
                    'exempt_amount': report.exempt_amount,
                    'zero_rated_amount': report.zero_rated_amount,
                    'withholding_amount': report.withholding_amount,
                    'notes': report.notes or False,
                    'tax_period_id': report.tax_period_id.id if report.tax_period_id else None,
                    'selected_taxes': [tax.name for tax in report.tax_ids] if report.tax_ids else [],
                    'created_at': report.create_date.strftime('%Y-%m-%dT%H:%M:%SZ') if report.create_date else None,
                    'submitted_at': report.submitted_at.strftime('%Y-%m-%dT%H:%M:%SZ') if report.submitted_at else None,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error creating tax report: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/tax-reports/<int:report_id>', type='http', auth='user', methods=['GET'], csrf=False)
    def get_tax_report(self, report_id, **kwargs):
        """특정 세금 신고서 조회"""
        try:
            report = request.env['custom.account.tax.report'].sudo().browse(report_id)
            if not report.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax report not found'}), 
                              content_type='application/json', status=404)
            
            result = {
                'id': report.id,
                'name': report.name,
                'date': report.date.strftime('%Y-%m-%d') if report.date else None,
                'period_start': report.period_start.strftime('%Y-%m-%d') if report.period_start else None,
                'period_end': report.period_end.strftime('%Y-%m-%d') if report.period_end else None,
                'tax_period_name': report.tax_period_id.name if report.tax_period_id else '',
                'report_type': report.report_type,
                'additional_period': report.additional_period,
                'tax_ids': [tax.id for tax in report.tax_ids] if report.tax_ids else [],
                'state': report.state,
                'sale_vat_amount': report.sale_vat_amount,
                'purchase_vat_amount': report.purchase_vat_amount,
                'vat_payable': report.vat_payable,
                'exempt_amount': report.exempt_amount,
                'zero_rated_amount': report.zero_rated_amount,
                'withholding_amount': report.withholding_amount,
                'notes': report.notes or False,
                'tax_period_id': report.tax_period_id.id if report.tax_period_id else None,
                'selected_taxes': [tax.name for tax in report.tax_ids] if report.tax_ids else [],
                'created_at': report.create_date.strftime('%Y-%m-%dT%H:%M:%SZ') if report.create_date else None,
                'submitted_at': report.submitted_at.strftime('%Y-%m-%dT%H:%M:%SZ') if report.submitted_at else None,
            }
            return Response(json.dumps({'success': True, 'data': result}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error getting tax report {report_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/tax-reports/<int:report_id>', type='http', auth='user', methods=['PUT'], csrf=False)
    def update_tax_report(self, report_id, **kwargs):
        """세금 신고서 수정"""
        try:
            data = json.loads(request.httprequest.data.decode('utf-8'))
            report = request.env['custom.account.tax.report'].sudo().browse(report_id)
            if not report.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax report not found'}), 
                              content_type='application/json', status=404)
            
            update_fields = {}
            for field in ['name', 'date', 'period_start', 'period_end', 'report_type', 
                         'additional_period', 'sale_vat_amount', 'purchase_vat_amount', 
                         'exempt_amount', 'zero_rated_amount', 'withholding_amount', 
                         'state', 'notes', 'tax_period_id']:
                if field in data:
                    update_fields[field] = data[field]
            
            # 세금 목록 처리
            if 'tax_ids' in data:
                update_fields['tax_ids'] = [(6, 0, data.get('tax_ids', []))]
            
            report.write(update_fields)
            
            # vat_payable이 제공된 경우 직접 설정, 아니면 자동 계산
            if data.get('vat_payable') is not None:
                report.write({'vat_payable': data.get('vat_payable')})
            else:
                # 자동 계산된 vat_payable 사용
                report._compute_vat_payable()
            
            return Response(json.dumps({
                'success': True, 
                'message': 'Tax report updated successfully',
                'data': {
                    'id': report.id,
                    'name': report.name,
                    'date': report.date.strftime('%Y-%m-%d') if report.date else None,
                    'period_start': report.period_start.strftime('%Y-%m-%d') if report.period_start else None,
                    'period_end': report.period_end.strftime('%Y-%m-%d') if report.period_end else None,
                    'tax_period_name': report.tax_period_id.name if report.tax_period_id else '',
                    'report_type': report.report_type,
                    'additional_period': report.additional_period,
                    'tax_ids': [tax.id for tax in report.tax_ids] if report.tax_ids else [],
                    'state': report.state,
                    'sale_vat_amount': report.sale_vat_amount,
                    'purchase_vat_amount': report.purchase_vat_amount,
                    'vat_payable': report.vat_payable,
                    'exempt_amount': report.exempt_amount,
                    'zero_rated_amount': report.zero_rated_amount,
                    'withholding_amount': report.withholding_amount,
                    'notes': report.notes or False,
                    'tax_period_id': report.tax_period_id.id if report.tax_period_id else None,
                    'selected_taxes': [tax.name for tax in report.tax_ids] if report.tax_ids else [],
                    'created_at': report.create_date.strftime('%Y-%m-%dT%H:%M:%SZ') if report.create_date else None,
                    'submitted_at': report.submitted_at.strftime('%Y-%m-%dT%H:%M:%SZ') if report.submitted_at else None,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error updating tax report {report_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/tax-reports/<int:report_id>', type='http', auth='user', methods=['DELETE'], csrf=False)
    def delete_tax_report(self, report_id, **kwargs):
        """세금 신고서 삭제"""
        try:
            report = request.env['custom.account.tax.report'].sudo().browse(report_id)
            if not report.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax report not found'}), 
                              content_type='application/json', status=404)
            
            report.unlink()
            return Response(json.dumps({'success': True, 'message': 'Tax report deleted successfully'}), 
                          content_type='application/json')
        except Exception as e:
            _logger.error(f"Error deleting tax report {report_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/tax-reports/<int:report_id>/confirm', type='http', auth='user', methods=['POST'], csrf=False)
    def confirm_tax_report(self, report_id, **kwargs):
        """세금 신고서 확정"""
        try:
            report = request.env['custom.account.tax.report'].sudo().browse(report_id)
            if not report.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax report not found'}), 
                              content_type='application/json', status=404)
            
            report.action_confirm()
            
            return Response(json.dumps({
                'success': True, 
                'message': 'Tax report confirmed successfully',
                'data': {
                    'id': report.id,
                    'state': report.state,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error confirming tax report {report_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    @http.route('/api/accounting/tax-reports/<int:report_id>/submit', type='http', auth='user', methods=['POST'], csrf=False)
    def submit_tax_report(self, report_id, **kwargs):
        """세금 신고서 제출"""
        try:
            report = request.env['custom.account.tax.report'].sudo().browse(report_id)
            if not report.exists():
                return Response(json.dumps({'success': False, 'error': 'Tax report not found'}), 
                              content_type='application/json', status=404)
            
            report.action_submit()
            
            return Response(json.dumps({
                'success': True, 
                'message': 'Tax report submitted successfully',
                'data': {
                    'id': report.id,
                    'state': report.state,
                }
            }), content_type='application/json')
        except Exception as e:
            _logger.error(f"Error submitting tax report {report_id}: {str(e)}")
            return Response(json.dumps({'success': False, 'error': str(e)}), 
                          content_type='application/json', status=500)
    
    # ==================== Health Check API ====================
    
    @http.route('/api/accounting/health', type='http', auth='none', methods=['GET'], csrf=False)
    def health_check(self, **kwargs):
        """API 상태 확인"""
        return Response(json.dumps({
            'success': True, 
            'message': 'Odoo Accounting API is running',
            'version': '1.0'
        }), content_type='application/json') 

    @http.route('/api/accounting/auto-journal-entries', type='json', auth='user', methods=['POST'], csrf=False)
    def auto_journal_entries(self, **kwargs):
        """자동분개(rule-based) 엔드포인트"""
        try:
            # JSON body 파싱
            data = kwargs or request.jsonrequest
            rules = data.get('rules', [])
            results = []
            for idx, rule in enumerate(rules):
                # 예시: 조건/계정/금액/거래처/적요 등 rule 기반으로 분개 생성
                # 실제 업무 규칙에 맞게 로직 추가 필요
                result = {
                    'date': fields.Date.today().strftime('%Y-%m-%d'),
                    'ref': f"AUTO{str(idx+1).zfill(4)}",
                    'account_name': rule.get('account', ''),
                    'amount': rule.get('amount', 0),
                    'partner_name': rule.get('partner', ''),
                    'memo': rule.get('condition', '자동분개 결과'),
                }
                results.append(result)
            return {
                'success': True,
                'data': results
            }
        except Exception as e:
            _logger.error(f"Error in auto-journal-entries: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 