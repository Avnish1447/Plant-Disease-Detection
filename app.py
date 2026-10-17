import os
import shutil
from flask import Flask, render_template, request, jsonify
from mod import check, predict_detailed

app = Flask(__name__)

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

        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD'], filename)
        file.save(file_path)

        details = predict_detailed(file_path)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
            return jsonify({
                "success": True,
                "data": details,
                "image": file_path
            })

        return render_template('index.html', prediction=details["raw_label"], details=details, image=file_path)

    return render_template('index.html')

@app.route('/api/predict', methods=["POST"])
def api_predict():
    # Handle sample selection
    if request.is_json:
        data = request.get_json()
        sample_name = data.get("sample")
        if sample_name:
            sample_path = os.path.join('static', 'samples', os.path.basename(sample_name))
            if os.path.exists(sample_path):
                details = predict_detailed(sample_path)
                return jsonify({
                    "success": True,
                    "data": details,
                    "image": sample_path
                })
            return jsonify({"error": "Sample not found"}), 404

    # Handle file upload
    file = request.files.get('image')
    if not file or file.filename == '':
        return jsonify({"error": "No image uploaded"}), 400

    filename = file.filename
    file_path = os.path.join(app.config['UPLOAD'], filename)
    file.save(file_path)

    details = predict_detailed(file_path)
    return jsonify({
        "success": True,
        "data": details,
        "image": file_path
    })

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
    app.run(debug=True, port=5000)
