from flask import Flask, jsonify, render_template, request
import sqlite3
app = Flask(__name__)

""" Nombre de la base de datos SQLite """
DB_NAME = 'credito.db' 

""" @app.route('/')
def index():
    return '¡Flask activado!'
 """
""" Renderizado de Frontend """
@app.route('/')
def home():
    return render_template('index.html')

""" Conexión con la base de datos """
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

""" Ruta GET para obtener todos los registros """
@app.route('/api/creditos', methods=['GET'])
def obtener_datos():
    conn = get_db_connection()
    creditos = conn.execute('SELECT * FROM creditos').fetchall()
    conn.close()
    return jsonify([dict(c) for c in creditos])

""" Ruta POST para ingresar registros """
@app.route('/api/creditos', methods=['POST'])
def ingresar_datos():
    datos = request.get_json()
    campos = ['cliente', 'monto', 'tasa_interes', 'plazo', 'fecha_otorgamiento']
    if not all(c in datos for c in campos):
        return jsonify({'error': 'Faltan campos para registrar'}), 400
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO creditos (cliente, monto, tasa_interes, plazo, fecha_otorgamiento) VALUES (?, ?, ?, ?, ?)',
        (datos['cliente'], datos['monto'], datos['tasa_interes'], datos['plazo'], datos['fecha_otorgamiento'])
    )
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Credito registrado correctamente'}), 201

""" Ruta PUT para actualizar registros existentes """
@app.route('/api/creditos/<int:id>', methods=['PUT'])
def actualizar_datos(id):
    datos = request.get_json()
    campos = ['cliente', 'monto', 'tasa_interes', 'plazo', 'fecha_otorgamiento']
    if not all(c in datos for c in campos):
        return jsonify({'error': 'Faltan campos para registrar'}), 400
    conn = get_db_connection()
    conn.execute('''
        UPDATE creditos 
        SET cliente = ?, monto = ?, tasa_interes = ?, plazo = ?, fecha_otorgamiento = ?
        WHERE id = ?
    ''', (
        datos['cliente'], datos['monto'], datos['tasa_interes'], datos['plazo'],
        datos['fecha_otorgamiento'], id
    ))
    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Credito actualizado'}), 200
    

""" Ruta DELETE para eliminar registros """
@app.route('/api/creditos/<int:id>', methods=['DELETE'])
def eliminar_datos(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM creditos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'mensaje': f'Credito {id} eliminado'}), 200

""" Creación de la base de datos """
def init_db():
    conn = sqlite3.connect(DB_NAME)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS creditos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT    NOT NULL,
            monto REAL      NOT NULL,
            tasa_interes REAL NOT NULL,
            plazo INTEGER   NOT NULL,
            fecha_otorgamiento TEXT NOT NULL
        );
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
