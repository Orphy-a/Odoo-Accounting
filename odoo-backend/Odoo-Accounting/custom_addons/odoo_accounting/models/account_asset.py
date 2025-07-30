from odoo import models, fields

class CustomAccountAsset(models.Model):
    _name = 'custom.account.asset'
    _description = 'Asset'

    name = fields.Char('Asset Name', required=True)
    code = fields.Char('Asset Code')
    purchase_date = fields.Date('Purchase Date')
    value = fields.Float('Asset Value')
    depreciation_method = fields.Selection([
        ('linear', 'Linear'),
        ('degressive', 'Degressive'),
    ], string='Depreciation Method', default='linear')
    useful_life = fields.Integer('Useful Life (years)')
    residual_value = fields.Float('Residual Value')
    active = fields.Boolean('Active', default=True)