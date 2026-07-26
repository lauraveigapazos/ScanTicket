import re
from base_parser import BaseReceipt

class AlcampoReceipt(BaseReceipt):
    def _parse_items(self):
        items = []
        lines = self.raw_lines
        
        #item section start - after line with 'simplificada'
        try:
            start_idx = next(i for i, l in enumerate(lines) if "simplificada" in l)
        except StopIteration:
            start_idx = 0
            
        #item section end - before 'TOT' or 'total'
        try:
            end_idx = next(i for i, l in enumerate(lines) if re.search(r'\btot\b', l, re.IGNORECASE))
        except StopIteration:
            try:
                end_idx = next(i for i, l in enumerate(lines) if "total" in l.lower())
            except StopIteration:
                end_idx = len(lines)
                
        product_lines = lines[start_idx+1:end_idx]
        
        #find a price line and treat everything before as item name
        i = 0
        while i < len(product_lines):
            line = product_lines[i].strip()
            
            #skip empty lines
            if not line:
                i += 1
                continue
            
            #skip non item lines
            if any(kw in line.lower() for kw in ['factura', 'simplificada', 'art.', 'vendidos', 'imp.', '%', 'base', 'cuota', 'iva', 'tarjeta', 'cambio', 'num.', 'para el cliente', 'establecimiento', 'localidad', 'fecha', 'hora', 'numero', 'tipo de', 'codigo', 'importe', 'autorizacion', 'aid:', 'etiqueta', 'contactless', 'verificacion', 'referencia', 'entidad', 'sellos', 'descuento', 'cif', 'alcamp']):
                i += 1
                continue
            
            #check if price line - starts with a digit and has a decimal
            if re.match(r'^\d+[.,]\d+', line):
                product_name_parts = []
                name_idx = i - 1
                
                while name_idx >= 0:
                    prev_line = product_lines[name_idx].strip()
                
                    if not prev_line:
                        break
                    if any(kw in prev_line.lower() for kw in ['factura', 'simplificada', 'art.', 'vendidos', 'tarjeta', 'cambio']):
                        break  #non item line
                    if re.match(r'^\d+[.,]\d+', prev_line):
                        break  #price line
                    
                    #skip IVA letters
                    if self._is_iva_letter_line(prev_line):
                        name_idx -= 1
                        continue
                    
                    product_name_parts.insert(0, prev_line)
                    name_idx -= 1
                
                try:
                    price = float(line.replace(',', '.'))
                    
                    if product_name_parts:
                        full_name = ' '.join(product_name_parts).title()
                    else:
                        full_name = f"Item {i}".title()
                    
                    items.append({
                        'name': full_name,
                        'quantity': 1,
                        'unit': 'ud',
                        'unit_price': round(price, 2),
                        'total_price': round(price, 2)
                    })
                    
                    #skip letter following price
                    if i + 1 < len(product_lines):
                        next_line = product_lines[i + 1].strip()
                        if self._is_iva_letter_line(next_line):
                            i += 1
                    
                    i += 1
                except ValueError:
                    i += 1
            else:
                i += 1
        
        return items if items else super()._parse_items()
        
    def _is_iva_letter_line(self, line):
        clean = line.strip()
        
        #max 3 characters and mostly letters
        if len(clean) <= 3:
            letter_count = sum(1 for c in clean if c.isalpha())
            if letter_count >= len(clean) * 0.8:
                if not re.search(r'[a-z]{4,}', clean, re.IGNORECASE):
                    return True
        return False
        
    def _parse_address(self):
        #alcampo doesn't state store address on receipts
        return None