'''
Business: Умный AI-ассистент для переводов, докладов, рефератов, решения задач
Args: event - dict с httpMethod, body (query)
      context - object с request_id
Returns: HTTP response с ответом (перевод, доклад, решение задачи)
'''
import json
import os
import re
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    query: str = body_data.get('query', '').strip()
    
    if not query:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Query is required'})
        }
    
    # Определяем тип запроса и обрабатываем
    query_lower = query.lower()
    answer = ''
    source = ''
    
    # 1. ПЕРЕВОД
    if any(word in query_lower for word in ['перевед', 'translate', 'translation']):
        answer, source = handle_translation(query)
    
    # 2. МАТЕМАТИКА
    elif any(word in query_lower for word in ['реш', 'вычисли', 'посчитай', 'математик', '+', '-', '*', '/', '×', '÷', '=']):
        answer, source = handle_math(query)
    
    # 3. НАУЧНЫЕ ВОПРОСЫ (Wikipedia)
    elif any(word in query_lower for word in ['что такое', 'кто такой', 'расскажи о', 'что это', 'определение', 'теория', 'закон']):
        answer, source = handle_wikipedia(query)
    
    # 4. СОЧИНЕНИЯ, ДОКЛАДЫ, РЕФЕРАТЫ (OpenAI)
    elif any(word in query_lower for word in ['сочинени', 'доклад', 'реферат', 'эссе', 'напиши', 'сделай', 'создай текст', 'абзац', 'слов']):
        answer, source = handle_writing(query)
    
    # 5. ОСТАЛЬНОЕ (OpenAI или общий ответ)
    else:
        answer, source = handle_general(query)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'answer': answer,
            'source': source
        })
    }

def handle_translation(query: str) -> tuple:
    """Перевод через OpenAI ChatGPT или простой словарь"""
    
    # Сначала пробуем простой словарь
    simple_translation = translate_simple(query)
    if simple_translation:
        return (simple_translation, 'Встроенный словарь')
    
    api_key = os.environ.get('OPENAI_API_KEY')
    
    if not api_key:
        return ('Не удалось найти перевод. Попробуйте более простой запрос.', '')
    
    # Определяем целевой язык
    target_lang = 'русский'
    if 'на английский' in query.lower() or 'to english' in query.lower():
        target_lang = 'английский'
    elif 'на испанский' in query.lower():
        target_lang = 'испанский'
    elif 'на французский' in query.lower():
        target_lang = 'французский'
    elif 'на немецкий' in query.lower():
        target_lang = 'немецкий'
    
    # Извлекаем текст для перевода
    text_to_translate = re.sub(r'(перевед[иь]?|translate|на \w+|to \w+|:)', '', query, flags=re.IGNORECASE).strip()
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': f'Ты профессиональный переводчик. Переведи текст на {target_lang}. Отвечай ТОЛЬКО переводом, без лишних слов.'
                    },
                    {
                        'role': 'user',
                        'content': text_to_translate
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 1000
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            translation = data['choices'][0]['message']['content'].strip()
            return (translation, 'ChatGPT Translation')
        else:
            return (f'Ошибка перевода: {response.status_code}', '')
            
    except Exception as e:
        return (f'Не удалось выполнить перевод: {str(e)}', '')

def handle_math(query: str) -> tuple:
    """Решение математических задач через OpenAI"""
    api_key = os.environ.get('OPENAI_API_KEY')
    
    if not api_key:
        # Простые вычисления без API
        math_match = re.search(r'(\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(\d+(?:\.\d+)?)', query)
        if math_match:
            num1, op, num2 = float(math_match.group(1)), math_match.group(2), float(math_match.group(3))
            ops = {'+': num1 + num2, '-': num1 - num2, '*': num1 * num2, '×': num1 * num2, 
                   '/': num1 / num2 if num2 != 0 else 'деление на ноль', '÷': num1 / num2 if num2 != 0 else 'деление на ноль'}
            result = ops.get(op, 'неизвестная операция')
            return (f'Ответ: {result}', 'Встроенный калькулятор')
        return ('Укажите математическую задачу', '')
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'Ты математик-эксперт. Решай задачи пошагово и чётко. Показывай ход решения и финальный ответ.'
                    },
                    {
                        'role': 'user',
                        'content': query
                    }
                ],
                'temperature': 0.2,
                'max_tokens': 1500
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            solution = data['choices'][0]['message']['content'].strip()
            return (solution, 'ChatGPT Math Solver')
        else:
            return (f'Ошибка решения: {response.status_code}', '')
            
    except Exception as e:
        return (f'Не удалось решить задачу: {str(e)}', '')

def handle_wikipedia(query: str) -> tuple:
    """Поиск информации в Wikipedia"""
    # Извлекаем ключевое слово
    search_term = re.sub(r'(что такое|кто такой|расскажи о|что это|определение|теория|закон)', '', query, flags=re.IGNORECASE).strip()
    
    try:
        # Поиск в русской Wikipedia
        search_response = requests.get(
            'https://ru.wikipedia.org/w/api.php',
            params={
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': search_term,
                'srlimit': 1
            },
            timeout=10
        )
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            
            if search_data.get('query', {}).get('search'):
                page_title = search_data['query']['search'][0]['title']
                
                # Получаем содержимое статьи
                content_response = requests.get(
                    'https://ru.wikipedia.org/w/api.php',
                    params={
                        'action': 'query',
                        'format': 'json',
                        'prop': 'extracts',
                        'exintro': True,
                        'explaintext': True,
                        'titles': page_title
                    },
                    timeout=10
                )
                
                if content_response.status_code == 200:
                    content_data = content_response.json()
                    pages = content_data.get('query', {}).get('pages', {})
                    
                    for page_id, page_info in pages.items():
                        extract = page_info.get('extract', '')
                        if extract:
                            # Берём первые 500 символов
                            summary = extract[:800].strip()
                            return (f"{summary}...", f"Wikipedia: {page_title}")
        
        # Если Wikipedia не нашла - используем OpenAI
        return handle_general(query)
        
    except Exception as e:
        return handle_general(query)

