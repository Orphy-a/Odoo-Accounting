from odoo import models, fields

# models/account_journal.py
class CustomAccountJournal(models.Model):
    _name = 'custom.account.journal'
    _description = 'Journal'
    
    name = fields.Char('Journal Name', required=True)
    code = fields.Char('Journal Code', required=True)
    type = fields.Selection([
        ('sale', 'Sales'),
        ('purchase', 'Purchase'),
        ('cash', 'Cash'),
        ('bank', 'Bank'),
        ('general', 'General'),
    ], required=True)
    active = fields.Boolean('Active', default=True)