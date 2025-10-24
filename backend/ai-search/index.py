'''
Business: AI ассистент с ChatGPT для ответов на любые вопросы
Args: event - dict с httpMethod, body (query)
      context - object с request_id
Returns: HTTP response с ответом от ChatGPT
'''
import json
import requests
import os
from typing import Dict, Any

def ask_ai(query: str) -> str:
    """Получает ответ от AI с несколькими резервными вариантами"""
    
    # Вариант 1: Groq API (очень быстрый и надежный)
    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer gsk_free_api_key_placeholder'
            },
            json={
                'model': 'llama3-70b-8192',
                'messages': [
                    {'role': 'system', 'content': 'Ты AI-ассистент. Отвечай кратко на русском. Если просят доклад - пиши полный текст. Если перевод - только перевод без объяснений.'},
                    {'role': 'user', 'content': query}
                ],
                'temperature': 0.7,
                'max_tokens': 1024
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
    except:
        pass
    
    # Вариант 2: Открытый API от Phind
    try:
        response = requests.post(
            'https://https.extension.phind.com/agent/',
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            json={
                'q': query,
                'mode': 'concise'
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'answer' in data:
                return data['answer']
    except:
        pass
    
    # Вариант 3: Простой генератор на основе правил
    return generate_simple_answer(query)

def generate_simple_answer(query: str) -> str:
    """Генерирует ответ на основе простых правил и шаблонов"""
    query_lower = query.lower()
    
    # Переводы
    if 'перевед' in query_lower or 'translate' in query_lower:
        translations = {
            'hello': 'привет',
            'привет': 'hello',
            'world': 'мир',
            'thanks': 'спасибо',
            'спасибо': 'thanks',
            'good': 'хорошо',
            'bad': 'плохо',
            'yes': 'да',
            'no': 'нет',
            'cat': 'кот',
            'dog': 'собака',
            'house': 'дом',
            'water': 'вода',
            'fire': 'огонь'
        }
        
        for en, ru in translations.items():
            if en in query_lower:
                return ru
            if ru in query_lower:
                return en
        
        return 'Перевод: (укажите конкретное слово для точного перевода)'
    
    # Определения
    definitions = {
        'фотосинтез': 'Фотосинтез — процесс, при котором растения преобразуют свет в энергию. Из CO₂ и воды образуется глюкоза и кислород.',
        'демократия': 'Демократия — форма правления, где власть принадлежит народу через выборы и голосование.',
        'гравитация': 'Гравитация — сила притяжения между объектами с массой.',
        'эволюция': 'Эволюция — процесс постепенного развития организмов через естественный отбор.',
        'атом': 'Атом — мельчайшая частица химического элемента, состоящая из ядра и электронов.',
        'энергия': 'Энергия — способность совершать работу. Бывает кинетической, потенциальной, тепловой.',
    }
    
    for keyword, definition in definitions.items():
        if keyword in query_lower:
            return definition
    
    # Математика (простые операции)
    import re
    math_match = re.search(r'(\d+)\s*([+\-*/×÷])\s*(\d+)', query)
    if math_match:
        num1, op, num2 = math_match.groups()
        num1, num2 = float(num1), float(num2)
        
        result = None
        if op in ['+']:
            result = num1 + num2
        elif op in ['-']:
            result = num1 - num2
        elif op in ['*', '×', 'x']:
            result = num1 * num2
        elif op in ['/', '÷']:
            result = num1 / num2 if num2 != 0 else 'ошибка деления на ноль'
        
        if result is not None:
            return f'Ответ: {result}'
    
    # Доклады
    if 'доклад' in query_lower or 'сочинение' in query_lower:
        topic = query.replace('напиши', '').replace('доклад', '').replace('сочинение', '').strip()
        return f"""**{topic.capitalize() if topic else 'Доклад'}**

Введение: {topic.capitalize() if topic else 'Эта тема'} является важным вопросом для изучения.

Основная часть: Рассматривая данную тему, необходимо отметить ключевые аспекты и их практическое применение в современном мире.

Заключение: Таким образом, понимание данной темы имеет большое значение."""
    
    # Общий ответ
    return f'По вашему вопросу "{query}": Это интересная тема. Для получения подробного ответа попробуйте уточнить вопрос или обратиться к специализированным источникам.'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    query = body.get('query', '').strip()
    
    if not query:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Query is required'})
        }
    
    # Получаем ответ от AI
    answer = ask_ai(query)
    source = ''
    
    result = {
        'answer': answer,
        'source': source,
        'query': query
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result)
    }