def handle_writing(query: str) -> tuple:
    """Генерация текстов (сочинения, доклады, рефераты) через OpenAI"""
    api_key = os.environ.get('OPENAI_API_KEY')
    
    if not api_key:
        return ('Для создания текстов необходим API ключ OpenAI', '')
    
    # Определяем требования к тексту
    word_count = None
    paragraph_count = None
    
    word_match = re.search(r'(\d+)\s*слов', query, re.IGNORECASE)
    if word_match:
        word_count = int(word_match.group(1))
    
    para_match = re.search(r'(\d+)\s*абзац', query, re.IGNORECASE)
    if para_match:
        paragraph_count = int(para_match.group(1))
    
    system_prompt = 'Ты профессиональный писатель и копирайтер. Создаёшь качественные тексты строго по требованиям.'
    
    if word_count:
        system_prompt += f' ВАЖНО: Текст должен быть РОВНО {word_count} слов. Не больше, не меньше.'
    if paragraph_count:
        system_prompt += f' ВАЖНО: Текст должен содержать РОВНО {paragraph_count} абзаца.'
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': system_prompt
                    },
                    {
                        'role': 'user',
                        'content': query
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 2000
            },
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            text = data['choices'][0]['message']['content'].strip()
            
            # Проверяем соответствие требованиям
            actual_words = len(text.split())
            info = f"ChatGPT Writer (слов: {actual_words}"
            if paragraph_count:
                actual_paras = len([p for p in text.split('\n\n') if p.strip()])
                info += f", абзацев: {actual_paras}"
            info += ")"
            
            return (text, info)
        else:
            return (f'Ошибка генерации текста: {response.status_code}', '')
            
    except Exception as e:
        return (f'Не удалось создать текст: {str(e)}', '')

def translate_simple(query: str) -> str:
    """Простой перевод без API для базовых слов"""
    query_lower = query.lower()
    
    # Убираем служебные слова
    text = re.sub(r'(перевед[иь]?|translate|на \w+|to \w+|:)', '', query_lower, flags=re.IGNORECASE).strip()
    
    # Базовый словарь (расширенный)
    translations = {
        # Основные слова
        'hello': 'привет', 'привет': 'hello',
        'world': 'мир', 'мир': 'world',
        'thanks': 'спасибо', 'thank you': 'спасибо', 'спасибо': 'thanks',
        'good': 'хорошо', 'хорошо': 'good',
        'bad': 'плохо', 'плохо': 'bad',
        'yes': 'да', 'да': 'yes',
        'no': 'нет', 'нет': 'no',
        
        # Животные
        'cat': 'кот', 'кот': 'cat', 'кошка': 'cat',
        'dog': 'собака', 'собака': 'dog',
        'bird': 'птица', 'птица': 'bird',
        'fish': 'рыба', 'рыба': 'fish',
        
        # Предметы
        'house': 'дом', 'дом': 'house',
        'water': 'вода', 'вода': 'water',
        'fire': 'огонь', 'огонь': 'fire',
        'book': 'книга', 'книга': 'book',
        'car': 'машина', 'машина': 'car',
        'phone': 'телефон', 'телефон': 'phone',
        'computer': 'компьютер', 'компьютер': 'computer',
        
        # Абстрактные понятия
        'love': 'любовь', 'любовь': 'love',
        'friend': 'друг', 'друг': 'friend',
        'time': 'время', 'время': 'time',
        'life': 'жизнь', 'жизнь': 'life',
        'work': 'работа', 'работа': 'work',
        'money': 'деньги', 'деньги': 'money',
        
        # Цвета
        'red': 'красный', 'красный': 'red',
        'blue': 'синий', 'синий': 'blue',
        'green': 'зелёный', 'зелёный': 'green', 'зеленый': 'green',
        'white': 'белый', 'белый': 'white',
        'black': 'чёрный', 'чёрный': 'black', 'черный': 'black',
        
        # Числа
        'one': 'один', 'один': 'one',
        'two': 'два', 'два': 'two',
        'three': 'три', 'три': 'three',
        'four': 'четыре', 'четыре': 'four',
        'five': 'пять', 'пять': 'five',
    }
    
    # Проверяем прямое совпадение
    if text in translations:
        return f"Перевод: {translations[text]}"
    
    # Проверяем наличие слова в тексте
    for key, value in translations.items():
        if key in text:
            return f"Перевод '{key}': {value}"
    
    return None

def handle_general(query: str) -> tuple:
    """Общие вопросы через OpenAI"""
    api_key = os.environ.get('OPENAI_API_KEY')
    
    if not api_key:
        return ('Добро пожаловать в AI Platform! Я могу помочь с переводами (простые слова), математикой и поиском в Wikipedia. Для более сложных запросов требуется настройка OpenAI API.', '')
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'Ты умный AI-ассистент AI Platform. Отвечай кратко, понятно и по делу на русском языке.'
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
            return (answer, 'ChatGPT Assistant')
        else:
            return ('Не удалось получить ответ. Попробуйте ещё раз.', '')
            
    except Exception as e:
        return (f'Ошибка сервиса: {str(e)}', '')