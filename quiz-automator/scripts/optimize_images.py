from PIL import Image, ImageFile
import os, glob

ImageFile.LOAD_TRUNCATED_IMAGES = True

IMAGES_DIR = 'D:/QUIZBANK/images'
BACKUP = IMAGES_DIR + '_originals_backup'
os.makedirs(BACKUP, exist_ok=True)

# Keep track of renamed files to update data/questions.js later
renames = {}

for path in glob.glob(IMAGES_DIR + '/*.png') + glob.glob(IMAGES_DIR + '/*.jpg'):
    name = os.path.basename(path)
    if 'favicon' in name:
        continue # Don't touch favicons
    size = os.path.getsize(path)
    if size < 100_000 and path.endswith('.jpg'): 
        continue  # already small enough and is a JPG

    # Backup original
    backup_path = os.path.join(BACKUP, name)
    if not os.path.exists(backup_path):
        os.rename(path, backup_path)
    else:
        # backup already exists, use it as source
        pass

    try:
        img = Image.open(backup_path)
    except Exception as e:
        print(f"Error opening {backup_path}: {e}")
        continue
        
    if img.mode in ('RGBA', 'LA', 'P'): 
        img = img.convert('RGB')

    # Resize if huge
    if max(img.size) > 1200:
        img.thumbnail((1200, 1200), Image.LANCZOS)

    # Save as JPEG at quality 80
    new_name = os.path.splitext(name)[0] + '.jpg'
    new_path = os.path.join(IMAGES_DIR, new_name)
    img.save(new_path, 'JPEG', quality=80, optimize=True)
    
    if new_name != name:
        renames[name] = new_name
    
    # Remove original PNG from working dir if it was backed up
    if new_path != path and os.path.exists(path):
        os.remove(path)
        
    print(f'{name}: {size//1024}KB -> {os.path.getsize(new_path)//1024}KB')

# Update data/questions.js
questions_path = 'D:/QUIZBANK/data/questions.js'
with open(questions_path, 'r', encoding='utf-8') as f:
    content = f.read()

for old_name, new_name in renames.items():
    content = content.replace(f'"{old_name}"', f'"{new_name}"')
    content = content.replace(f"'{old_name}'", f"'{new_name}'")

with open(questions_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Updated questions.js with {len(renames)} renamed images.")
