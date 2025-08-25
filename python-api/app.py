from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfrw
import base64
from io import BytesIO
import json

app = Flask(__name__)
CORS(app, origins=["https://pdf-form-editor.vercel.app", "http://localhost:3000", "https://pdf-form-editor-*.vercel.app"])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_pdf():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
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
        
        return jsonify({'fields': fields})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rename', methods=['POST', 'OPTIONS'])
def rename_pdf():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        pdf_data = base64.b64decode(data['pdf'])
        field_mappings = data['mappings']
        
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
        
        return jsonify({
            'success': True,
            'renamed_count': renamed_count,
            'pdf': base64.b64encode(modified_pdf).decode('utf-8')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000)