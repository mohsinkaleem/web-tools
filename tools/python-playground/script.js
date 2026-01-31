let pyodide = null;
let isRunning = false;
let cmEditor = null;
const installedPackages = new Set(['micropip']);

// Pyodide CDN URL - using official pyodide CDN for better CORS support
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";

// Example code snippets
const examples = {
    hello: `# Hello World Example
name = "Python Playground"
version = 3.11

print(f"Welcome to {name}!")
print(f"Running Python {version}")

# Working with lists
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits, 1):
    print(f"{i}. {fruit.capitalize()}")

# Dictionary example
person = {
    "name": "Alice",
    "age": 30,
    "city": "New York"
}

for key, value in person.items():
    print(f"{key}: {value}")
`,
    math: `# NumPy Math Operations
import numpy as np

# Create arrays
a = np.array([1, 2, 3, 4, 5])
b = np.array([10, 20, 30, 40, 50])

print("Array a:", a)
print("Array b:", b)

# Basic operations
print("\\nSum:", a + b)
print("Product:", a * b)
print("Mean of a:", np.mean(a))
print("Std of a:", np.std(a))

# Matrix operations
matrix = np.array([[1, 2], [3, 4]])
print("\\nMatrix:")
print(matrix)
print("\\nDeterminant:", np.linalg.det(matrix))
print("Transpose:")
print(matrix.T)

# Random numbers
random_arr = np.random.randint(1, 100, size=10)
print("\\nRandom array:", random_arr)
print("Sorted:", np.sort(random_arr))
`,
    data: `# Pandas Data Analysis
import pandas as pd
import numpy as np

# Create a DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'Age': [25, 30, 35, 28, 32],
    'City': ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix'],
    'Salary': [50000, 60000, 75000, 55000, 70000]
}

df = pd.DataFrame(data)
print("DataFrame:")
print(df)
print()

# Basic statistics
print("Statistics:")
print(df.describe())
print()

# Filtering
print("People over 30:")
print(df[df['Age'] > 30])
print()

# Aggregation
print("Average salary by city:")
print(df.groupby('City')['Salary'].mean())
`,
    plot: `# Matplotlib Plotting
import matplotlib.pyplot as plt
import numpy as np

# Generate data
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Create figure
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

# Line plot
ax1.plot(x, y1, 'b-', label='sin(x)')
ax1.plot(x, y2, 'r--', label='cos(x)')
ax1.set_xlabel('x')
ax1.set_ylabel('y')
ax1.set_title('Trigonometric Functions')
ax1.legend()
ax1.grid(True)

# Bar chart
categories = ['A', 'B', 'C', 'D', 'E']
values = np.random.randint(10, 50, 5)
colors = plt.cm.viridis(np.linspace(0, 1, 5))
ax2.bar(categories, values, color=colors)
ax2.set_xlabel('Category')
ax2.set_ylabel('Value')
ax2.set_title('Bar Chart Example')

plt.tight_layout()
plt.show()

print("Charts displayed above!")
`,
    class: `# Object-Oriented Programming
from dataclasses import dataclass
from typing import List

@dataclass
class Book:
    title: str
    author: str
    year: int
    pages: int
    
    def __str__(self):
        return f"{self.title} by {self.author} ({self.year})"

class Library:
    def __init__(self, name: str):
        self.name = name
        self.books: List[Book] = []
    
    def add_book(self, book: Book):
        self.books.append(book)
        print(f"Added: {book.title}")
    
    def find_by_author(self, author: str) -> List[Book]:
        return [b for b in self.books if b.author == author]
    
    def total_pages(self) -> int:
        return sum(book.pages for book in self.books)
    
    def summary(self):
        print(f"\\n📚 {self.name}")
        print(f"Total books: {len(self.books)}")
        print(f"Total pages: {self.total_pages()}")
        print("\\nAll books:")
        for book in self.books:
            print(f"  - {book}")

# Create library and add books
library = Library("My Library")

library.add_book(Book("1984", "George Orwell", 1949, 328))
library.add_book(Book("Animal Farm", "George Orwell", 1945, 112))
library.add_book(Book("Brave New World", "Aldous Huxley", 1932, 311))

library.summary()

# Find books by author
print("\\nBooks by George Orwell:")
for book in library.find_by_author("George Orwell"):
    print(f"  - {book.title}")
`,
    web: `# Web Content Processing
# Note: In the browser, we use JS fetch via Pyodide

import json

# Simulating web API response
api_response = '''
{
    "users": [
        {"id": 1, "name": "John", "email": "john@example.com"},
        {"id": 2, "name": "Jane", "email": "jane@example.com"},
        {"id": 3, "name": "Bob", "email": "bob@example.com"}
    ],
    "total": 3,
    "page": 1
}
'''

# Parse JSON
data = json.loads(api_response)
print("API Response Analysis:")
print(f"Total users: {data['total']}")
print(f"Page: {data['page']}")
print()

print("Users:")
for user in data['users']:
    print(f"  ID: {user['id']}, Name: {user['name']}, Email: {user['email']}")

# Create structured output
print("\\nFormatted JSON output:")
formatted = json.dumps(data, indent=2)
print(formatted)

# Data transformation
emails = [user['email'] for user in data['users']]
print(f"\\nAll emails: {emails}")
`
};

