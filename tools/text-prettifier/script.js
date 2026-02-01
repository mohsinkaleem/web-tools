// Initialize CodeMirror Editors
const inputEditor = CodeMirror(document.getElementById('input-editor'), {
    mode: 'application/json',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: false
});

const outputEditor = CodeMirror(document.getElementById('output-editor'), {
    mode: 'application/json',
    theme: 'dracula',
    lineNumbers: true,
    readOnly: true,
    lineWrapping: true
});

// DOM Elements
const languageSelect = document.getElementById('language-select');
const formatBtn = document.getElementById('format-btn');
const minifyBtn = document.getElementById('minify-btn');
const detectBtn = document.getElementById('detect-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const clearBtn = document.getElementById('clear-btn');
const statusIndicator = document.getElementById('status-indicator');
const manageTabsCheck = document.getElementById('manage-tabs');
const tabWidthInput = document.getElementById('tab-width');

// Text Transformation Buttons
const upperBtn = document.getElementById('upper-btn');
const lowerBtn = document.getElementById('lower-btn');
const titleBtn = document.getElementById('title-btn');
const sortBtn = document.getElementById('sort-btn');

// Configuration
const PRETTIER_PLUGINS = window.prettierPlugins;

// Language Mapping
const languageConfig = {
    json: { mode: 'application/json', parser: 'json', ext: 'json' },
    javascript: { mode: 'javascript', parser: 'babel', ext: 'js' },
    typescript: { mode: 'text/typescript', parser: 'typescript', ext: 'ts' },
    python: { mode: 'python', parser: 'python', ext: 'py' },
    go: { mode: 'text/x-go', parser: 'go', ext: 'go' },
    html: { mode: 'htmlmixed', parser: 'html', ext: 'html' },
    css: { mode: 'css', parser: 'css', ext: 'css' },
    yaml: { mode: 'yaml', parser: 'yaml', ext: 'yaml' },
    markdown: { mode: 'markdown', parser: 'markdown', ext: 'md' },
    xml: { mode: 'xml', parser: 'xml', ext: 'xml' },
    sql: { mode: 'text/x-sql', parser: 'sql', ext: 'sql' }
};

// Event Listeners
languageSelect.addEventListener('change', updateLanguage);
formatBtn.addEventListener('click', formatCode);
minifyBtn.addEventListener('click', minifyCode);
detectBtn.addEventListener('click', detectLanguage);
copyBtn.addEventListener('click', copyOutput);
downloadBtn.addEventListener('click', downloadOutput);
clearBtn.addEventListener('click', clearAll);

// Text Transformation Listeners
upperBtn.addEventListener('click', () => transformText('upper'));
lowerBtn.addEventListener('click', () => transformText('lower'));
titleBtn.addEventListener('click', () => transformText('title'));
sortBtn.addEventListener('click', () => transformText('sort'));

function updateLanguage() {
    const lang = languageSelect.value;
    const config = languageConfig[lang];
    
    inputEditor.setOption('mode', config.mode);
    outputEditor.setOption('mode', config.mode);
    statusIndicator.textContent = '';
}

async function formatCode() {
    const code = inputEditor.getValue();
    const lang = languageSelect.value;
    const config = languageConfig[lang];
    const useTabs = manageTabsCheck.checked;
    const tabWidth = parseInt(tabWidthInput.value) || 2;

    if (!code.trim()) {
        outputEditor.setValue('');
        return;
    }

    try {
        let formatted = '';

        if (lang === 'xml') {
            // Use xml-formatter
            if (window.xmlFormatter) {
                formatted = window.xmlFormatter(code, {
                    indentation: useTabs ? '\t' : ' '.repeat(tabWidth),
                    collapseContent: true,
                    lineSeparator: '\n'
                });
            } else {
                throw new Error("XML Formatter library not loaded.");
            }
        } else if (lang === 'sql') {
            // Use sql-formatter
            if (window.sqlFormatter) {
                formatted = window.sqlFormatter.format(code, {
                    language: 'sql',
                    indent: useTabs ? '\t' : ' '.repeat(tabWidth)
                });
            } else {
                throw new Error("SQL Formatter library not loaded.");
            }
        } else if (lang === 'python') {
            formatted = basicBeautify(code, 'python', useTabs, tabWidth);
        } else if (lang === 'go') {
            formatted = basicBeautify(code, 'go', true, 8); // Go usually uses 8-char tabs
        } else {
            // Use Prettier
            formatted = await prettier.format(code, {
                parser: config.parser,
                plugins: PRETTIER_PLUGINS,
                useTabs: useTabs,
                tabWidth: tabWidth,
                printWidth: 80,
                // Add any parser specific options here if needed
            });
        }

        outputEditor.setValue(formatted);
        showStatus('Success', 'success');
    } catch (err) {
        console.error(err);
        showStatus(`Error: ${err.message}`, 'error');
        outputEditor.setValue(err.message); // Show error in output
    }
}

function minifyCode() {
    const code = inputEditor.getValue();
    const lang = languageSelect.value;

    if (!code.trim()) return;

    try {
        let minified = '';

        if (lang === 'json') {
            minified = JSON.stringify(JSON.parse(code));
        } else if (lang === 'xml') {
             if (window.xmlFormatter) {
                minified = window.xmlFormatter(code, {
                    indentation: '', 
                    lineSeparator: '',
                    collapseContent: true
                });
            }
        } else if (lang === 'css') {
            // Basic CSS Minification
            minified = code
                .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
                .replace(/\s+/g, " ")             // Collapse whitespace
                .replace(/ ?([{:;]) ?/g, "$1")    // Remove space around brackets/colons
                .trim();
        } else if (lang === 'javascript' || lang === 'typescript') {
            // Very risky to minify JS/TS with regex. Just warn.
             showStatus('Minification not supported for JS/TS in browser safely.', 'error');
             return;
        } else if (lang === 'python' || lang === 'go') {
             showStatus(`Minification not supported for ${lang}`, 'error');
             return;
        } else {
             showStatus(`Minification not supported for ${lang}`, 'error');
             return;
        }

        outputEditor.setValue(minified);
        showStatus('Minified', 'success');
    } catch (err) {
        showStatus(`Invalid ${lang}: ${err.message}`, 'error');
    }
}

function copyOutput() {
    const content = outputEditor.getValue();
    if (!content) return;
    
    navigator.clipboard.writeText(content).then(() => {
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
    });
}

function clearAll() {
    inputEditor.setValue('');
    outputEditor.setValue('');
    statusIndicator.textContent = '';
}

function showStatus(msg, type) {
    statusIndicator.textContent = msg;
    statusIndicator.className = 'status ' + type;
}

function basicBeautify(code, lang, useTabs, tabWidth) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentStr = useTabs ? '\t' : ' '.repeat(tabWidth);
    const result = [];

    for (let line of lines) {
        let trimmedLine = line.trim();
        
        if (trimmedLine === '') {
            result.push('');
            continue;
        }

        // Very basic de-indentation logic
        if (lang === 'go' && (trimmedLine.startsWith('}') || trimmedLine.startsWith(')'))) {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        result.push(indentStr.repeat(indentLevel) + trimmedLine);

        // Very basic indentation logic
        if (lang === 'go' && (trimmedLine.endsWith('{') || trimmedLine.endsWith('('))) {
            indentLevel++;
        } else if (lang === 'python' && trimmedLine.endsWith(':')) {
            indentLevel++;
        }
    }
    return result.join('\n');
}

function detectLanguage() {
    const code = inputEditor.getValue().trim();
    if (!code) return;

    let detected = 'javascript'; // Default

    if (code.startsWith('{') || code.startsWith('[')) {
        try { JSON.parse(code); detected = 'json'; } catch(e) {}
    } else if (code.includes('import ') && (code.includes('def ') || code.includes('if __name__ =='))) {
        detected = 'python';
    } else if (code.includes('package main') || code.includes('func ')) {
        detected = 'go';
    } else if (code.startsWith('<') && (code.includes('<!DOCTYPE html>') || code.includes('</html>'))) {
        detected = 'html';
    } else if (code.startsWith('<') && code.includes('<?xml')) {
        detected = 'xml';
    } else if (code.includes('SELECT ') || code.includes('CREATE TABLE')) {
        detected = 'sql';
    } else if (code.includes('---') || (code.includes(': ') && !code.includes('{'))) {
        detected = 'yaml';
    }

    languageSelect.value = detected;
    updateLanguage();
    showStatus(`Detected: ${detected.toUpperCase()}`, 'success');
}

function downloadOutput() {
    const content = outputEditor.getValue();
    if (!content) return;

    const lang = languageSelect.value;
    const ext = languageConfig[lang].ext || 'txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function transformText(type) {
    const code = inputEditor.getValue();
    if (!code) return;

    let result = '';
    switch (type) {
        case 'upper':
            result = code.toUpperCase();
            break;
        case 'lower':
            result = code.toLowerCase();
            break;
        case 'title':
            result = code.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            break;
        case 'sort':
            result = code.split('\n').sort().join('\n');
            break;
    }
    outputEditor.setValue(result);
    showStatus('Transformed', 'success');
}

// Initial mode setup
updateLanguage();
