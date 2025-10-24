import json
import base64
import io
from PIL import Image, ImageEnhance, ImageFilter
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI image enhancement using PIL
    Args: event with POST method, body with base64 image
    Returns: Enhanced image as base64
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body = json.loads(event.get('body', '{}'))
    image_data = body.get('image')
    
    if not image_data:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Image data required'})
        }
    
    try:
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes))
        
        width, height = img.size
        new_size = (int(width * 1.5), int(height * 1.5))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
        
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.1)
        
        img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
        
        output_buffer = io.BytesIO()
        img.save(output_buffer, format='PNG', quality=95)
        output_buffer.seek(0)
        
        enhanced_base64 = base64.b64encode(output_buffer.read()).decode('utf-8')
        enhanced_data_url = f'data:image/png;base64,{enhanced_base64}'
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'enhanced_url': enhanced_data_url
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Enhancement error: {str(e)}'})
        }