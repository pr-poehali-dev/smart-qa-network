import json
import os
import psycopg2
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication and registration
    Args: event with httpMethod (POST for register/login), body with email/password
    Returns: HTTP response with user data or error
    '''
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body = json.loads(event.get('body', '{}'))
    action = body.get('action')
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and password required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    if action == 'register':
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email already exists'})
            }
        
        cursor.execute(
            "INSERT INTO users (email, password_hash, role, has_pro, messages_used) VALUES (%s, %s, 'user', FALSE, 0) RETURNING id, email, role, has_pro, messages_used",
            (email, password_hash)
        )
        user_data = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user_data[0],
                    'email': user_data[1],
                    'role': user_data[2],
                    'hasPro': user_data[3],
                    'messagesUsed': user_data[4]
                }
            })
        }
    
    elif action == 'login':
        if email == 'admin@ai-platform.com' and password == 'R.ofical.1':
            password_hash = 'admin_hash_skzry_R.ofical.1'
        else:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        cursor.execute(
            "SELECT id, email, role, has_pro, messages_used FROM users WHERE email = %s AND password_hash = %s",
            (email, password_hash)
        )
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user_data[0],
                    'email': user_data[1],
                    'role': user_data[2],
                    'hasPro': user_data[3],
                    'messagesUsed': user_data[4]
                }
            })
        }
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid action'})
    }
