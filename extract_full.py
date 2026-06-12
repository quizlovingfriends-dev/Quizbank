import fitz
import os
import json
import re

pdf_path = r'd:\QUIZBANK\THE CIRS QUIZBANK.pdf'
output_images_dir = r'd:\QUIZBANK\images'
output_json_path = r'd:\QUIZBANK\scratch\extracted_questions.json'

if not os.path.exists(output_images_dir):
    os.makedirs(output_images_dir)

def get_topic(text):
    text = text.lower()
    if any(k in text for k in ['sport', 'cricket', 'football', 'olympic', 'match', 'player', 'athlete']):
        return "sports"
    if any(k in text for k in ['animal', 'tiger', 'lion', 'bird', 'wildlife', 'nature', 'predator', 'flower', 'plant']):
        return "wildlife"
    if any(k in text for k in ['history', 'empire', 'ancient', 'built by', 'century', 'dynasty', 'discovery', 'war', 'revolution']):
        return "history"
    if any(k in text for k in ['minister', 'politics', 'government', 'election', 'court', 'unsc', 'country code', 'iso', 'cia', 'fbi']):
        return "politics"
    if any(k in text for k in ['cuisine', 'food', 'dish', 'recipe', 'ingredient', 'taste', 'miso', 'poutine', 'saffron']):
        return "cuisines"
    if any(k in text for k in ['current', 'recent', '2023', '2024', 'news', 'achievement', 'landing', 'celebrity']):
        return "current-affairs"
    return "general"

def extract_all():
    doc = fitz.open(pdf_path)
    questions = []
    current_q = None
    state = 'SEARCHING'
    global_q_id = 100

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("blocks")
        images = page.get_image_info(xrefs=True)
        
        blocks.sort(key=lambda b: (b[1], b[0]))
        
        for b in blocks:
            block_text = b[4]
            lines = block_text.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                new_q_match = re.match(r'^(?:Q|Question\s*)?(\d+)[\.\)]\s*(.*)', line, re.IGNORECASE)
                is_header = line.isupper() and len(line) > 5 and "ANSWER" not in line and not new_q_match
                
                if new_q_match:
                    if current_q:
                        questions.append(current_q)
                    
                    global_q_id += 1
                    current_q = {
                        "id": global_q_id,
                        "topic": "general",
                        "question": {"text": new_q_match.group(2), "image": None},
                        "answer": {"text": "", "image": None},
                        "funda": {"text": "", "image": None}
                    }
                    state = 'QUESTION'
                elif "ANSWER:" in line:
                    if current_q:
                        ans_text = line.split("ANSWER:", 1)[1].strip()
                        current_q["answer"]["text"] = ans_text
                        state = 'ANSWER'
                elif re.search(r'funda:', line, re.IGNORECASE):
                    if current_q:
                        # Split case-insensitively
                        parts = re.split(r'funda:', line, maxsplit=1, flags=re.IGNORECASE)
                        f_text = parts[1].strip()
                        current_q["funda"]["text"] = f_text
                        state = 'FUNDA'
                elif is_header:
                    if current_q:
                        if state == 'QUESTION':
                            current_q["question"]["text"] += "\n" + line
                        elif state == 'ANSWER':
                            current_q["answer"]["text"] += "\n" + line
                elif current_q:
                    if state == 'QUESTION':
                        current_q["question"]["text"] += "\n" + line
                    elif state == 'ANSWER':
                        current_q["answer"]["text"] += "\n" + line
                    elif state == 'FUNDA':
                        current_q["funda"]["text"] += "\n" + line

        for img in images:
            xref = img['xref']
            if current_q:
                img_name = f"q{current_q['id']}_{state.lower()}.png"
                img_path = os.path.join(output_images_dir, img_name)
                try:
                    pix = fitz.Pixmap(doc, xref)
                    if pix.n - pix.alpha > 3:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save(img_path)
                    current_q[state.lower()]["image"] = f"images/{img_name}"
                except Exception as e:
                    pass

    if current_q:
        questions.append(current_q)

    for q in questions:
        q["topic"] = get_topic(q["question"]["text"] + " " + q["answer"]["text"])
        q["question"]["text"] = q["question"]["text"].strip()
        q["answer"]["text"] = q["answer"]["text"].strip()
        q["funda"]["text"] = q["funda"]["text"].strip()

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2)

    print(f"Extracted {len(questions)} questions.")

if __name__ == "__main__":
    extract_all()
