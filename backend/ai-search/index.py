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

def ask_chatgpt(query: str) -> str:
    """Получает ответ от ChatGPT"""
    api_key = os.environ.get('OPENAI_API_KEY', '')
    
    if not api_key:
        return 'Ошибка: не настроен API ключ OpenAI. Обратитесь к администратору.'
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-3.5-turbo',
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
        
        data = response.json()
        
        if response.status_code == 200:
            answer = data['choices'][0]['message']['content'].strip()
            return answer
        else:
            error = data.get('error', {}).get('message', 'Неизвестная ошибка')
            return f'Ошибка ChatGPT: {error}'
            
    except Exception as e:
        return f'Ошибка при обращении к ChatGPT: {str(e)}'

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
    
    # Получаем ответ от ChatGPT
    answer = ask_chatgpt(query)
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