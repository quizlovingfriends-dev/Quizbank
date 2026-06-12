import re
import os
import shutil

def reclassify_topics():
    filepath = 'd:/QUIZBANK/data/questions.js'
    backup_path = 'd:/QUIZBANK/data/questions.js.bak'
    
    # Create backup
    shutil.copy2(filepath, backup_path)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define rules
    rules = {
        "sports": ["cricket", "football", "olympic", "athlete", "sport", "tennis", "fifa", "ipl", "world cup", "marathon", "fitness", "gym", "golf", "top gun"],
        "wildlife": ["bird", "animal", "species", "forest", "wildlife", "eagle", "sonar", "radar", "biomimicry", "fauna"],
        "history": ["spitfire", "war", "kamikaze", "world war", "ww2", "ancient", "century", "empire", "historical", "museum", "naval aviation", "dunkirk", "robert frost", "maverick"],
        "politics": ["minister", "election", "government", "gandhi", "bhutto", "parliament", "prime minister", "president", "trump", "modi", "biden", "sussex", "duke", "duchess"],
        "cuisines": ["dish", "food", "recipe", "restaurant", "chef", "baguette", "ingredient"],
        "current-affairs": ["2023", "2024", "2025", "recent", "kobe bryant", "biju patnaik"]
    }

    # Split into objects
    # This is a bit complex for a regex if the objects have nested braces,
    # but based on the file content, they are flat-ish.
    # Pattern: { id: ..., topic: "...", ... }
    
    # Let's find all question objects
    objects = re.split(r'\n\s*{\s*\n', content)
    
    reclassified = {topic: 0 for topic in rules}
    total_modified = 0

    new_objects = []
    
    # The first split part is the header
    new_objects.append(objects[0])
    
    for obj_str in objects[1:]:
        # Extract topic
        topic_match = re.search(r'topic:\s*["\'](.*?)["\']', obj_str)
        if topic_match:
            current_topic = topic_match.group(1)
            
            # Only re-classify if it's "general"
            if current_topic == "general":
                # Combine all text fields for searching
                combined_text = obj_str.lower()
                
                new_topic = "general"
                for topic, keywords in rules.items():
                    if any(kw in combined_text for kw in keywords):
                        new_topic = topic
                        break
                
                if new_topic != "general":
                    obj_str = obj_str.replace(f'topic: "{current_topic}"', f'topic: "{new_topic}"')
                    obj_str = obj_str.replace(f"topic: '{current_topic}'", f"topic: '{new_topic}'")
                    reclassified[new_topic] += 1
                    total_modified += 1
        
        new_objects.append(obj_str)

    # Reassemble
    new_content = "\n  {\n".join(new_objects)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Re-classification complete. {total_modified} questions reclassified.")
    for topic, count in reclassified.items():
        if count > 0:
            print(f"  - {topic}: {count}")

if __name__ == "__main__":
    reclassify_topics()
