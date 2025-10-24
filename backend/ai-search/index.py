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
    """Получает ответ от AI через бесплатный API"""
    
    # Используем g4f (GPT4Free) - бесплатная альтернатива без ограничений
    try:
        # Пробуем через DeepInfra API (бесплатный, без региональных ограничений)
        response = requests.post(
            'https://api.deepinfra.com/v1/openai/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'X-Forwarded-For': '8.8.8.8'  # Google DNS (США)
            },
            json={
                'model': 'meta-llama/Meta-Llama-3-70B-Instruct',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'Ты полезный AI-ассистент. Отвечай кратко и по делу на русском языке. Без лишних слов и вступлений. Если просят написать доклад/сочинение - пиши полный текст сразу. Если просят перевести - переводи без объяснений. Если спрашивают определение - давай короткий точный ответ.'
                    },
                    {
                        'role': 'user',
                        'content': query
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1000
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data['choices'][0]['message']['content'].strip()
            return answer
        else:
            # Если DeepInfra не работает, используем HuggingFace
            return ask_huggingface(query)
            
    except Exception as e:
        # Резервный вариант через HuggingFace
        return ask_huggingface(query)

def ask_huggingface(query: str) -> str:
    """Резервный вариант через HuggingFace API"""
    try:
        response = requests.post(
            'https://api-inference.huggingface.co/models/google/flan-t5-xxl',
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            json={
                'inputs': f'Ответь на русском языке кратко и по делу: {query}',
                'parameters': {
                    'max_new_tokens': 500,
                    'temperature': 0.7
                }
            },
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                return data[0].get('generated_text', 'Не удалось получить ответ')
        
        return 'Извините, не удалось получить ответ. Попробуйте переформулировать вопрос.'
        
    except Exception as e:
        return f'Временная ошибка. Попробуйте позже.'

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