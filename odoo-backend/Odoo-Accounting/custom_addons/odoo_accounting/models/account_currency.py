from odoo import models, fields

class CustomAccountCurrency(models.Model):
    _name = 'custom.account.currency'
    _description = 'Currency'

    name = fields.Char('Currency Name', required=True)
    code = fields.Char('Currency Code', required=True)
    symbol = fields.Char('Symbol')
    rate = fields.Float('Exchange Rate', required=True, default=1.0)
    active = fields.Boolean('Active', default=True)