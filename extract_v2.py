import fitz
import re
import json
import os

pdf_path = r'd:\QUIZBANK\THE CIRS QUIZBANK.pdf'
output_json_path = r'd:\QUIZBANK\scratch\extracted_text_v2.json'
debug_log_path = r'd:\QUIZBANK\scratch\debug_v2.log'

def normalize_text(text):
    return text.replace('\u200b', '').strip()

def is_section_header(line):
    line = line.strip()
    # Reject bracketed lines
    if line.startswith('[') and line.endswith(']'):
        return False
    # Reject short noise
    if len(line) < 5:
        return False
    # Must be uppercase AND alphabetic-heavy
    alpha_count = sum(c.isalpha() for c in line)
    alpha_ratio = alpha_count / max(len(line), 1)
    if line.isupper() and alpha_ratio > 0.6:
        # Avoid matching numbered items as headers
        if re.match(r'^\d+[\.\)]', line):
            return False
        return True
    return False

def extract_phased():
    doc = fitz.open(pdf_path)
    questions = []
    
    # States: IDLE, READING_QUESTION, READING_ANSWER, READING_FUNDA
    state = "IDLE"
    current_q = None
    current_section = "GENERAL"
    global_id_counter = 101
    
    with open(debug_log_path, 'w', encoding='utf-8') as log:
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_dict = page.get_text("dict")
            
            all_spans = []
            for block in page_dict["blocks"]:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            all_spans.append(span)
            
            all_spans.sort(key=lambda s: (s["bbox"][1], s["bbox"][0]))
            
            lines = []
            if all_spans:
                curr_line = [all_spans[0]]
                for i in range(1, len(all_spans)):
                    if abs(all_spans[i]["bbox"][1] - curr_line[0]["bbox"][1]) < 3:
                        curr_line.append(all_spans[i])
                    else:
                        lines.append(curr_line)
                        curr_line = [all_spans[i]]
                lines.append(curr_line)

            for line_spans in lines:
                line_text = normalize_text("".join([s["text"] for s in line_spans]))
                if not line_text:
                    continue
                
                y_pos = line_spans[0]["bbox"][1]
                
                # Detect New Question
                new_q_match = re.match(r'^(\d+)[\.\)]\s*(.*)', line_text)
                if new_q_match:
                    if current_q:
                        questions.append(current_q)
                    
                    current_q = {
                        "id": global_id_counter,
                        "section": current_section,
                        "page": page_num + 1,
                        "y_start": y_pos,
                        "question": {"text": new_q_match.group(2), "image": None},
                        "answer": {"text": "", "image": None},
                        "funda": {"text": "", "image": None},
                        "raw_lines": [line_text],
                        "has_image": "[ATTACH IMAGE]" in line_text.upper()
                    }
                    global_id_counter += 1
                    state = "READING_QUESTION"
                    continue

                # Detect Answer
                if "ANSWER:" in line_text:
                    if current_q:
                        parts = re.split(r'ANSWER:', line_text, maxsplit=1, flags=re.IGNORECASE)
                        if parts[0].strip():
                            current_q["question"]["text"] += " " + parts[0].strip()
                        if len(parts) > 1:
                            current_q["answer"]["text"] = parts[1].strip()
                        
                        current_q["y_answer"] = y_pos
                        current_q["raw_lines"].append(line_text)
                        state = "READING_ANSWER"
                    else:
                        # Orphan Recovery
                        if questions and not questions[-1]["answer"]["text"]:
                            ans_text = line_text.split("ANSWER:", 1)[1].strip()
                            questions[-1]["answer"]["text"] = ans_text
                            questions[-1]["raw_lines"].append(line_text)
                            questions[-1]["y_answer"] = y_pos
                            log.write(f"[INFO] Recovered orphan answer for Q{questions[-1]['id']} on Page {page_num+1}\n")
                            # Continue as answer state for subsequent lines
                            current_q = questions.pop()
                            state = "READING_ANSWER"
                        else:
                            log.write(f"[WARNING] Orphan ANSWER | Page: {page_num+1} | Line: {line_text}\n")
                    continue

                # Detect Funda
                if re.search(r'funda:', line_text, re.IGNORECASE):
                    if current_q:
                        parts = re.split(r'funda:', line_text, maxsplit=1, flags=re.IGNORECASE)
                        if state == "READING_ANSWER" and parts[0].strip():
                            current_q["answer"]["text"] += " " + parts[0].strip()
                        if len(parts) > 1:
                            current_q["funda"]["text"] = parts[1].strip()
                        current_q["y_funda"] = y_pos
                        current_q["raw_lines"].append(line_text)
                        state = "READING_FUNDA"
                    else:
                        if questions:
                            parts = re.split(r'funda:', line_text, maxsplit=1, flags=re.IGNORECASE)
                            questions[-1]["funda"]["text"] = parts[1].strip()
                            questions[-1]["raw_lines"].append(line_text)
                            questions[-1]["y_funda"] = y_pos
                            log.write(f"[INFO] Recovered orphan funda for Q{questions[-1]['id']} on Page {page_num+1}\n")
                    continue

                # Detect Section Header
                if is_section_header(line_text):
                    # Only switch if not in middle of collecting question without answer
                    if state == "IDLE" or (current_q and current_q["answer"]["text"]):
                        current_section = line_text
                        log.write(f"[SECTION] Page {page_num+1}: {current_section}\n")
                        if current_q:
                            questions.append(current_q)
                            current_q = None
                            state = "IDLE"
                        continue

                # Append to current state
                if current_q:
                    current_q["raw_lines"].append(line_text)
                    if "[ATTACH IMAGE]" in line_text.upper():
                        current_q["has_image"] = True
                    
                    if state == "READING_QUESTION":
                        current_q["question"]["text"] += " " + line_text
                    elif state == "READING_ANSWER":
                        current_q["answer"]["text"] += " " + line_text
                    elif state == "READING_FUNDA":
                        current_q["funda"]["text"] += " " + line_text

    if current_q:
        questions.append(current_q)
    
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2)
    
    print(f"Total questions extracted: {len(questions)}")
    log.write(f"\nFinal count: {len(questions)}\n")

if __name__ == "__main__":
    extract_phased()