// Initialize Pyodide
async function initPyodide() {
    try {
        updateStatus('loading', 'Loading Python environment...');
        
        // Use latest Pyodide with proper CORS configuration
        pyodide = await loadPyodide({
            indexURL: PYODIDE_CDN,
            fullStdLib: false // Load stdlib on demand for faster startup
        });
        
        updateStatus('loading', 'Setting up Python environment...');
        
        // Set up stdout/stderr capture
        pyodide.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.output = StringIO()
        
    def write(self, text):
        self.output.write(text)
        
    def flush(self):
        pass
        
    def getvalue(self):
        return self.output.getvalue()
        
    def clear(self):
        self.output = StringIO()

_stdout_capture = OutputCapture()
_stderr_capture = OutputCapture()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
        `);
        
        // Load micropip for package installation
        updateStatus('loading', 'Installing micropip...');
        await pyodide.loadPackage('micropip');
        
        updateStatus('ready', 'Python ready! 🐍');
        document.getElementById('runBtn').disabled = false;
        document.getElementById('installBtn').disabled = false;
        
    } catch (error) {
        console.error('Failed to load Pyodide:', error);
        updateStatus('error', 'Failed to load Python environment. Please refresh the page to try again.');
        
        // Show detailed error in output
        document.getElementById('output').innerHTML = 
            `<span class="output-error">Failed to initialize Python:\n${escapeHtml(error.message)}\n\nThis may be due to network issues. Please try refreshing the page.</span>`;
    }
}

function updateStatus(type, message) {
    const banner = document.getElementById('statusBanner');
    const spinner = document.getElementById('statusSpinner');
    const text = document.getElementById('statusText');
    
    banner.className = 'status-banner ' + type;
    text.textContent = message;
    
    if (type === 'loading') {
        spinner.style.display = 'block';
    } else {
        spinner.style.display = 'none';
    }
}

// Run Python code
async function runCode() {
    if (!pyodide || isRunning) return;
    
    isRunning = true;
    const code = cmEditor.getValue();
    const output = document.getElementById('output');
    const outputStatus = document.getElementById('outputStatus');
    
    document.getElementById('runBtn').disabled = true;
    outputStatus.textContent = 'Running...';
    output.innerHTML = '';
    
    try {
        // Clear previous output
        pyodide.runPython(`
_stdout_capture.clear()
_stderr_capture.clear()
        `);
        
        // Check if code uses matplotlib
        if (code.includes('matplotlib') || code.includes('plt.')) {
            await pyodide.loadPackage('matplotlib');
            pyodide.runPython(`
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import io
import base64
            `);
        }
        
        // Check for other packages
        const packageChecks = [
            { pattern: /import\s+numpy|from\s+numpy/, pkg: 'numpy' },
            { pattern: /import\s+pandas|from\s+pandas/, pkg: 'pandas' },
            { pattern: /import\s+scipy|from\s+scipy/, pkg: 'scipy' },
            { pattern: /import\s+sympy|from\s+sympy/, pkg: 'sympy' },
            { pattern: /import\s+networkx|from\s+networkx/, pkg: 'networkx' }
        ];
        
        for (const check of packageChecks) {
            if (check.pattern.test(code) && !installedPackages.has(check.pkg)) {
                output.innerHTML += `<span class="output-info">Installing ${check.pkg}...</span>\n`;
                await pyodide.loadPackage(check.pkg);
                installedPackages.add(check.pkg);
                updatePackageTags();
            }
        }
        
        const startTime = performance.now();
        
        // Execute the code
        await pyodide.runPythonAsync(code);
        
        const endTime = performance.now();
        const executionTime = ((endTime - startTime) / 1000).toFixed(3);
        
        // Get output
        const stdout = pyodide.runPython('_stdout_capture.getvalue()');
        const stderr = pyodide.runPython('_stderr_capture.getvalue()');
        
        // Check for matplotlib figures
        let hasPlot = false;
        try {
            const hasFig = pyodide.runPython(`
import matplotlib.pyplot as plt
len(plt.get_fignums()) > 0
            `);
            hasPlot = hasFig;
        } catch (e) {}
        
        if (hasPlot) {
            const imgData = pyodide.runPython(`
import matplotlib.pyplot as plt
import io
import base64

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', 
            facecolor='#1a1a2e', edgecolor='none')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close('all')
img_base64
            `);
            output.innerHTML += `<img src="data:image/png;base64,${imgData}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">\n`;
        }
        
        if (stdout) {
            output.innerHTML += stdout;
        }
        
        if (stderr) {
            output.innerHTML += `<span class="output-error">${escapeHtml(stderr)}</span>`;
        }
        
        if (!stdout && !stderr && !hasPlot) {
            output.innerHTML += `<span class="output-info">Code executed successfully (no output)</span>`;
        }
        
        outputStatus.textContent = `Completed in ${executionTime}s`;
        outputStatus.style.color = 'var(--success)';
        
    } catch (error) {
        output.innerHTML = `<span class="output-error">${escapeHtml(error.message)}</span>`;
        outputStatus.textContent = 'Error';
        outputStatus.style.color = 'var(--danger)';
    }
    
    isRunning = false;
    document.getElementById('runBtn').disabled = false;
    updateMemoryUsage();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Install package
async function installPackage() {
    const packageName = document.getElementById('packageInput').value.trim();
    if (!packageName || !pyodide) return;
    
    const output = document.getElementById('output');
    output.innerHTML = `<span class="output-info">Installing ${packageName}...</span>\n`;
    
    try {
        await pyodide.runPythonAsync(`
import micropip
await micropip.install('${packageName}')
        `);
        
        output.innerHTML += `<span class="output-success">Successfully installed ${packageName}!</span>\n`;
        installedPackages.add(packageName);
        updatePackageTags();
        document.getElementById('packageInput').value = '';
        
    } catch (error) {
        output.innerHTML += `<span class="output-error">Failed to install ${packageName}: ${error.message}</span>\n`;
    }
}

function updatePackageTags() {
    document.querySelectorAll('.package-tag').forEach(tag => {
        const pkg = tag.dataset.package;
        if (installedPackages.has(pkg)) {
            tag.classList.add('installed');
        }
    });
}

function updateMemoryUsage() {
    if (performance.memory) {
        const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
        document.getElementById('memoryUsage').textContent = `Memory: ${used} MB`;
    }
}

// Line numbers
// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initPyodide();
    
    // Initialize CodeMirror
    const textArea = document.getElementById('codeEditor');
    cmEditor = CodeMirror.fromTextArea(textArea, {
        mode: 'python',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Enter": runCode,
            "Cmd-Enter": runCode
        }
    });
    
    // REPL Shell Toggle
    const toggleReplBtn = document.getElementById('toggleReplBtn');
    const replShell = document.getElementById('replShell');
    toggleReplBtn.addEventListener('click', () => {
        const isHidden = replShell.style.display === 'none';
        replShell.style.display = isHidden ? 'block' : 'none';
        toggleReplBtn.textContent = isHidden ? '⌨️ Hide REPL Shell' : '⌨️ Show REPL Shell';
        if (isHidden) document.getElementById('replInput').focus();
    });

    // REPL Input Handling
    const replInput = document.getElementById('replInput');
    const replHistory = document.getElementById('replHistory');
    replInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && replInput.value.trim()) {
            const cmd = replInput.value;
            replInput.value = '';
            
            // Add to history display
            const cmdDiv = document.createElement('div');
            cmdDiv.className = 'repl-line';
            cmdDiv.innerHTML = `<span class="repl-prompt">>>></span> <span class="repl-cmd">${escapeHtml(cmd)}</span>`;
            replHistory.appendChild(cmdDiv);
            
            if (!pyodide) return;
            
            try {
                // Intercept stdout/stderr
                pyodide.runPython('_stdout_capture.clear(); _stderr_capture.clear()');
                
                // Result of execution
                let result = await pyodide.runPythonAsync(cmd);
                
                const stdout = pyodide.runPython('_stdout_capture.getvalue()');
                const stderr = pyodide.runPython('_stderr_capture.getvalue()');
                
                if (stdout) {
                    const outDiv = document.createElement('div');
                    outDiv.className = 'repl-line repl-res';
                    outDiv.textContent = stdout;
                    replHistory.appendChild(outDiv);
                }
                
                if (stderr) {
                    const errDiv = document.createElement('div');
                    errDiv.className = 'repl-line output-error';
                    errDiv.textContent = stderr;
                    replHistory.appendChild(errDiv);
                }
                
                if (result !== undefined) {
                    const resDiv = document.createElement('div');
                    resDiv.className = 'repl-line repl-res';
                    resDiv.textContent = result;
                    replHistory.appendChild(resDiv);
                }
            } catch (err) {
                const errDiv = document.createElement('div');
                errDiv.className = 'repl-line output-error';
                errDiv.textContent = err.message;
                replHistory.appendChild(errDiv);
            }
            
            replShell.scrollTop = replShell.scrollHeight;
            document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
        }
    });
    
    // Run button
    document.getElementById('runBtn').addEventListener('click', runCode);
    
    // Clear output
    document.getElementById('clearOutputBtn').addEventListener('click', () => {
        document.getElementById('output').innerHTML = 'Python output will appear here...';
        replHistory.innerHTML = '';
        document.getElementById('outputStatus').textContent = 'Ready';
        document.getElementById('outputStatus').style.color = '';
    });
    
    // Reset
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Reset the Python environment? This will clear all variables and imports.')) {
            location.reload();
        }
    });
    
    // Download
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const code = cmEditor.getValue();
        const blob = new Blob([code], { type: 'text/python' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'script.py';
        link.click();
        URL.revokeObjectURL(link.href);
    });
    
    // Share (encode in URL)
    document.getElementById('shareBtn').addEventListener('click', () => {
        const code = cmEditor.getValue();
        const encoded = btoa(encodeURIComponent(code));
        const url = `${location.origin}${location.pathname}?code=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Share URL copied to clipboard!');
        }).catch(() => {
            prompt('Copy this URL:', url);
        });
    });
    
    // Install package
    document.getElementById('installBtn').addEventListener('click', installPackage);
    document.getElementById('packageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') installPackage();
    });
    
    // Package tags
    document.querySelectorAll('.package-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const pkg = tag.dataset.package;
            const importMap = {
                'numpy': 'import numpy as np',
                'pandas': 'import pandas as pd',
                'matplotlib': 'import matplotlib.pyplot as plt',
                'scipy': 'import scipy',
                'scikit-learn': 'from sklearn import *',
                'sympy': 'import sympy',
                'networkx': 'import networkx as nx',
                'pillow': 'from PIL import Image',
                'regex': 'import regex',
                'pyyaml': 'import yaml'
            };
            
            const importStmt = importMap[pkg] || `import ${pkg}`;
            cmEditor.setValue(importStmt + '\n\n' + cmEditor.getValue());
        });
    });
    
    // Example cards
    document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', () => {
            const example = card.dataset.example;
            if (examples[example]) {
                cmEditor.setValue(examples[example]);
                document.getElementById('output').innerHTML = 'Click "Run" to execute the code...';
            }
        });
    });
    
    // Check for shared code in URL
    const params = new URLSearchParams(location.search);
    if (params.has('code')) {
        try {
            const code = decodeURIComponent(atob(params.get('code')));
            cmEditor.setValue(code);
        } catch (e) {
            console.error('Failed to decode shared code');
        }
    }
});