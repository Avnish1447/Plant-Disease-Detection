# from flask import Flask, render_template, request, send_file
# from mod import check
# import os

# app = Flask(__name__)

# upload_folder = os.path.join('static', 'uploads')
# app.config['UPLOAD'] = upload_folder

# @app.route('/', methods=["GET", "POST"])
# def index():
#     if request.method == "POST":
#         file = request.files['image']
#         if not file:
#             return "No file"

#         filename = file.filename
#         file.save(os.path.join(app.config['UPLOAD'], filename))
#         img = os.path.join(app.config['UPLOAD'], filename)
#         prediction = check(img)
#         return render_template('index.html', prediction=prediction, image=img)

#     return render_template('index.html')


# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, render_template, request
from mod import check
import os

app = Flask(__name__)

# Set upload folder path
upload_folder = os.path.join('static', 'uploads')
os.makedirs(upload_folder, exist_ok=True)  # Ensure the folder exists
app.config['UPLOAD'] = upload_folder

@app.route('/', methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files.get('image')  # safer than direct indexing
        if not file or file.filename == '':
            return "No file selected."

        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD'], filename)
        file.save(file_path)

        prediction = check(file_path)
        return render_template('index.html', prediction=prediction, image=file_path)

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
