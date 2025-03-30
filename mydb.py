import os
import mysql.connector

def create_database():
    conn = None
    try:
        # Connect to MySQL server with appropriate authentication
        conn = mysql.connector.connect(
            host=os.environ.get('DB_HOST', 'dpg-cvkd7hl6ubrc73fngelg-a'),
            user=os.environ.get('DB_USER', 'rasa_chatbot_db_user'),
            password=os.environ.get('DB_PASSWORD', '6QG94OxVIK5LXTUImmphktCko33s1OMR'),
            port=os.environ.get('DB_PORT', '5432')  # Specify explicitly
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Create database if not exists
        cursor.execute(f"CREATE DATABASE {os.environ.get('DB_NAME')}")
        print("Database created successfully")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_database()
