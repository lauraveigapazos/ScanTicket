import re
from base_parser import BaseReceipt

class FroizReceipt(BaseReceipt):
    
    def _parse_items(self):
        items = []
        lines = self.raw_lines
        
        #item section start - after "IMPORTE" header line
        try:
            start_idx = next(i for i, l in enumerate(lines) if "importe" in l)
        except StopIteration:
            try:
                start_idx = next(i for i, l in enumerate(lines) if "descripción" in l)
            except StopIteration:
                start_idx = 0
            
        #item section end - before line with 'total'
        try:
            end_idx = next(i for i, l in enumerate(lines) if "*total:" in l or "total:" in l.lower())
        except StopIteration:
            end_idx = len(lines)

        product_lines = lines[start_idx+1:end_idx]
        
        #group lines into items
        i = 0
        current_category = None
        
        while i < len(product_lines):
            line = product_lines[i].strip()
            
            #skip empty lines
            if not line:
                i += 1
                continue
            
            #skip non-item lines
            if any(kw in line for kw in ['iva', 'base', 'c.iva', 'entrega', 'tarjetas', 'devolver', 'atendido', 'impreso', 'plazo', 'eur.', 'cant.', 'p.v.p']):
                i += 1
                continue
            
            #category line
            if self._is_category_line(line):
                current_category = line
                i += 1
                continue
            
            #product line - product name + [quantity] + [tax %]
            if self._is_product_line(line):
                product_lines_group = [line]
                i += 1
                
                #collect lines that make up product details
                while i < len(product_lines) and len(product_lines_group) < 6:
                    next_line = product_lines[i].strip()
                    
                    if not next_line:
                        i += 1
                        continue
                    
                    #stop if another category or product line
                    if self._is_category_line(next_line):
                        break
                    
                    if self._is_product_line(next_line):
                        break
                    
                    #stop if total/summary line
                    if any(kw in next_line for kw in ['total', 'eur.', 'entrega', 'tarjetas']):
                        break
                    
                    product_lines_group.append(next_line)
                    i += 1
                
                #parse grouped lines
                parsed = self._parse_item_block(product_lines_group, current_category)
                if parsed:
                    items.append(parsed)
            
            #handle singke tax percentage line - when product name is on separate line
            elif self._is_standalone_tax_line(line):
                #look back to see if previous item block needs this tax
                i += 1
            
            else:
                i += 1
        
        return items if items else super()._parse_items()
            
    def _is_category_line(self, line):
        """
        section headers like:
        - "DROGUERIA Y PERFUMERIA"
        - "Ahorro"  
        - "PANADERIA Y BOLLERIA"
        
        excluded:
        - lines with percentages
        - lines with product codes
        - header/footer info
        """
        
        #skip known non-category keywords
        if any(kw in line for kw in ['cant.', 'p.v.p', 'importe', 'descripcion', 'ean', 'codigo', 'total', 'eur.', 'entrega', 'tarjetas', 'cif', 'factura', 'avda', 'doruña', 'atendido']):
            return False
        
        #skip date/time lines
        if re.match(r'^\d{1,2}\s+\d{1,2}\s+\d{4}', line):  # Date format
            return False
        if re.match(r'^\d{1,2}:\d{2}', line):  # Time format
            return False
        
        #skip lines that are just numbers or codes
        if re.match(r'^\d+', line) and not re.search(r'[a-z]', line, re.IGNORECASE):
            return False
        
        #skip lines that contain a product code
        if re.search(r'\d{3,}\-', line):  #digits followed by dash
            return False
        
        #skip lines ending with %
        if re.search(r'\d+%\s*$', line):
            return False
        
        #skip lines containing % and ending with (pc)
        if '%' in line and ('(' in line or ')' in line or 'g' in line):
            return False
        
        #skip lines with too many digits (>30%)
        digit_count = sum(1 for c in line if c.isdigit())
        if digit_count > len(line) * 0.3:
            return False
        
        #check for mostly letters (>70%)
        letter_count = sum(1 for c in line if c.isalpha() or c == ' ')
        if letter_count < len(line) * 0.7: 
            return False
        
        #check length - at least 4 characters
        if len(line.strip()) < 4:
            return False
        
        #check it's not product detail line
        if re.match(r'^\d+\s+\d+\s+\d+[.,]\d+', line):
            return False
        
        return True
    
    def _is_product_line(self, line):
        """
        ends with a percentage or has product-like text
        - "Pila Froiz Super Alkalina LR03 AAA 1 21%" (ends with %)
        - "Pastel nata (Dama Crema) 3 u 165 g ( 10%" (ends with %)
        - "pan de broa maíz 35% 450 g (pc)" (has % in middle, product name)
        
        excluded:
        - "4%" (just tax)
        - "1,37 1,29" (just prices)
        """
        
        #has letters
        if not re.search(r'[a-záéíóúñü]', line, re.IGNORECASE):
            return False
        
        #has at least one digit
        if not re.search(r'\d', line):
            return False
        
        #exclusions
        if re.match(r'^\d+[.,]\d+\s*$', line):  #price line
            return False
        if re.match(r'^\d+%\s*$', line):  #tax line
            return False
        if re.match(r'^\d+$', line):  #number only line
            return False
        
        return True
    
    def _is_standalone_tax_line(self, line):
        """line is a tax percentage (like 4%)"""
        return re.match(r'^\d+%\s*$', line.strip())
    
    def _parse_item_block(self, lines, category=None):
        """
        examples:
        1. Pila Froiz Super Alkalina LR03 AAA 1 21%
        03201
        1
        1,00
        1,00
        
        2. Pastel nata (Dama Crema) 3 u 165 g ( 10%
        057792
        1
        1,29
        1,29
        
        3. pan de broa maíz 35% 450 g (pc)
        4%
        065458-
        1
        1,37 1,29
        1,29
        """
        if len(lines) < 1:
            return None
        
        product_line = lines[0].strip()
        
        #parse product line to extract name and tax
        tax_pct = None
        name = product_line
        
        #extract tax from end of line
        tax_match = re.search(r'(\d+%)\s*$', product_line)
        if tax_match:
            tax_pct = tax_match.group(1)
            #remove tax from product name
            name = re.sub(r'\s*\d+%\s*$', '', product_line)
        
        #if no tax found -> check next lines
        if not tax_pct:
            for line in lines[1:]:
                if self._is_standalone_tax_line(line):
                    tax_pct = line.strip()
                    break
        
        name = name.strip().title()
        
        #collect numbers with decimals
        all_prices = []
        for line in lines[1:]:
            prices = re.findall(r'(\d+[.,]\d+)', line)
            all_prices.extend(prices)
        
        all_numbers = []
        for line in lines[1:]:
            nums = re.findall(r'(\d+)', line)
            all_numbers.extend(nums)
        
        try:
            #last two decimal numbers (unit_price and total_price)
            if len(all_prices) >= 2:
                unit_price = float(all_prices[-2].replace(',', '.'))
                total_price = float(all_prices[-1].replace(',', '.'))
            else:
                return None
            
            #quantity - usually small number after product id
            quantity = 1
            for num_str in all_numbers[1:]:  #skip product id
                num = int(num_str)
                if 1 <= num <= 999:
                    quantity = num
                    break
            
            return {
                'name': name,
                'quantity': quantity,
                'unit': 'ud',
                'unit_price': round(unit_price, 2),
                'total_price': round(total_price, 2),
                'category': category,
                'tax': tax_pct
            }
            
        except (ValueError, IndexError):
            return None