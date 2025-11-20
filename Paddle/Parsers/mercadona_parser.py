import re
from base_parser import BaseReceipt

class MercadonaReceipt(BaseReceipt):
    
    def _parse_items(self):
        items = []
        lines = self.raw_lines
        
        # item section start - after line with 'descripción'
        try:
            start_idx = next(i for i, l in enumerate(lines) if "descripción" in l)
        except StopIteration:
            start_idx = 0
            
        # item section end - before line with 'total'
        try:
            end_idx = next(i for i, l in enumerate(lines) if "total (€" in l or "total" in l.lower())
        except StopIteration:
            end_idx = len(lines)

        product_lines = lines[start_idx+1:end_idx]
        
        # group lines into items
        i = 0
        while i < len(product_lines):
            line = product_lines[i].strip()
            
            # skip empty lines
            if not line:
                i += 1
                continue
            
            # skip non-item lines
            if any(kw in line for kw in ['iva', 'base imponible', 'cuota', 'p. unit', 'imp.(e)']):
                i += 1
                continue
            
            # line starts with digit + space (quantity)
            if re.match(r'^\d+\s+', line):
                item_lines = [line]
                i += 1
                
                # check price lines following product line
                while i < len(product_lines):
                    next_line = product_lines[i].strip()
                    
                    if not next_line:
                        i += 1
                        continue
                    
                    # price/weight line - starts with digit
                    if re.match(r'^\d+[.,]\d+', next_line):
                        item_lines.append(next_line)
                        i += 1
                    # new product line - stop grouping
                    elif re.match(r'^\d+\s+', next_line):
                        break
                    else:
                        # unknown line - skip
                        i += 1
                        break
                
                parsed = self._parse_item_block(item_lines)
                if parsed:
                    items.append(parsed)
            else:
                i += 1
        
        return items if items else super()._parse_items()
    
    def _parse_item_block(self, lines):
        if not lines:
            return None
        
        # first line - quantity + product name
        first_line = lines[0].strip()
        match = re.match(r'(\d+)\s+(.+)$', first_line, re.IGNORECASE)
        
        if not match:
            return None
        
        quantity = int(match.group(1))
        name = match.group(2).strip().title()
        
        if len(lines) == 2:
            #single price line
            price_str = lines[1].strip()
            price = float(price_str.replace(",", "."))
            
            #if quantity = 1 -> unit and total price are the same
            if quantity == 1:
                return {
                    "name": name,
                    "quantity": 1,
                    "unit": "ud",
                    "unit_price": round(price, 2),
                    "total_price": round(price, 2)
                }
            else:
                #if quantity > 1 -> calculate total price
                total_price = price * quantity
                return {
                    "name": name,
                    "quantity": quantity,
                    "unit": "ud",
                    "unit_price": round(price, 2),
                    "total_price": round(total_price, 2)
                }
        
        elif len(lines) == 3:
            #3 price lines - regular or weighted items
            second_str = lines[1].strip()
            third_str = lines[2].strip()
            
            #if second line contains "kg" -> weighted item
            if "kg" in second_str.lower():
                #extract weight
                weight_match = re.match(r'(\d+[.,]\d+)\s*kg', second_str, re.IGNORECASE)
                if weight_match:
                    weight = float(weight_match.group(1).replace(",", "."))
                    
                    #extract price/kg
                    price_match = re.search(r'(\d+[.,]\d+)\s*€/kg', second_str, re.IGNORECASE)
                    if price_match:
                        unit_price = float(price_match.group(1).replace(",", "."))
                        total_price = float(third_str.replace(",", "."))
                        
                        return {
                            "name": name,
                            "quantity": weight,
                            "unit": "kg",
                            "unit_price": round(unit_price, 2),
                            "total_price": round(total_price, 2)
                        }
            else:
                #regular item: UNIT_PRICE TOTAL_PRICE
                unit_price = float(second_str.replace(",", "."))
                total_price = float(third_str.replace(",", "."))
                
                return {
                    "name": name,
                    "quantity": quantity,
                    "unit": "ud",
                    "unit_price": round(unit_price, 2),
                    "total_price": round(total_price, 2)
                }
        
        elif len(lines) == 4:
            #4 price lines: weighted item with all components
            #line 1: QUANTITY PRODUCT_NAME
            #line 2: WEIGHT kg
            #line 3: PRICE €/kg
            #line 4: TOTAL_PRICE
            second_str = lines[1].strip()
            third_str = lines[2].strip()
            fourth_str = lines[3].strip()
            
            #extract weight
            weight_match = re.match(r'(\d+[.,]\d+)\s*kg', second_str, re.IGNORECASE)
            if weight_match:
                weight = float(weight_match.group(1).replace(",", "."))
                
                #extract price
                price_match = re.match(r'(\d+[.,]\d+)\s*€/kg', third_str, re.IGNORECASE)
                if price_match:
                    unit_price = float(price_match.group(1).replace(",", "."))
                    total_price = float(fourth_str.replace(",", "."))
                    
                    return {
                        "name": name,
                        "quantity": weight,
                        "unit": "kg",
                        "unit_price": round(unit_price, 2),
                        "total_price": round(total_price, 2)
                    }
        
        return None
    
    def _parse_total(self):
        pattern = r'total\s*$€$\s*(\d+[.,]\d{2})'
        
        for line in self.raw_lines:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                return round(float(match.group(1).replace(",", ".")), 2)
        
        return super()._parse_total()
    
    def _parse_tax(self):
        """extract tax information"""
        tax_info = []
        table_started = False
        
        for line in self.raw_lines:
            #look for table header
            if "iva" in line and "base" in line:
                table_started = True
                continue
            
            if table_started:
                #stop at total line
                if "total" in line and any(c.isdigit() for c in line):
                    break
                
                #parse tax lines: "4% 7,26 0,29"
                match = re.match(r'(\d+)%\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)', line.strip())
                if match:
                    rate = int(match.group(1))
                    base = float(match.group(2).replace(",", "."))
                    cuota = float(match.group(3).replace(",", "."))
                    tax_info.append({
                        "rate": rate,
                        "base": round(base, 2),
                        "tax": round(cuota, 2)
                    })
        
        return tax_info if tax_info else super()._parse_tax()