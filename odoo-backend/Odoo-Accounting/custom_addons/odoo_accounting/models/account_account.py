from odoo import models, fields

class CustomAccountAccount(models.Model):
    _name = 'custom.account.account'
    _description = 'Chart of Accounts'

    name = fields.Char('Account Name', required=True)
    code = fields.Char('Account Code', required=True)
    type = fields.Selection([
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('income', 'Income'),
        ('expense', 'Expense'),
    ], string='Type', required=True)
    parent_id = fields.Many2one('custom.account.account', 'Parent Account')
    child_ids = fields.One2many('custom.account.account', 'parent_id', 'Child Accounts')
    
