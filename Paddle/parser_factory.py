from base_parser import BaseReceipt, read_config
from Parsers.mercadona_parser import MercadonaReceipt
from Parsers.froiz_parser import FroizReceipt
from Parsers.alcampo_parser import AlcampoReceipt

def get_parser(store_name):
    if not store_name:
        return BaseReceipt
    
    store_name = store_name.lower()
    if "mercadona" in store_name:
        return MercadonaReceipt
    elif "froiz" in store_name:
        return FroizReceipt
    elif 'alcampo' in store_name:
        return AlcampoReceipt
    
    return BaseReceipt

def parse_receipt_text(text, config_path="config.yml", config=None):
    if config is None:
        config = read_config(config_path)
        
    base_receipt = BaseReceipt(config, text)
    store_name = base_receipt.store
    
    parser_class = get_parser(store_name)
    if parser_class is BaseReceipt:
        return base_receipt
    
    return parser_class(config, text)