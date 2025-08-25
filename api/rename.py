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
            field_mappings = data['mappings']  # { oldName: newName }
            
            # Lire le PDF depuis les données
            pdf_buffer = BytesIO(pdf_data)
            pdf = pdfrw.PdfReader(fdata=pdf_buffer.read())
            
            # Renommer les champs
            renamed_count = 0
            if pdf.Root.AcroForm and pdf.Root.AcroForm.Fields:
                for field in pdf.Root.AcroForm.Fields:
                    if field.T:
                        current_name = field.T[1:-1] if field.T.startswith('(') else field.T
                        
                        if current_name in field_mappings:
                            new_name = field_mappings[current_name]
                            field.T = pdfrw.PdfString(f'({new_name})')
                            renamed_count += 1
                
                # Forcer la régénération de l'apparence
                pdf.Root.AcroForm.NeedAppearances = pdfrw.PdfObject('true')
            
            # Écrire le PDF modifié
            output_buffer = BytesIO()
            pdfrw.PdfWriter().write(output_buffer, pdf)
            output_buffer.seek(0)
            modified_pdf = output_buffer.read()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'renamed_count': renamed_count,
                'pdf': base64.b64encode(modified_pdf).decode('utf-8')
            }).encode())
            
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