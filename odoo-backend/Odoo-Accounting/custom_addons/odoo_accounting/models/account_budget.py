from odoo import models, fields

class CustomAccountBudget(models.Model):
    _name = 'custom.account.budget'
    _description = 'Budget'

    name = fields.Char('Budget Name', required=True)
    start_date = fields.Date('Start Date', required=True)
    end_date = fields.Date('End Date', required=True)
    amount = fields.Float('Budget Amount', required=True)
    account_id = fields.Many2one('custom.account.account', 'Account')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('closed', 'Closed'),
    ], default='draft')