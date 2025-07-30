from odoo import models, fields, api
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)

class CustomAccountTaxGroup(models.Model):
    _name = 'custom.account.tax.group'
    _description = 'Tax Group'
    
    name = fields.Char('Group Name', required=True)
    code = fields.Char('Group Code', required=True)
    country_id = fields.Many2one('res.country', string='Country')
    tax_ids = fields.One2many('custom.account.tax', 'tax_group_id', string='Taxes')
    
    # 한국 부가세 그룹 설정
    is_korean_vat = fields.Boolean('한국 부가세 그룹', default=False)
    vat_type = fields.Selection([
        ('general', '일반과세자'),
        ('simple', '간이과세자'),
        ('exempt', '면세사업자'),
    ], default='general')
    
    # 세금 신고 기간
    reporting_period = fields.Selection([
        ('monthly', '월간'),
        ('quarterly', '분기'),
        ('half_yearly', '반기'),
        ('yearly', '연간'),
    ], default='monthly')
    
    description = fields.Text('Description')

class CustomAccountTaxPeriod(models.Model):
    _name = 'custom.account.tax.period'
    _description = 'Tax Period'
    
    name = fields.Char('Period Name', required=True)
    date_start = fields.Date('Start Date', required=True)
    date_end = fields.Date('End Date', required=True)
    active = fields.Boolean('Active', default=True)
    
    # 세금 신고 기간 유형
    period_type = fields.Selection([
        ('monthly', '월간'),
        ('quarterly', '분기'),
        ('half_yearly', '반기'),
        ('yearly', '연간'),
    ], default='monthly')
    
    # 신고 마감일
    deadline_date = fields.Date('Deadline Date')
    
    # 상태
    state = fields.Selection([
        ('open', '개시'),
        ('closed', '마감'),
    ], default='open')
    
    # 세금 신고서
    tax_report_ids = fields.One2many('custom.account.tax.report', 'tax_period_id', string='Tax Reports')
    
    def action_close(self):
        """세금 기간 마감"""
        self.ensure_one()
        self.state = 'closed'
    
    def action_open(self):
        """세금 기간 개시"""
        self.ensure_one()
        self.state = 'open'

class CustomAccountTaxReport(models.Model):
    _name = 'custom.account.tax.report'
    _description = 'Tax Report'
    _order = 'date desc'
    
    name = fields.Char('Report Name', required=True)
    date = fields.Date('Report Date', required=True, default=fields.Date.today)
    period_start = fields.Date('Period Start', required=True)
    period_end = fields.Date('Period End', required=True)
    
    # 신고서 유형 및 기간
    report_type = fields.Selection([
        ('monthly', '월간'),
        ('quarterly', '분기'),
        ('half_yearly', '반기'),
        ('yearly', '연간'),
    ], default='monthly', required=True)
    additional_period = fields.Char('Additional Period', help='예: 2024-01')
    
    # 세금 유형별 금액
    sale_vat_amount = fields.Float('매출 부가세', default=0.0)
    purchase_vat_amount = fields.Float('매입 부가세', default=0.0)
    vat_payable = fields.Float('납부할 부가세', compute='_compute_vat_payable', store=True)
    
    # 면세/영세 관련
    exempt_amount = fields.Float('면세 공급가액', default=0.0)
    zero_rated_amount = fields.Float('영세 공급가액', default=0.0)
    
    # 원천징수
    withholding_amount = fields.Float('원천징수세액', default=0.0)
    
    # 상태
    state = fields.Selection([
        ('draft', '작성중'),
        ('confirmed', '확정'),
        ('submitted', '신고완료'),
    ], default='draft')
    
    # 설명
    notes = fields.Text('Notes')
    
    # 세금 기간
    tax_period_id = fields.Many2one('custom.account.tax.period', string='Tax Period')
    
    # 세금 목록 (Many2many 관계)
    tax_ids = fields.Many2many('custom.account.tax', string='Taxes')
    
    # 제출 일시
    submitted_at = fields.Datetime('Submitted At', readonly=True)
    
    @api.depends('sale_vat_amount', 'purchase_vat_amount', 'withholding_amount')
    def _compute_vat_payable(self):
        for report in self:
            report.vat_payable = report.sale_vat_amount - report.purchase_vat_amount - report.withholding_amount
    
    @api.model
    def create(self, vals):
        """세금 신고서 생성 시 vat_payable 자동 계산"""
        report = super().create(vals)
        # 생성 후 vat_payable 재계산
        report._compute_vat_payable()
        return report
    
    def action_confirm(self):
        """세금 신고 확정"""
        self.ensure_one()
        self.state = 'confirmed'
    
    def action_submit(self):
        """세금 신고 제출"""
        self.ensure_one()
        self.state = 'submitted'
        self.submitted_at = fields.Datetime.now()
    
    def generate_report_data(self):
        """세금 신고 데이터 생성"""
        self.ensure_one()
        
        # 해당 기간의 분개 데이터 조회
        moves = self.env['custom.account.move'].search([
            ('date', '>=', self.period_start),
            ('date', '<=', self.period_end),
            ('state', '=', 'posted')
        ])
        
        sale_vat = 0.0
        purchase_vat = 0.0
        exempt_amount = 0.0
        zero_rated_amount = 0.0
        
        for move in moves:
            for line in move.line_ids:
                if line.account_id and line.account_id.tax_ids:
                    for tax in line.account_id.tax_ids:
                        if tax.type_tax_use == 'sale':
                            if tax.is_exempt:
                                exempt_amount += abs(line.credit - line.debit)
                            else:
                                sale_vat += tax.compute_tax(abs(line.credit - line.debit))
                        elif tax.type_tax_use == 'purchase':
                            purchase_vat += tax.compute_tax(abs(line.credit - line.debit))
        
        self.write({
            'sale_vat_amount': sale_vat,
            'purchase_vat_amount': purchase_vat,
            'exempt_amount': exempt_amount,
        })
        
        return True

