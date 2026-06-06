import os
from PIL import Image, ImageDraw, ImageFont

def build_og_card():
    # 1200x630 OG Standard
    W, H = 1200, 630
    bg_color = (243, 240, 232) # #f3f0e8
    border_color = (10, 10, 10) # #0a0a0a
    hot_color = (255, 51, 0) # #ff3300
    
    img = Image.new('RGB', (W, H), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([0, 0, W-1, H-1], outline=border_color, width=20)
    
    # Text
    try:
        # Try to find a mono font on system
        font_path = "C:\\Windows\\Fonts\\lucon.ttf" # Lucida Console is standard on Win
        if not os.path.exists(font_path): font_path = "arial.ttf"
        
        font_big = ImageFont.truetype(font_path, 120)
        font_sub = ImageFont.truetype(font_path, 40)
    except:
        font_big = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Draw "QUIZVAULT"
    draw.text((W//2, H//2 - 50), "QUIZVAULT", fill=border_color, font=font_big, anchor="mm")
    
    # Draw Subtitle
    draw.text((W//2, H//2 + 50), "GK QUESTION BANK • v1.0", fill=(85, 85, 85), font=font_sub, anchor="mm")
    
    # Draw Hot Mark
    draw.polygon([(W//2 - 200, H//2 - 100), (W//2 - 200, H//2 - 60), (W//2 - 170, H//2 - 80)], fill=hot_color)
    
    output_dir = "D:/QUIZBANK/images"
    if not os.path.exists(output_dir): os.makedirs(output_dir)
    img.save(os.path.join(output_dir, "og_card.png"))
    print("Generated images/og_card.png")

def build_favicon():
    size = 32
    bg_color = (243, 240, 232)
    ink_color = (10, 10, 10)
    hot_color = (255, 51, 0)
    
    img = Image.new('RGB', (size, size), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Q
    try:
        font = ImageFont.truetype("C:\\Windows\\Fonts\\lucon.ttf", 24)
    except:
        font = ImageFont.load_default()
        
    draw.text((size//2, size//2), "Q", fill=ink_color, font=font, anchor="mm")
    
    # Dot
    draw.ellipse([size-6, 2, size-2, 6], fill=hot_color)
    
    img.save("D:/QUIZBANK/images/favicon.png")
    print("Generated images/favicon.png")

if __name__ == "__main__":
    build_og_card()
    build_favicon()
