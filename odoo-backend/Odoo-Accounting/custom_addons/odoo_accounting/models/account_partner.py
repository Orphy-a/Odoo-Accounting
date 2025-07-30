from odoo import models, fields

# models/account_partner.py
class CustomAccountPartner(models.Model):
    _name = 'custom.account.partner'
    _description = 'Partner'
    
    name = fields.Char('Partner Name', required=True)
    code = fields.Char('Partner Code')
    type = fields.Selection([
        ('customer', 'Customer'),
        ('supplier', 'Supplier'),
        ('both', 'Both'),
    ], default='both')
    vat = fields.Char('VAT Number')
    phone = fields.Char('Phone')
    email = fields.Char('Email')
    active = fields.Boolean('Active', default=True)