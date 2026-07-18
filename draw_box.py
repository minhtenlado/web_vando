from PIL import Image, ImageDraw

# Open the user's image
img = Image.open('/home/vando/.gemini/antigravity/brain/3856a282-be6e-422c-8c6a-51ada1b07bb9/uploaded_media_1784310476157.png')
draw = ImageDraw.Draw(img)

# The "Deployments" link in the breadcrumb is roughly around (510, 100) to (590, 115)
# Let's draw a red box around the "Deployments" menu item on the left sidebar
# and another one around "Deployments" in the top breadcrumb.

# Left sidebar "Deployments" box (approx coordinates)
draw.rectangle([10, 210, 140, 240], outline="red", width=3)

# Top breadcrumb "Deployments" box (approx coordinates)
draw.rectangle([485, 95, 570, 115], outline="red", width=3)

img.save('/home/vando/.gemini/antigravity/brain/3856a282-be6e-422c-8c6a-51ada1b07bb9/guide.png')
print("Image saved")
