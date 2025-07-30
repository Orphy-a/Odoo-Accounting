from odoo import models, fields

class CustomAccountMove(models.Model):
    _name = 'custom.account.move'
    _description = 'Journal Entry'

    name = fields.Char('Entry Name', required=True)
    date = fields.Date('Date', required=True, default=fields.Date.today)
    ref = fields.Char('Reference')
    journal_id = fields.Many2one('custom.account.journal', 'Journal', required=True)
    line_ids = fields.One2many('custom.account.move.line', 'move_id', 'Journal Items')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('cancelled', 'Cancelled'),
    ], default='draft')
    total_debit = fields.Float('Total Debit', compute='_compute_totals')
    total_credit = fields.Float('Total Credit', compute='_compute_totals')
    amount_total = fields.Float('Total Amount', compute='_compute_totals')
    

    
    def _compute_totals(self):
        for record in self:
            total_debit = sum(line.debit for line in record.line_ids)
            total_credit = sum(line.credit for line in record.line_ids)
            record.total_debit = total_debit
            record.total_credit = total_credit
            record.amount_total = total_debit - total_credit