class CustomAccountTax(models.Model):
    _name = 'custom.account.tax'
    _description = 'Tax Configuration'
    _order = 'sequence, id'

    name = fields.Char('Tax Name', required=True)
    code = fields.Char('Tax Code', required=True, copy=False)
    sequence = fields.Integer('Sequence', default=10)
    active = fields.Boolean('Active', default=True)
    
    # 세율 설정
    amount = fields.Float('Tax Rate (%)', required=True, default=10.0)
    amount_type = fields.Selection([
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ], default='percent', required=True)
    
    # 세금 유형
    type_tax_use = fields.Selection([
        ('sale', 'Sales'),
        ('purchase', 'Purchase'),
        ('both', 'Both'),
        ('none', 'None'),
    ], default='sale', required=True)
    
    # 한국 부가세 특화 설정
    tax_category = fields.Selection([
        ('vat', '부가가치세'),
        ('withholding', '원천징수'),
        ('stamp', '인지세'),
        ('customs', '관세'),
        ('other', '기타'),
    ], default='vat', required=True)
    
    # 부가세 계산 방식
    calculation_method = fields.Selection([
        ('exclusive', '공급가액 기준'),
        ('inclusive', '공급대가 기준'),
    ], default='exclusive', required=True)
    
    # 면세/영세 여부
    is_exempt = fields.Boolean('면세/영세', default=False)
    exempt_reason = fields.Char('면세/영세 사유')
    
    # 계정 설정
    account_id = fields.Many2one('custom.account.account', string='Tax Account')
    refund_account_id = fields.Many2one('custom.account.account', string='Refund Account')
    tax_group_id = fields.Many2one('custom.account.tax.group', string='Tax Group')
    
    # 세금 신고 관련
    report_frequency = fields.Selection([
        ('monthly', '월간'),
        ('quarterly', '분기'),
        ('half_yearly', '반기'),
        ('yearly', '연간'),
    ], default='monthly')
    
    # 적용 기간
    effective_date = fields.Date('Effective Date', help='적용 시작일')
    expiry_date = fields.Date('Expiry Date', help='적용 종료일')
    
    # 생성/수정 일시
    created_at = fields.Datetime('Created At', default=fields.Datetime.now, readonly=True)
    updated_at = fields.Datetime('Updated At', default=fields.Datetime.now, readonly=True)
    
    # 설명
    description = fields.Text('Description')
    
    @api.constrains('amount')
    def _check_amount(self):
        for tax in self:
            if tax.amount < 0:
                raise ValidationError('세율은 0 이상이어야 합니다.')
    
    @api.model
    def create(self, vals):
        """세금 생성 시 코드 자동 생성"""
        if not vals.get('code'):
            vals['code'] = self._generate_tax_code()
        return super().create(vals)
    
    def write(self, vals):
        """세금 수정 시 updated_at 자동 업데이트"""
        vals['updated_at'] = fields.Datetime.now()
        return super().write(vals)
    
    def _generate_tax_code(self):
        """세금 코드 자동 생성"""
        # TAX + 현재 연도 + 6자리 시퀀스
        current_year = fields.Date.today().year
        last_tax = self.search([('code', 'like', f'TAX{current_year}%')], order='code desc', limit=1)
        
        if last_tax and last_tax.code:
            # 기존 코드에서 시퀀스 추출
            try:
                last_sequence = int(last_tax.code[-6:])
                new_sequence = last_sequence + 1
            except ValueError:
                new_sequence = 1
        else:
            new_sequence = 1
        
        return f'TAX{current_year}{new_sequence:06d}'
    
    def compute_tax(self, base_amount, price_unit=0.0, quantity=1.0):
        """세금 계산"""
        self.ensure_one()
        
        if self.amount_type == 'percent':
            if self.calculation_method == 'exclusive':
                # 공급가액 기준
                tax_amount = base_amount * (self.amount / 100.0)
            else:
                # 공급대가 기준
                total_amount = base_amount
                tax_amount = total_amount * (self.amount / (100.0 + self.amount))
        else:
            # 고정 금액
            tax_amount = self.amount * quantity
            
        return round(tax_amount, 2)
    
    def compute_all(self, base_amount, price_unit=0.0, quantity=1.0):
        """전체 세금 계산 (공급가액, 세액, 공급대가)"""
        self.ensure_one()
        
        if self.is_exempt:
            return {
                'base': base_amount,
                'tax': 0.0,
                'total': base_amount,
            }
        
        tax_amount = self.compute_tax(base_amount, price_unit, quantity)
        
        if self.calculation_method == 'exclusive':
            # 공급가액 기준
            return {
                'base': base_amount,
                'tax': tax_amount,
                'total': base_amount + tax_amount,
            }
        else:
            # 공급대가 기준
            return {
                'base': base_amount - tax_amount,
                'tax': tax_amount,
                'total': base_amount,
            }

 