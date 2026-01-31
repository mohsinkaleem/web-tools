# Web Tools

A collection of powerful browser-based utility tools built with vanilla HTML, CSS, and JavaScript. All tools run entirely in the browser with no backend required - your data never leaves your device.

## 🛠 Tools

### 🖼️ Image Tools
Comprehensive image editing suite with:
- **Resize**: Scale images by dimensions or percentage with aspect ratio lock
- **Crop**: Interactive crop with preset aspect ratios (1:1, 4:3, 16:9, etc.)
- **Background Removal**: AI-powered background detection and removal
- **Format Conversion**: Export as PNG, JPEG, or WebP with quality control

### 📄 PDF & Document Tools
Full-featured PDF toolkit:
- **PDF Viewer**: View PDFs with thumbnail navigation, zoom, and page controls
- **Merge PDFs**: Combine multiple PDFs with drag-to-reorder functionality
- **Split PDF**: Extract specific pages or page ranges
- **EPUB Reader**: Read EPUB books with table of contents, themes, and font sizing

### ✨ Text Prettifier & Formatter
Format and validate multiple text formats:
- **JSON**: Prettify, minify, validate, sort keys
- **YAML**: Format and convert to/from JSON
- **Markdown**: Live preview with GitHub-flavored rendering
- **XML/HTML**: Auto-indent and format
- **CSS**: Beautify stylesheets
- **SQL**: Format queries with keyword uppercasing

### 🐍 Python Playground
Full Python interpreter in the browser powered by Pyodide:
- Python 3.11 runtime with REPL
- Pre-installed packages: NumPy, Pandas, Matplotlib, SciPy, scikit-learn
- Install additional packages via micropip
- Syntax highlighting and line numbers
- Share code via URL
- Example code snippets included

### 📝 Markdown Previewer
Write and preview markdown with:
- Live side-by-side preview
- Export to HTML or PDF
- Copy to clipboard

### 📚 EPUB Reader
Read EPUB books with:
- Table of contents navigation
- Adjustable font size
- Light/Sepia/Dark themes

## 🔒 Privacy First

All processing happens locally in your browser. Your files and data never leave your device - there's no server to upload to!

## 🚀 Usage

Simply open any HTML file in your web browser. No installation or server required!

1. Clone or download this repository
2. Open `index.html` in your browser
3. Click on any tool to start using it

## 📝 Adding New Tools

See [AGENTS.md](AGENTS.md) for instructions on creating new tools using AI agents.

### Quick Guidelines:
- Single HTML file per tool (self-contained)
- Vanilla HTML, CSS, JavaScript (no frameworks)
- No backend required - everything runs client-side
- Responsive design for all screen sizes
- Modern, professional styling

## 🛡️ Technologies Used

- **PDF.js** - Mozilla's PDF rendering library
- **pdf-lib** - PDF creation and manipulation
- **JSZip** - ZIP file handling for EPUBs
- **Pyodide** - Python in WebAssembly
- **js-yaml** - YAML parsing and formatting
- **marked** - Markdown parsing

## 📄 License

MIT License - feel free to use and modify!
