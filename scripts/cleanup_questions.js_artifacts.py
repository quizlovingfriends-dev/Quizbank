import re
import os
import shutil

def cleanup_ocr_artifacts():
    filepath = 'd:/QUIZBANK/data/questions.js'
    backup_path = 'd:/QUIZBANK/data/questions.js.bak'
    
    # Create backup
    shutil.copy2(filepath, backup_path)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    modified_count = 0

    def fix_text(text, is_answer=False):
        nonlocal modified_count
        orig = text
        
        # 1. Strip leading "0 " or standalone numbers at start
        # e.g. "0 What is..." -> "What is..."
        # e.g. "12. What is..." -> "What is..."
        text = re.sub(r'^[0\d\.\s]+\s+', '', text)
        
        # 2. Replace " 0 " inside with " "
        text = text.replace(' 0 ', ' ')
        
        # 3. Replace "I0" with "10"
        text = text.replace('I0', '10')
        
        # 4. Odd characters
        text = text.replace('(s of Prey', '(s) of Prey')
        
        # 5. Answer cleanup for fragments
        if is_answer and len(text) > 30:
            for fragment in ['TdM', 'AlRLIFT Ad', 'MORI', 'A 1']:
                if fragment in text:
                    text = text.split(fragment)[0].strip()
        
        if text != orig:
            modified_count += 1
            return text
        return orig

    new_lines = []
    current_context = None
    
    for line in lines:
        # Detect context
        if 'question:' in line: current_context = 'question'
        elif 'answer:' in line: current_context = 'answer'
        elif 'funda:' in line: current_context = 'funda'
        elif '}' in line and current_context: # Close object
             # We might be closing a nested object or the main object. 
             # For simplicity, we'll just keep the context until the next key.
             pass

        # Match text: "..." or text: '...'
        match = re.search(r'text:\s*(["\'])(.*?)\1', line)
        if match:
            quote = match.group(1)
            val = match.group(2)
            is_answer = (current_context == 'answer')
            new_val = fix_text(val, is_answer)
            # Reconstruct the line
            new_line = line.replace(f'{quote}{val}{quote}', f'{quote}{new_val}{quote}')
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    return modified_count

if __name__ == "__main__":
    count = cleanup_ocr_artifacts()
    print(f"Cleanup complete. {count} strings modified.")
