# VisionLLM v2 Integration

VisionLLM v2 is a generalist multimodal large language model for vision-language tasks including detection, pose estimation, segmentation, and VQA.

## Quick Start

### Option 1: Mock Server (Demo)

For testing the UI without VisionLLM installed:

```bash
cd Surprise-UI
python visionllm-server.py
```

This starts a mock server on `http://localhost:8000` that responds to VisionLLM API calls.

### Option 2: Full VisionLLM Setup

**Hardware Requirements:**
- GPU with 16GB+ VRAM (for 7B model)
- 32GB+ system RAM

**Installation:**

```bash
# 1. Clone VisionLLM
cd ~
git clone https://github.com/OpenGVLab/VisionLLM.git
cd VisionLLM/VisionLLMv2

# 2. Install dependencies
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
pip install flask flask-cors

# 3. Download model weights (13GB+)
mkdir -p work_dirs checkpoints
cd checkpoints

# Download Stable Diffusion
huggingface-cli download --resume-download stable-diffusion-v1-5/stable-diffusion-v1-5 --local-dir stable-diffusion-v1-5

# Download InstructPix2Pix  
huggingface-cli download --resume-download timbrooks/instruct-pix2pix --local-dir instruct-pix2pix

# Download VisionLLMv2
cd ../work_dirs
huggingface-cli download --resume-download OpenGVLab/VisionLLMv2 --local-dir VisionLLMv2

# 4. Start the API server
python visionllm-server.py  # Use the server in Surprise-UI
```

## Configuration

In the Surprise-UI **Data** tab:

| Setting | Default | Description |
|---------|---------|-------------|
| **VISIONLLM SERVER URL** | `http://localhost:8000` | Your VisionLLM server address |

## Usage

1. Select **VisionLLM** provider in the Chat tab
2. Choose a task model:
   - **VisionLLMv2-7B** - General multimodal chat
   - **VisionLLM-Detection** - Object detection
   - **VisionLLM-Pose** - Human pose estimation
   - **VisionLLM-Segmentation** - Instance segmentation
3. Upload an image (optional)
4. Type your prompt
5. Send

## API Reference

The VisionLLM server exposes:

### `POST /chat`
```json
{
  "text": "What objects are in this image?",
  "image": "base64_encoded_jpeg_string",
  "task": "vqa"
}
```

**Response:**
```json
{
  "text": "VisionLLM analysis result...",
  "task": "vqa",
  "has_image": true
}
```

### `GET /models`
Returns available model configurations.

### `GET /health`
Health check endpoint.

## Architecture

VisionLLM v2 uses:
- **Vision Encoder**: CLIP ViT-L/14
- **Language Model**: Vicuna-7B v1.5
- **Tasks Supported**:
  - Visual Question Answering (VQA)
  - Object Detection
  - Instance Segmentation
  - Pose Estimation
  - Image Generation/Editing

## Paper Reference

[NIPS 2024] VisionLLM v2: An End-to-End Generalist Multimodal Large Language Model for Hundreds of Vision-Language Tasks
- Paper: https://arxiv.org/abs/2406.08394
- Project: https://wjn922.github.io/visionllmv2.github.io/
- Code: https://github.com/OpenGVLab/VisionLLM

## Troubleshooting

**Server not responding:**
- Check VisionLLM server is running: `python visionllm-server.py`
- Verify URL in settings matches (default: `http://localhost:8000`)

**Out of memory:**
- VisionLLMv2 7B requires ~16GB GPU VRAM
- Use smaller models or mock server for testing

**Import errors:**
- Ensure VisionLLM is in Python path
- Install all requirements: `pip install -r requirements.txt`
