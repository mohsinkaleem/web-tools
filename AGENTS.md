# Creating New Web Tools with AI Agents

This guide provides instructions for using AI agents to create new web tools for this project.

## Guidelines for New Tools

When requesting a new tool, specify:

1. **Single HTML file** - All code should be in one self-contained file
2. **No frameworks** - Use vanilla HTML, CSS, and JavaScript (no React, Vue, etc.)
3. **No backend required** - Tools should work entirely in the browser
4. **Professional styling** - Clean, modern UI with responsive design

## Example Request Format

```
Create a [tool name] using HTML and JavaScript.
- Single page file
- No React
- Feature 1
- Feature 2
- Feature 3
```

## Tool Ideas

Here are some ideas for useful web tools you could request:

### Text & Document Tools
- **Markdown Editor** - Live preview, export to HTML/PDF
- **Text Diff Tool** - Compare two text blocks side-by-side
- **Word Counter** - Character, word, sentence, paragraph statistics
- **JSON Formatter** - Pretty print and validate JSON
- **Base64 Encoder/Decoder** - Encode/decode text and files
- **Regex Tester** - Test regular expressions with live highlighting

### Image & Media Tools
- **Image Compressor** - Reduce image file size
- **Image Format Converter** - Convert between JPG, PNG, WebP, etc.
- **Color Picker** - Extract colors from images, generate palettes
- **QR Code Generator** - Create QR codes from text/URLs
- **Audio Visualizer** - Visualize audio files with waveforms

### Utility Tools
- **Unit Converter** - Length, weight, temperature, currency
- **Calculator** - Scientific calculator with history
- **Timer/Stopwatch** - Countdown timer and stopwatch
- **Password Generator** - Generate secure random passwords
- **Hash Generator** - MD5, SHA-1, SHA-256 hashing
- **URL Shortener** - Create shortened URLs (with local storage)

### Developer Tools
- **Code Formatter** - Format HTML, CSS, JavaScript, etc.
- **Color Converter** - Convert between HEX, RGB, HSL, etc.
- **Lorem Ipsum Generator** - Generate placeholder text
- **CSV to JSON Converter** - Parse and convert CSV data
- **API Tester** - Make HTTP requests and view responses
- **Cron Expression Generator** - Create and explain cron expressions

### File Tools
- **File Merger** - Combine multiple text files
- **CSV Editor** - Edit CSV files in a table interface
- **PDF Viewer** - View and navigate PDF files
- **ZIP File Extractor** - Extract and view ZIP contents
- **File Encryptor** - Encrypt/decrypt files with password

### Productivity Tools
- **Pomodoro Timer** - Focus timer with break intervals
- **Note Taking App** - Quick notes with local storage
- **Todo List** - Task manager with categories
- **Habit Tracker** - Track daily habits and streaks
- **Budget Calculator** - Personal finance tracker

## After Tool Creation

1. Test the tool thoroughly in your browser
2. Add it to `index.html` with a link and description
3. Update `README.md` with tool information and features
4. Commit changes to your repository

## Best Practices

- **Privacy First** - All processing happens locally in the browser
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessibility** - Use semantic HTML and proper ARIA labels
- **Local Storage** - Use localStorage for saving user preferences
- **Error Handling** - Gracefully handle edge cases and errors
- **Performance** - Keep file sizes small, optimize for speed
- **Progressive Enhancement** - Core functionality works without JavaScript when possible

## Example Workflow

1. **Request**: "Create a JSON formatter using HTML and JavaScript. Single page file. No React. Features: syntax highlighting, prettify, minify, validate, copy to clipboard."

2. **Agent creates**: `json-formatter.html`

3. **You test it**: Open in browser, try various JSON inputs

4. **Update project**:
   - Add link to `index.html`
   - Document in `README.md`
   - Commit to git

## Tips for Better Results

- Be specific about features you want
- Mention if you need specific libraries (but prefer vanilla JS)
- Specify styling preferences (dark/light theme, colors)
- Request keyboard shortcuts if needed
- Ask for export/import functionality when relevant
- Mention if the tool needs to work offline

Happy building! 🚀