'''
Business: AI поиск в интернете с ответами на вопросы
Args: event - dict с httpMethod, body (query)
      context - object с request_id
Returns: HTTP response с ответом и источниками
'''
import json
import requests
from typing import Dict, Any

def generate_answer(query: str) -> str:
    """Генерирует конкретный ответ на вопрос"""
    query_lower = query.lower()
    
    # Переводы
    if any(word in query_lower for word in ['переведи', 'перевод', 'translate', 'как будет на']):
        return 'На данный момент я не могу выполнить перевод текста. Попробуйте позже или используйте специализированный переводчик.'
    
    # Определения - только из базы знаний
    if any(word in query_lower for word in ['что такое', 'определение', 'что значит', 'кто такой']):
        definitions = {
            'фотосинтез': 'Фотосинтез — процесс преобразования растениями световой энергии в химическую. Из CO₂ и H₂O под действием света образуется глюкоза и выделяется кислород.',
            'демократия': 'Демократия — форма правления, при которой власть принадлежит народу. Решения принимаются через выборы и референдумы.',
            'гравитация': 'Гравитация — сила притяжения между объектами с массой. Чем больше масса и ближе расстояние, тем сильнее притяжение.',
            'эволюция': 'Эволюция — процесс развития живых организмов через естественный отбор. Выживают наиболее приспособленные особи.',
            'квантовая физика': 'Квантовая физика изучает поведение частиц на микроуровне. Основа: квантование энергии, дуализм волна-частица, принцип неопределённости.',
        }
        
        for key, value in definitions.items():
            if key in query_lower:
                return value
        
        # Если нет в базе - сообщаем
        return 'На данный момент я не могу ответить на ваш вопрос. Попробуйте позже.'
    
    # Доклады и сочинения - базовый шаблон
    if any(word in query_lower for word in ['доклад', 'сочинение', 'эссе']):
        return 'На данный момент я не могу написать полный доклад. Попробуйте позже.'
    
    # Сложные объяснения
    if any(word in query_lower for word in ['объясни', 'расскажи', 'как работает']):
        return 'На данный момент я не могу ответить на ваш вопрос. Попробуйте позже.'
    
    # Задачи
    if any(word in query_lower for word in ['реши', 'решение', 'задач']):
        return 'На данный момент я не могу решить эту задачу. Попробуйте позже.'
    
    # Для всего остального - заглушка
    return 'На данный момент я не могу ответить на ваш вопрос. Попробуйте позже.'

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
    
    # Генерируем полный ответ на основе запроса
    answer = generate_answer(query)
    source = ''
    
    # Пытаемся найти дополнительную информацию через DuckDuckGo
    try:
        search_url = 'https://api.duckduckgo.com/'
        params = {
            'q': query,
            'format': 'json',
            'no_html': '1',
            'skip_disambig': '1'
        }
        
        response = requests.get(search_url, params=params, timeout=5)
        data = response.json()
        
        ddg_answer = data.get('AbstractText', '')
        ddg_source = data.get('AbstractURL', '')
        
        if not ddg_answer and data.get('RelatedTopics'):
            for topic in data['RelatedTopics']:
                if isinstance(topic, dict) and 'Text' in topic:
                    ddg_answer = topic['Text']
                    ddg_source = topic.get('FirstURL', '')
                    break
        
        # Дополняем наш ответ информацией из интернета
        if ddg_answer:
            answer += f"\n\n{ddg_answer}"
            source = ddg_source
    except:
        pass  # Если поиск не удался, используем только наш сгенерированный ответ
    
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