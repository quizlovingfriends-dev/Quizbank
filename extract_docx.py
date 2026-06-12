import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = r'd:\QUIZBANK\THE CIRS QUIZBANK.docx'
out_path = r'd:\QUIZBANK\extracted_text.txt'

try:
    with zipfile.ZipFile(docx_path) as docx:
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        with open(out_path, 'w', encoding='utf-8') as f:
            for p in tree.findall('.//w:p', namespace):
                p_text = []
                for t in p.findall('.//w:t', namespace):
                    if t.text:
                        p_text.append(t.text)
                if p_text:
                    f.write(''.join(p_text) + '\n')
    print("Extraction successful")
except Exception as e:
    print(f"Error: {e}")
