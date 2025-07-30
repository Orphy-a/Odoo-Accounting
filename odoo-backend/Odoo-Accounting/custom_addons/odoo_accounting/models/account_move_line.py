from odoo import models, fields

class CustomAccountMoveLine(models.Model):
    _name = 'custom.account.move.line'
    _description = 'Journal Entry Line'

    move_id = fields.Many2one(
        'custom.account.move',
        string='Journal Entry',
        required=True,
        ondelete='cascade'
    )
    account_id = fields.Many2one(
        'custom.account.account',
        string='Account',
        required=True,
        ondelete='cascade'
    )
    partner_id = fields.Many2one(
        'custom.account.partner',
        string='Partner'
    )
    name = fields.Char('Description')
    debit = fields.Float('Debit')
    credit = fields.Float('Credit')
    
