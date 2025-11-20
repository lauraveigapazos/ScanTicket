import re
import yaml
import json
from datetime import datetime
from difflib import get_close_matches
from objectview import objectview

class BaseReceipt(object):
    def __init__(self, config, raw_text):
        """
        args:
            config: configuration object from YAML
            raw_text: text extracted from receipt (string or list of lines)
        """
        
        self.config = config
        
        self.store = None
        self.store_cif = None
        self.date = None
        self.time = None
        self.address = None
        self.phone = None
        self.items = []
        self.subtotal = None
        self.tax = None
        self.total = None
        self.payment_method = None
        self.transaction_id = None
        self.raw_lines = []
        
        # raw text to list of lines
        if isinstance(raw_text, str):
            self.raw_lines = raw_text.lower().split('\n')
        else:
            self.raw_lines = [line.lower() for line in raw_text]
            
        self.full_text = ' '.join(self.raw_lines)
        
        self._parse()
        
    #to be overriden in subparsers
    def _parse(self):
        self.store = self._parse_store()
        self.store_cif = self._parse_cif()
        self.date = self._parse_date()
        self.time = self._parse_time()
        self.address = self._parse_address()
        self.phone = self._parse_phone()
        self.items = self._parse_items()
        self.subtotal = self._parse_subtotal()
        self.tax = self._parse_tax()
        self.total = self._parse_total()
        self.payment_method = self._parse_payment_method()
        self.transaction_id = self._parse_transaction_id()
        
    def to_dict(self):
        return {
            'store': self.store,
            'store_cif': self.store_cif,
            'date': self.date,
            'time': self.time,
            'address': self.address,
            'phone': self.phone,
            'items': self.items,
            'subtotal': self.subtotal,
            'tax': self.tax,
            'total': self.total,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'raw_text': '\n'.join(self.raw_lines)
        }
        
    # ================ TEXT MATCHING METHODS =================
    def _exact_find(self, keyword):
        keyword_lower = keyword.lower()
        for line in self.raw_lines:
            if keyword_lower in line:
                return line
        return None
    
    def _fuzzy_find(self, keyword, accuracy=0.6, min_keyword_length=4):
        if len(keyword) < min_keyword_length:
            return None
        
        for line in self.raw_lines:
            words = line.split()
            matches = get_close_matches(keyword, words, 1, accuracy)
            if matches:
                return line
        return None
    
    # ============= STORE IDENTIFICATION METHODS =============
    
    def _parse_store(self):
        stores_dict = self.config.stores
        if hasattr(stores_dict, '__dict__'):
            stores_dict = stores_dict.__dict__
            
        # try exact matching first
        for store, spellings in stores_dict.items():
            for spelling in spellings:
                if self._exact_find(spelling):
                    print(f"  Tienda encontrada (nombre exacto): {store}")
                    return store
        
        # no exact match - fuzzy match
        for accuracy in [0.9, 0.8]:
            for store, spellings in stores_dict.items():
                for spelling in spellings:
                    if len(spelling) >= 5:
                        if self._fuzzy_find(spelling, accuracy, min_keyword_length=5):
                            print(f"  Tienda encontrada (nombre aproximado): {store}")
                            return store
                        
        # no fuzzy match - cif match
        cif = self._parse_cif()
        if cif and hasattr(self.config, 'cifs'):
            cifs_dict = self.config.cifs
            if hasattr(cifs_dict, '__dict__'):
                cifs_dict = cifs_dict.__dict__
                
            for store, store_cif in cifs_dict.items():
                store_cif_normalized = str(store_cif).replace('-', '').upper()
                if cif == store_cif_normalized:
                    print(f"  Tienda encontrada (CIF): {store}")
                    return store
                
        print("  Tienda no encontrada")
        return None
    
    def _parse_cif(self):
        
        patterns = [
            r'(?:cif|nif)[:\s]*([a-z]\d{7,8})', # letter + digits (A12345678)
            r'cif[:\s]*([a-z]-?\d{7,8})', # letter + dash + digits (A-12345678)
            r'(?:cif|nif)[:\s]*(\d{8}[a-z])', # digits + letter (12345678A)
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.full_text, re.IGNORECASE)
            if match:
                cif = match.group(1).replace('-', '').upper()
                return cif
            
        return None
    
    def _parse_date(self):
        
        patterns = [
            r'(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})',  # DD/MM/YYYY
            r'(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2})',  # DD/MM/YY
            r'fecha[:\s]*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})',  # fecha: DD/MM/YYYY
            r'(\d{2,4})-(\d{2})-(\d{2})',  # YYYY-MM-DD
            r'(\d{1,2})\s+(\d{1,2})\s+(\d{4})', # DD MM YYYY
        ]
        
        for pattern in patterns:
            for line in self.raw_lines:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    try:
                        groups = match.groups()
                        if len(groups[0]) == 4: # YYYY-MM-DD
                            year, month, day = groups
                        else:
                            day, month, year = groups
                            
                        year = int(year)
                        month = int(month)
                        day = int(day)
                        
                        if year < 100: # two digit year
                            year += 2000 if year < 50 else 1900
                            
                        date_obj = datetime(year, month, day)
                        return date_obj.strftime('%Y-%m-%d')
                    
                    except ValueError:
                        continue
                    
        return None
    
    def _parse_time(self):
        
        patterns = [
            r'(\d{1,2}):(\d{2})(?::(\d{2}))?',  # HH:MM or HH:MM:SS
            r'hora[:\s]*(\d{1,2}):(\d{2})',      # hora: HH:MM
        ]
        
        for pattern in patterns:
            for line in self.raw_lines:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    hour, minute = match.group(1), match.group(2)
                    second = match.group(3) or '00'
                    return f"{hour}:{minute}:{second}"
                
        return None
    
    def _parse_address(self):
        
        address_keywords = [
            'calle', 'av.', 'avenida', 'plaza', 'paseo', 'camino',
            'c/', 'nº', 'no.', 'pza', 'pza.', 'rua', 'rúa', 'r.',
            'r/', 'carrer', 'carretera', 'ct', 'pº', 'pl.'
        ]
        
        for line in self.raw_lines:
            line_clean = line.strip()
            if len(line_clean) > 10:
                # look for lines with keywords
                for keyword in address_keywords:
                    if keyword in line:
                        return line_clean.title()
                    
                # look for lines with numbers
                if re.search(r'\d+', line) and len(line_clean.split()) >= 3:
                    # exclude price lines
                    if not re.search(r'€|\$|precio|total|subtotal|iva', line):
                        return line_clean.title()
                    
        return None
    
    def _parse_phone(self):
        
        patterns = [
            r'(?:telf|teléfono|phone|tel)[:\s]*(\+?\d[\d\s\-]{8,})', # phone tag + numbers
            r'(?:móvil|mobile)[:\s]*(\+?\d[\d\s\-]{8,})', # mobile tag + numbers
            r'(\+?\d{2,3}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2,4})',  # international format - with spaces
            r'\+34\s?\d{9}',  # spanish format - without spaces
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.full_text, re.IGNORECASE)
            if match:
                phone = match.group(1).strip()
                return re.sub(r'[\s\-]', '', phone)
            
        return None
    
    def _parse_items(self):
        items = []
        
        # text + quantity + unit + (unit price) + total price
        item_pattern = r'^([a-záéíóúñü\s\d,.\-()]{5,}?)\s+(\d+[.,]\d+|\d+)\s+(kg|unidad|un\.?|ud|u|l|ml|g|kg|lt|pz)\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)\s*€?'
        
        for line in self.raw_lines:
            line_stripped = line.strip()
            
            # skip lines with non item keywords
            if any(kw in line for kw in ['total', 'subtotal', 'iva', 'impuesto', 'efectivo', 'tarjeta', 'pago', 'descuento', 'cambio']):
                continue
            
            # skip very short lines
            if len(line_stripped) < 5:
                continue
            
            match = re.search(item_pattern, line, re.IGNORECASE)
            if match:
                try:
                    name = match.group(1).strip().title()
                    quantity = float(match.group(2).replace(',', '.'))
                    unit = match.group(3).lower()
                    unit_price = float(match.group(4).replace(',', '.'))
                    total_price = float(match.group(5).replace(',', '.'))
                    
                    items.append({
                        'name': name,
                        'quantity': quantity,
                        'unit': unit,
                        'unit_price': round(unit_price, 2),
                        'total_price': round(total_price, 2)
                    })
                except ValueError:
                    continue
                
        if not items:
            items = self._parse_items_fallback()
            
        return items if items else None
    
    def _parse_items_fallback(self):
        items = []
        
        # lines with € or numbers with commas
        price_pattern = r'(\d+[.,]\d{2})\s*€?'
        
        for line in self.raw_lines:
            line_clean = line.strip()
            
            # skip lines with non item keywords
            if len(line_clean) < 5 or any(kw in line for kw in ['total', 'iva', 'impuesto', 'efectivo', 'tarjeta', '---', '===', 'cambio']):
                continue
            
            if re.search(price_pattern, line):
                prices = re.findall(price_pattern, line)
                if len(prices) >= 1:
                    try:
                        # for product name - get everything before price
                        name_part = re.sub(price_pattern, '', line).strip()
                        if len(name_part) > 2:
                             total_price = float(prices[-1].replace(',', '.'))
                             items.append({
                                'name': name_part.title(),
                                'quantity': 1,
                                'unit': 'ud',
                                'unit_price': round(total_price, 2),
                                'total_price': round(total_price, 2)
                            })
                             
                    except ValueError:
                        continue
                    
        return items if items else None
    
    def _parse_subtotal(self):
        return self._extract_amount([
            'subtotal', 'base', 'subtotal imponible', 'base imponible',
            'subtotal euros', 'sub-total'
        ])
        
    def _parse_tax(self):
        return self._extract_amount([
            'iva', 'impuesto', 'i.v.a', 'tax', 'tva', 'vat',
            'iva 21%', 'iva 10%', 'iva 4%'
        ])
        
    def _parse_total(self):
        return self._extract_amount([
            'total', 'total a pagar', 'total pagar', 'importe total',
            'importe', 'suma total', 'cantidad', 'debe', 'a pagar',
            'total euros', 'total €', '*total:', 'tot'
        ])
        
    def _extract_amount(self, keywords):
        
        # contains €/eur. or numbers with commas
        amount_pattern = r'(\d+[.,]\d{2})\s*(?:€|eur\.?)?'
        
        for keyword in keywords:
            for line in self.raw_lines:
                if keyword.lower() in line.lower():
                    # find last number
                    matches = re.findall(amount_pattern, line)
                    if matches:
                        amount = matches[-1].replace(',', '.')
                        return round(float(amount), 2)
                    
        # check next line too
        for idx, line in enumerate(self.raw_lines):
            if keyword.lower() in line.lower():
                if idx + 1 < len(self.raw_lines):
                    next_line = self.raw_lines[idx + 1].strip()
                    matches = re.findall(amount_pattern, next_line)
                    if matches:
                        amount = matches[-1].replace(',', '.')
                        return round(float(amount), 2)
                    
        return None
    
    def _parse_payment_method(self):
        if re.search(r'(tarjeta|card|credit card|visa|mastercard)', self.full_text, re.IGNORECASE):
            return 'Tarjeta'
        elif re.search(r'(efectivo|cash|contado|dinero)', self.full_text, re.IGNORECASE):
            return 'Efectivo'
        elif re.search(r'(cheque|check)', self.full_text, re.IGNORECASE):
            return 'Cheque'
        elif re.search(r'(transferencia|bancarización|domiciliación)', self.full_text, re.IGNORECASE):
            return 'Transferencia'
        else:
            return None
        
    def _parse_transaction_id(self):
        patterns = [
            r'(?:ticket|recibo|transacción|transaction|id)[:\s]*([a-z0-9]{6,})',
            r'(?:num|número|number)[:\s]*([0-9]{6,})',
            r'#(\d{6,})',
            r'^(\d{6,})\s',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.full_text, re.IGNORECASE)
            if match:
                return match.group(1)
            
        return None
    
    # ================ MAIN METHODS =================
    
def read_config(config_path="config.yml"):
    with open(config_path, "r", encoding="utf-8") as stream:
        config_dict = yaml.safe_load(stream)
    
    return objectview(config_dict)

def parse_receipt_text(text, config_path="config.yml", config=None):
    """
    args:
        text: raw text from receipt
        config_path: path to config file (ignored if config provided)
        config: optional config object (overrides config_path)
    
    returns:
        receipt object with parsed data
    """
    
    if config is None:
        config = read_config(config_path)
    receipt = BaseReceipt(config, text)
    return receipt  