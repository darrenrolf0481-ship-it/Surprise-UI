#!/usr/bin/env python3
"""
VisionLLM v2 API Server Wrapper with Local File Access
"""

import os
import sys
import base64
import io

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError as e:
    print(f"ERROR: Missing Flask dependencies. Run: pip install flask flask-cors")
    sys.exit(1)

try:
    from PIL import Image
except ImportError as e:
    print(f"ERROR: Missing Pillow. Run: pip install Pillow")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

class VisionLLMMock:
    def chat(self, text: str, image=None, task="vqa"):
        tasks = {
            "vqa": f"VisionLLM analysis: Based on the image provided, I can see various visual elements. Your question was: '{text}'",
            "detection": "Detected objects in image: [person: 0.95, car: 0.87, traffic light: 0.82]",
            "pose": "Pose estimation complete. Found 3 human poses with keypoints.",
            "segmentation": "Segmentation mask generated with 5 distinct regions."
        }
        return tasks.get(task, tasks["vqa"])

model = VisionLLMMock()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "VisionLLM v2 Server Running"})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        text = data.get('text', '')
        image_b64 = data.get('image')
        task = data.get('task', 'vqa')
        
        pil_image = None
        if image_b64:
            image_bytes = base64.b64decode(image_b64)
            pil_image = Image.open(io.BytesIO(image_bytes))
            pil_image = pil_image.convert('RGB')
        
        response = model.chat(text, pil_image, task)
        return jsonify({"text": response, "task": task, "has_image": pil_image is not None})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    return jsonify({
        "models": [
            {"id": "VisionLLMv2-7B", "name": "VisionLLM v2 (7B)", "tasks": ["vqa", "detection", "pose", "segmentation"]},
            {"id": "VisionLLM-Detection", "name": "Detection Specialist"},
            {"id": "VisionLLM-Pose", "name": "Pose Estimation"},
            {"id": "VisionLLM-Segmentation", "name": "Instance Segmentation"}
        ]
    })

# --- Local File System API ---
@app.route('/api/local/tree', methods=['GET'])
def get_local_tree():
    try:
        tree = []
        root_dir = os.path.dirname(os.path.abspath(__file__))
        for root, dirs, files in os.walk(root_dir):
            if 'node_modules' in dirs: dirs.remove('node_modules')
            if '.git' in dirs: dirs.remove('.git')
            if 'dist' in dirs: dirs.remove('dist')
            
            for name in files:
                rel_path = os.path.relpath(os.path.join(root, name), root_dir)
                if rel_path.startswith('.'): continue
                tree.append({
                    "path": rel_path, 
                    "type": "blob", 
                    "url": f"http://localhost:8000/api/local/file?path={rel_path}"
                })
        return jsonify({"tree": sorted(tree, key=lambda x: x['path'])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/local/file', methods=['GET'])
def get_local_file():
    try:
        path = request.args.get('path')
        root_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(root_dir, path)
        if not os.path.abspath(file_path).startswith(os.path.abspath(root_dir)):
            return "Access denied", 403
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
