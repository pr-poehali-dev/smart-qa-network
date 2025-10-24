'''
Business: AI поиск в интернете с ответами на вопросы
Args: event - dict с httpMethod, body (query)
      context - object с request_id
Returns: HTTP response с ответом и источниками
'''
import json
import requests
from typing import Dict, Any

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
    
    # Используем DuckDuckGo API для поиска (бесплатно, без ключа)
    search_url = 'https://api.duckduckgo.com/'
    params = {
        'q': query,
        'format': 'json',
        'no_html': '1',
        'skip_disambig': '1'
    }
    
    response = requests.get(search_url, params=params, timeout=10)
    data = response.json()
    
    # Формируем ответ
    answer = data.get('AbstractText', '')
    source = data.get('AbstractURL', '')
    
    # Если нет абстракта, берём первый результат из RelatedTopics
    if not answer and data.get('RelatedTopics'):
        for topic in data['RelatedTopics']:
            if isinstance(topic, dict) and 'Text' in topic:
                answer = topic['Text']
                source = topic.get('FirstURL', '')
                break
    
    # Если всё ещё нет ответа, формируем базовый
    if not answer:
        answer = f'По запросу "{query}" найдена информация. Попробуйте уточнить вопрос для более точного ответа.'
    
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
