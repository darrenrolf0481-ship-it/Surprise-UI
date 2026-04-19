#!/usr/bin/env python3
"""
VisionLLM v2 API Server Wrapper
Connects VisionLLM to your Surprise-UI frontend

Prerequisites:
1. Install VisionLLM: https://github.com/OpenGVLab/VisionLLM.git
2. Download model weights (see VisionLLM/VisionLLMv2/docs/model.md)
3. Install dependencies: pip install torch transformers flask flask-cors Pillow

Usage:
    python visionllm-server.py

The server will start on port 8000 and expose:
- POST /chat - VisionLLM chat with image support
- GET /health - Health check
"""

import os
import sys
import base64
import io

# Check dependencies
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError as e:
    print(f"ERROR: Missing Flask dependencies. Run: pip install flask flask-cors")
    print(f"Details: {e}")
    sys.exit(1)

try:
    from PIL import Image
except ImportError as e:
    print(f"ERROR: Missing Pillow. Run: pip install Pillow")
    print(f"Details: {e}")
    sys.exit(1)

# Try to import VisionLLM - if not installed, provide helpful error
try:
    # Add VisionLLM to path if cloned locally
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.getcwd()
    VISIONLLM_PATH = os.path.join(SCRIPT_DIR, '..', 'VisionLLM')
    if os.path.exists(VISIONLLM_PATH):
        sys.path.insert(0, VISIONLLM_PATH)
        sys.path.insert(0, os.path.join(VISIONLLM_PATH, 'VisionLLMv2'))
    
    # VisionLLM imports would go here once properly installed
    # from visionllmv2.models import VisionLLMv2
    VISIONLLM_AVAILABLE = False
except Exception as e:
    print(f"Warning: Could not setup VisionLLM path: {e}")
    VISIONLLM_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Mock VisionLLM for demonstration
# Replace with actual model loading when VisionLLM is installed
class VisionLLMMock:
    """Mock VisionLLM - replace with actual model when ready"""
    
    def chat(self, text: str, image=None, task="vqa"):
        """
        Process text+image through VisionLLM
        
        Args:
            text: prompt text
            image: PIL.Image or None
            task: vqa | detection | pose | segmentation
        """
        tasks = {
            "vqa": f"VisionLLM analysis: Based on the image provided, I can see various visual elements. Your question was: '{text}'",
            "detection": "Detected objects in image: [person: 0.95, car: 0.87, traffic light: 0.82]",
            "pose": "Pose estimation complete. Found 3 human poses with keypoints.",
            "segmentation": "Segmentation mask generated with 5 distinct regions."
        }
        return tasks.get(task, tasks["vqa"])

# Initialize model
model = VisionLLMMock()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "visionllm_available": VISIONLLM_AVAILABLE,
        "message": "VisionLLM v2 Server Running"
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    
    Expected JSON:
    {
        "text": "What do you see in this image?",
        "image": "base64_encoded_jpeg...",  // optional
        "task": "vqa" | "detection" | "pose" | "segmentation"
    }
    """
    try:
        data = request.json
        text = data.get('text', '')
        image_b64 = data.get('image')
        task = data.get('task', 'vqa')
        
        # Validate task
        valid_tasks = ['vqa', 'detection', 'pose', 'segmentation']
        if task not in valid_tasks:
            task = 'vqa'
        
        # Decode image if provided
        pil_image = None
        if image_b64:
            try:
                image_bytes = base64.b64decode(image_b64)
                pil_image = Image.open(io.BytesIO(image_bytes))
                pil_image = pil_image.convert('RGB')
            except Exception as e:
                return jsonify({"error": f"Failed to decode image: {str(e)}"}), 400
        
        # Process through VisionLLM
        response = model.chat(text, pil_image, task)
        
        return jsonify({
            "text": response,
            "task": task,
            "has_image": pil_image is not None
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available VisionLLM models/tasks"""
    return jsonify({
        "models": [
            {"id": "VisionLLMv2-7B", "name": "VisionLLM v2 (7B)", "tasks": ["vqa", "detection", "pose", "segmentation"]},
            {"id": "VisionLLM-Detection", "name": "Detection Specialist"},
            {"id": "VisionLLM-Pose", "name": "Pose Estimation"},
            {"id": "VisionLLM-Segmentation", "name": "Instance Segmentation"}
        ]
    })

if __name__ == '__main__':
    print("=" * 60)
    print("VisionLLM v2 API Server")
    print("=" * 60)
    print("\nNOTE: This is a MOCK server for demonstration.")
    print("To use actual VisionLLM:")
    print("1. Clone: git clone https://github.com/OpenGVLab/VisionLLM")
    print("2. Install: cd VisionLLM/VisionLLMv2 && pip install -r requirements.txt")
    print("3. Download weights (see docs/model.md)")
    print("4. Update this server to import actual VisionLLM")
    print()
    print("Server starting on http://localhost:8000")
    print("=" * 60)
    print()
    
    app.run(host='0.0.0.0', port=8000, debug=False)
