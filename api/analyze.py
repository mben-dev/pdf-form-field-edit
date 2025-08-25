from http.server import BaseHTTPRequestHandler
import json
import base64
import pdfrw
from io import BytesIO

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data)
            pdf_data = base64.b64decode(data['pdf'])
            
            # Lire le PDF depuis les données
            pdf_buffer = BytesIO(pdf_data)
            pdf = pdfrw.PdfReader(fdata=pdf_buffer.read())
            
            fields = []
            if pdf.Root.AcroForm:
                for field in pdf.Root.AcroForm.Fields or []:
                    field_dict = field.T
                    field_name = field_dict[1:-1] if field_dict else 'Unknown'
                    field_type = field.FT if hasattr(field, 'FT') else 'Unknown'
                    
                    # Déterminer le type de champ
                    field_type_str = 'Unknown'
                    if field_type == '/Tx':
                        field_type_str = 'Text'
                    elif field_type == '/Btn':
                        field_type_str = 'Button/Checkbox'
                    elif field_type == '/Ch':
                        field_type_str = 'Choice'
                    elif field_type == '/Sig':
                        field_type_str = 'Signature'
                    
                    fields.append({
                        'name': field_name,
                        'type': field_type_str,
                        'original_name': field_name
                    })
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'fields': fields}).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()