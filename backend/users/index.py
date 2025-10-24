import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user profiles and PRO status
    Args: event with httpMethod (GET/POST), user_id for operations
    Returns: HTTP response with user data or update status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        list_all = params.get('list_all') == 'true'
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if list_all:
            cursor.execute("SELECT id, email, role, has_pro, messages_used FROM users WHERE role = 'user' ORDER BY created_at DESC")
            users = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': [
                        {
                            'id': u[0],
                            'email': u[1],
                            'role': u[2],
                            'hasPro': u[3],
                            'messagesUsed': u[4]
                        } for u in users
                    ]
                })
            }
        
        if user_id:
            cursor.execute("SELECT id, email, role, has_pro, messages_used FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'role': user[2],
                        'hasPro': user[3],
                        'messagesUsed': user[4]
                    }
                })
            }
    
    elif method in ['POST', 'PUT']:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        user_id = body.get('user_id')
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if action == 'grant_pro':
            cursor.execute("UPDATE users SET has_pro = TRUE WHERE id = %s", (user_id,))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'PRO granted'})
            }
        
        elif action == 'revoke_pro':
            cursor.execute("UPDATE users SET has_pro = FALSE WHERE id = %s", (user_id,))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'PRO revoked'})
            }
        
        elif action == 'increment_messages':
            cursor.execute("UPDATE users SET messages_used = messages_used + 1 WHERE id = %s", (user_id,))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid request'})
    }
