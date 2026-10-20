import os
import uuid
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify
from mod import check, predict_detailed

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    # Prevent browser caching of HTML and JS so deployments take effect immediately
    if request.path.endswith('.js') or request.path.endswith('.html') or request.path == '/':
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

@app.route('/health', methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

upload_folder = os.path.join('static', 'uploads')
os.makedirs(upload_folder, exist_ok=True)
app.config['UPLOAD'] = upload_folder

@app.route('/', methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files.get('image')
        if not file or file.filename == '':
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"error": "No file selected."}), 400
            return render_template('index.html', error="No file selected.")

        safe_name = secure_filename(file.filename) or "upload.jpg"
        unique_name = f"{uuid.uuid4().hex[:12]}_{safe_name}"
        file_path = os.path.join(app.config['UPLOAD'], unique_name)
        file.save(file_path)

        details = predict_detailed(file_path)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
            return jsonify({
                "success": True,
                "data": details,
                "image": "/" + file_path.replace("\\", "/")
            })

        return render_template('index.html', prediction=details.get("raw_label", ""), details=details, image="/" + file_path.replace("\\", "/"))

    return render_template('index.html')

@app.route('/api/predict', methods=["POST", "OPTIONS"])
def api_predict():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    # 1. Handle sample selection (JSON or FormData)
    sample_name = None
    if request.is_json:
        data = request.get_json() or {}
        sample_name = data.get("sample")
    elif request.form.get("sample"):
        sample_name = request.form.get("sample")

    if sample_name:
        safe_sample = os.path.basename(sample_name)
        sample_path = os.path.join('static', 'samples', safe_sample)
        if os.path.exists(sample_path):
            try:
                details = predict_detailed(sample_path)
                return jsonify({
                    "success": True,
                    "data": details,
                    "image": "/" + sample_path.replace("\\", "/")
                }), 200
            except Exception as e:
                return jsonify({"success": False, "error": f"Model inference error: {str(e)}"}), 500
        return jsonify({"success": False, "error": f"Sample '{safe_sample}' not found"}), 404

    # 2. Handle uploaded file
    file = request.files.get('image')
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No image uploaded"}), 400

    try:
        safe_name = secure_filename(file.filename) or "upload.jpg"
        unique_name = f"{uuid.uuid4().hex[:12]}_{safe_name}"
        file_path = os.path.join(app.config['UPLOAD'], unique_name)
        file.save(file_path)

        details = predict_detailed(file_path)
        if isinstance(details, dict) and "error" in details:
            return jsonify({"success": False, "error": details["error"]}), 400

        return jsonify({
            "success": True,
            "data": details,
            "image": "/" + file_path.replace("\\", "/")
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Server diagnosis error: {str(e)}"}), 500

@app.route('/api/samples', methods=["GET"])
def get_samples():
    samples_dir = os.path.join('static', 'samples')
    samples = []
    if os.path.exists(samples_dir):
        for f in sorted(os.listdir(samples_dir)):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                title = f.replace('.jpg', '').replace('_', ' ')
                samples.append({
                    "id": f,
                    "title": title,
                    "url": f"/static/samples/{f}"
                })
    return jsonify({"samples": samples})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
