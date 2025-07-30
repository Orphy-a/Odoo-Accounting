{
    'name': 'Odoo Accounting',
    'version': '1.0',
    'summary': 'Custom Accounting Module for Odoo',
    'sequence': 10,
    'description': """
        Custom Accounting Module
    """,
    'category': 'Accounting/Accounting',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/account_tax_views.xml',  # 세금 뷰를 먼저 로드
        'views/menu_views.xml',  # 그 다음 메뉴 뷰
        'views/account_account_views.xml',
        'views/account_journal_views.xml',
        'views/account_move_views.xml',
        'views/account_partner_views.xml',
        'views/account_asset_views.xml',
        'views/account_budget_views.xml',
        'views/account_currency_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}