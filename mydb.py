import mysql.connector

# Connect to MySQL server with appropriate authentication
database = mysql.connector.connect(
    host='localhost',
    user='root',
    passwd='root',
    auth_plugin='mysql_native_password'  # Specify explicitly
)
  

try:
    # Create a cursor object
    cursorObject = database.cursor()

    # Execute SQL query to create a new database
    cursorObject.execute("CREATE DATABASE IF NOT EXISTS latestdb")

    # Commit the transaction
    database.commit()

    print("ALL DONE")

except mysql.connector.Error as err:
    print("Error:", err)

finally:
    # Ensure proper closure of resources
    if cursorObject:
        cursorObject.close()
    if database:
        database.close()
