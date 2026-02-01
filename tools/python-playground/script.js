// Initialize CodeMirror
const editor = CodeMirror(document.getElementById('editor-container'), {
    mode: 'python',
    theme: 'dracula',
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity,
    value: `# Python Playground
# Run Python code directly in your browser!

import sys
import numpy as np

print(f"Python version: {sys.version}")

def calculate_pi(n_points):
    print(f"Calculating Pi using {n_points} Monte Carlo points...")
    x = np.random.rand(n_points)
    y = np.random.rand(n_points)
    
    inside_circle = np.sum(x**2 + y**2 <= 1.0)
    pi_estimate = 4 * inside_circle / n_points
    return pi_estimate

# Try running it!
pi = calculate_pi(100000)
print(f"Estimated Pi: {pi}")
`
});

// DOM Elements
const runBtn = document.getElementById('run-btn');
const shareBtn = document.getElementById('share-btn');
const btnText = runBtn.querySelector('.btn-text');
const btnIcon = runBtn.querySelector('i');
const outputConsole = document.getElementById('output-console');
const replConsole = document.getElementById('repl-console');
const clearBtn = document.getElementById('clear-btn');
const clearReplBtn = document.getElementById('clear-repl-btn');
const replInput = document.getElementById('repl-input');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

let pyodide = null;
let currentTab = 'output';

// Logger
function log(message, type = '', target = 'output') {
    const consoleEl = target === 'output' ? outputConsole : replConsole;
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = message;
    consoleEl.appendChild(line);
    // Auto-scroll
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function replLog(message, type = '') {
    log(message, type, 'repl');
}

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        currentTab = tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        if (tab === 'repl') {
            replInput.focus();
        }
    });
});

// URL State Management
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('code');
    if (encoded) {
        try {
            // Simple base64 decoding (for basic ASCII)
            const decoded = atob(encoded);
            editor.setValue(decoded);
        } catch (e) {
            console.error("Failed to load code from URL", e);
        }
    }
}

function updateURL() {
    const code = editor.getValue();
    const encoded = btoa(code);
    const url = new URL(window.location);
    url.searchParams.set('code', encoded);
    window.history.replaceState({}, '', url);
    return url.toString();
}

// Share Button
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const url = updateURL();
        navigator.clipboard.writeText(url).then(() => {
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                shareBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            log("Failed to copy URL: " + err, "error");
        });
    });
}

// Initialize Pyodide
async function main() {
    loadFromURL();

    try {
        log("Loading Pyodide runtime...", "system");
        
        // Load Pyodide
        pyodide = await loadPyodide();
        
        log("Python runtime loaded.", "system");
        replLog("Python runtime loaded.", "system");
        
        // Load Micropip
        log("Loading packaging tools...", "system");
        await pyodide.loadPackage("micropip");
        log("Micropip ready.", "system");

        // Enable UI
        runBtn.disabled = false;
        replInput.disabled = false;
        btnText.textContent = "Run Code";
        btnIcon.className = "fas fa-play";

        // Setup input() handler
        pyodide.setStdin({
            stdin: () => {
                return prompt("Python input():");
            }
        });

    } catch (err) {
        const errMsg = `Error loading Pyodide: ${err.message || err}`;
        log(errMsg, "error");
        replLog(errMsg, "error");
        console.error(err);
    }
}

// Run Code Handler
runBtn.addEventListener('click', async () => {
    if (!pyodide) return;

    const code = editor.getValue();
    
    // Switch to output tab
    document.querySelector('[data-tab="output"]').click();

    // Add separator
    const separator = document.createElement('hr');
    separator.style.borderColor = '#333';
    separator.style.margin = '10px 0';
    outputConsole.appendChild(separator);

    runBtn.disabled = true;
    btnText.textContent = "Running...";
    btnIcon.className = "fas fa-spinner fa-spin";

    updateURL();

    // Redirect stdout/stderr specifically for this run
    pyodide.setStdout({
        batched: (msg) => log(msg)
    });
    pyodide.setStderr({
        batched: (msg) => log(msg, "error")
    });

    try {
        await pyodide.loadPackagesFromImports(code);
        await pyodide.runPythonAsync(code);
    } catch (err) {
        log(err, "error");
    } finally {
        runBtn.disabled = false;
        btnText.textContent = "Run Code";
        btnIcon.className = "fas fa-play";
    }
});

// REPL Handler
replInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const code = replInput.value.trim();
        if (!code) return;

        replLog(`>>> ${code}`, 'user-input');
        replInput.value = '';
        replInput.disabled = true;

        // Redirect output to REPL console
        pyodide.setStdout({
            batched: (msg) => replLog(msg)
        });
        pyodide.setStderr({
            batched: (msg) => replLog(msg, "error")
        });

        try {
            // Try evaluating as expression first
            let result = await pyodide.runPythonAsync(code);
            if (result !== undefined) {
                replLog(String(result), 'result');
            }
        } catch (err) {
            // If it fails, it might be a statement or a real error
            replLog(err, "error");
        } finally {
            replInput.disabled = false;
            replInput.focus();
        }
    }
});

// Clear Handlers
clearBtn.addEventListener('click', () => {
    outputConsole.innerHTML = '<div class="console-line system">Console cleared.</div>';
});

clearReplBtn.addEventListener('click', () => {
    replConsole.innerHTML = '<div class="console-line system">REPL cleared.</div>';
});

// Start initialization
main();
