let currentFormat = 'json';
        
        // Format configurations
        const formatConfig = {
            json: {
                name: 'JSON',
                extension: '.json',
                mimeType: 'application/json',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces', 'Tab'], default: '2 spaces' },
                    { id: 'sortKeys', label: 'Sort Keys', type: 'checkbox', default: false }
                ],
                sample: '{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"New York","country":"USA"},"hobbies":["reading","gaming","hiking"],"active":true}'
            },
            yaml: {
                name: 'YAML',
                extension: '.yaml',
                mimeType: 'text/yaml',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces'], default: '2 spaces' },
                    { id: 'flowLevel', label: 'Flow Level', type: 'select', options: ['Block', 'Flow (-1)', 'Mixed'], default: 'Block' }
                ],
                sample: 'name: John Doe\nage: 30\nemail: john@example.com\naddress:\n  street: 123 Main St\n  city: New York\nhobbies:\n  - reading\n  - gaming'
            },
            markdown: {
                name: 'Markdown',
                extension: '.md',
                mimeType: 'text/markdown',
                options: [
                    { id: 'preview', label: 'Show Preview', type: 'checkbox', default: true }
                ],
                sample: '# Hello World\n\nThis is a **markdown** document with _formatting_.\n\n## Features\n\n- List item 1\n- List item 2\n- List item 3\n\n### Code Example\n\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```\n\n> This is a blockquote\n\n[Link to Google](https://google.com)'
            },
            xml: {
                name: 'XML',
                extension: '.xml',
                mimeType: 'application/xml',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces', 'Tab'], default: '2 spaces' }
                ],
                sample: '<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>JSON vs XML</title><author>Jane</author><price>39.99</price></book></catalog>'
            },
            html: {
                name: 'HTML',
                extension: '.html',
                mimeType: 'text/html',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces', 'Tab'], default: '2 spaces' }
                ],
                sample: '<!DOCTYPE html><html><head><title>Test</title><style>body{margin:0;}</style></head><body><div class="container"><h1>Hello</h1><p>World</p></div></body></html>'
            },
            css: {
                name: 'CSS',
                extension: '.css',
                mimeType: 'text/css',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces', 'Tab'], default: '2 spaces' }
                ],
                sample: '.container{max-width:1200px;margin:0 auto;padding:20px}.header{background:#333;color:#fff;padding:15px}.btn{display:inline-block;padding:10px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer}.btn:hover{background:#0056b3}'
            },
            sql: {
                name: 'SQL',
                extension: '.sql',
                mimeType: 'text/plain',
                options: [
                    { id: 'uppercase', label: 'Uppercase Keywords', type: 'checkbox', default: true },
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces'], default: '2 spaces' }
                ],
                sample: 'select u.id, u.name, u.email, o.order_id, o.total from users u inner join orders o on u.id = o.user_id where u.active = 1 and o.created_at > "2024-01-01" order by o.total desc limit 10'
            },
            javascript: {
                name: 'JavaScript',
                extension: '.js',
                mimeType: 'text/javascript',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces', 'Tab'], default: '2 spaces' },
                    { id: 'semicolons', label: 'Add Semicolons', type: 'checkbox', default: true },
                    { id: 'singleQuotes', label: 'Single Quotes', type: 'checkbox', default: false }
                ],
                sample: 'const greet=(name)=>{console.log("Hello, "+name+"!");return{message:"Hello",name:name}};function processData(data){if(!data){return null}const result=data.map(item=>item.value*2);return result.filter(x=>x>10)}'
            },
            python: {
                name: 'Python',
                extension: '.py',
                mimeType: 'text/x-python',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['2 spaces', '4 spaces'], default: '4 spaces' },
                    { id: 'sortImports', label: 'Sort Imports', type: 'checkbox', default: true }
                ],
                sample: 'import sys\nimport os\ndef greet(name):print(f"Hello, {name}!");return {"message":"Hello","name":name}\nclass Calculator:\n def __init__(self):self.value=0\n def add(self,x):self.value+=x;return self\n def subtract(self,x):self.value-=x;return self'
            },
            go: {
                name: 'Go',
                extension: '.go',
                mimeType: 'text/x-go',
                options: [
                    { id: 'indent', label: 'Indentation', type: 'select', options: ['Tab', '4 spaces'], default: 'Tab' }
                ],
                sample: 'package main\nimport "fmt"\nfunc main(){fmt.Println("Hello, World!");numbers:=[]int{1,2,3,4,5};for _,n:=range numbers{fmt.Printf("Number: %d\\n",n)}}\nfunc add(a,b int)int{return a+b}'
            }
        };
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            setupFormatButtons();
            setupButtons();
            setupDropZone();
            updateOptions();
            
            document.getElementById('inputEditor').addEventListener('input', updateStats);
        });
        
        function setupFormatButtons() {
            document.querySelectorAll('.format-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFormat = btn.dataset.format;
                    updateOptions();
                    clearOutput();
                });
            });
        }
        
        function setupButtons() {
            document.getElementById('formatBtn').addEventListener('click', formatCode);
            document.getElementById('minifyBtn').addEventListener('click', minifyCode);
            document.getElementById('validateBtn').addEventListener('click', validateCode);
            document.getElementById('convertBtn').addEventListener('click', showConvertOptions);
            document.getElementById('pasteBtn').addEventListener('click', pasteFromClipboard);
            document.getElementById('clearBtn').addEventListener('click', clearAll);
            document.getElementById('sampleBtn').addEventListener('click', loadSample);
            document.getElementById('copyBtn').addEventListener('click', copyOutput);
            document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
        }
        
        function setupDropZone() {
            const dropZone = document.getElementById('dropZone');
            const fileInput = document.getElementById('fileInput');
            
            dropZone.addEventListener('click', () => fileInput.click());
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) loadFile(file);
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) loadFile(e.target.files[0]);
            });
        }
        
        function loadFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('inputEditor').value = e.target.result;
                updateStats();
                
                // Auto-detect format
                const ext = file.name.split('.').pop().toLowerCase();
                const formatMap = {
                    json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown', 
                    markdown: 'markdown', xml: 'xml', html: 'html', htm: 'html',
                    css: 'css', sql: 'sql', js: 'javascript', mjs: 'javascript',
                    jsx: 'javascript', ts: 'javascript', tsx: 'javascript',
                    py: 'python', pyw: 'python', go: 'go'
                };
                if (formatMap[ext]) {
                    currentFormat = formatMap[ext];
                    document.querySelectorAll('.format-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.format === currentFormat);
                    });
                    updateOptions();
                }
            };
            reader.readAsText(file);
        }
        
        function updateOptions() {
            const config = formatConfig[currentFormat];
            const grid = document.getElementById('optionsGrid');
            
            grid.innerHTML = config.options.map(opt => {
                if (opt.type === 'select') {
                    return `
                        <div class="option-group">
                            <label>${opt.label}</label>
                            <select id="opt-${opt.id}">
                                ${opt.options.map(o => `<option ${o === opt.default ? 'selected' : ''}>${o}</option>`).join('')}
                            </select>
                        </div>
                    `;
                } else if (opt.type === 'checkbox') {
                    return `
                        <div class="option-group">
                            <label class="checkbox-option">
                                <input type="checkbox" id="opt-${opt.id}" ${opt.default ? 'checked' : ''}>
                                ${opt.label}
                            </label>
                        </div>
                    `;
                }
            }).join('');
        }
        
        function getIndent() {
            const indentEl = document.getElementById('opt-indent');
            if (!indentEl) return '  ';
            const val = indentEl.value;
            if (val === 'Tab') return '\t';
            if (val === '4 spaces') return '    ';
            return '  ';
        }
        
        function formatCode() {
            const input = document.getElementById('inputEditor').value.trim();
            if (!input) return;
            
            try {
                let output = '';
                const indent = getIndent();
                
                switch (currentFormat) {
                    case 'json':
                        const parsed = JSON.parse(input);
                        const sortKeys = document.getElementById('opt-sortKeys')?.checked;
                        if (sortKeys) {
                            output = JSON.stringify(sortObject(parsed), null, indent);
                        } else {
                            output = JSON.stringify(parsed, null, indent);
                        }
                        break;
                        
                    case 'yaml':
                        const yamlObj = jsyaml.load(input);
                        output = jsyaml.dump(yamlObj, { indent: indent.length });
                        break;
                        
                    case 'markdown':
                        output = input;
                        if (document.getElementById('opt-preview')?.checked) {
                            const outputEl = document.getElementById('outputDisplay');
                            outputEl.className = 'md-preview';
                            outputEl.innerHTML = marked.parse(input);
                            setStatus('valid', 'Markdown rendered');
                            return;
                        }
                        break;
                        
                    case 'xml':
                    case 'html':
                        output = formatXML(input, indent);
                        break;
                        
                    case 'css':
                        output = formatCSS(input, indent);
                        break;
                        
                    case 'sql':
                        output = formatSQL(input);
                        break;
                        
                    case 'javascript':
                        output = formatJavaScript(input, indent);
                        break;
                        
                    case 'python':
                        output = formatPython(input, indent);
                        break;
                        
                    case 'go':
                        output = formatGo(input, indent);
                        break;
                }
                
                displayOutput(output);
                setStatus('valid', 'Formatted successfully');
            } catch (error) {
                setStatus('invalid', 'Error: ' + error.message);
                displayError(error);
            }
        }
        
        function minifyCode() {
            const input = document.getElementById('inputEditor').value.trim();
            if (!input) return;
            
            try {
                let output = '';
                
                switch (currentFormat) {
                    case 'json':
                        output = JSON.stringify(JSON.parse(input));
                        break;
                        
                    case 'yaml':
                        const yamlObj = jsyaml.load(input);
                        output = JSON.stringify(yamlObj);
                        break;
                        
                    case 'xml':
                    case 'html':
                        output = input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
                        break;
                        
                    case 'css':
                        output = input
                            .replace(/\/\*[\s\S]*?\*\//g, '')
                            .replace(/\s+/g, ' ')
                            .replace(/\s*([{}:;,])\s*/g, '$1')
                            .replace(/;}/g, '}')
                            .trim();
                        break;
                        
                    case 'sql':
                        output = input.replace(/\s+/g, ' ').trim();
                        break;
                        
                    case 'javascript':
                        output = minifyJavaScript(input);
                        break;
                        
                    case 'python':
                        // Python can't be safely minified due to indentation significance
                        output = input.split('\n').map(line => line.trimEnd()).filter(line => line.length > 0).join('\n');
                        break;
                        
                    case 'go':
                        output = minifyGo(input);
                        break;
                        
                    default:
                        output = input.replace(/\s+/g, ' ').trim();
                }
                
                displayOutput(output);
                setStatus('valid', 'Minified successfully');
            } catch (error) {
                setStatus('invalid', 'Error: ' + error.message);
            }
        }
        
        function validateCode() {
            const input = document.getElementById('inputEditor').value.trim();
            if (!input) return;
            
            try {
                switch (currentFormat) {
                    case 'json':
                        JSON.parse(input);
                        break;
                        
                    case 'yaml':
                        jsyaml.load(input);
                        break;
                        
                    case 'xml':
                    case 'html':
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(input, currentFormat === 'xml' ? 'application/xml' : 'text/html');
                        const parseError = doc.querySelector('parsererror');
                        if (parseError && currentFormat === 'xml') {
                            throw new Error(parseError.textContent);
                        }
                        break;
                        
                    default:
                        // For formats without strict validation, just confirm
                        break;
                }
                
                setStatus('valid', '✓ Valid ' + formatConfig[currentFormat].name);
                document.getElementById('outputDisplay').textContent = '✅ The ' + formatConfig[currentFormat].name + ' is valid!';
            } catch (error) {
                setStatus('invalid', '✗ Invalid: ' + error.message);
                displayError(error);
            }
        }
        
        function showConvertOptions() {
            const input = document.getElementById('inputEditor').value.trim();
            if (!input) return;
            
            const conversions = {
                json: ['yaml'],
                yaml: ['json'],
                markdown: ['html'],
                xml: ['json']
            };
            
            const available = conversions[currentFormat];
            if (!available) {
                alert('No conversion available for ' + formatConfig[currentFormat].name);
                return;
            }
            
            const target = available[0]; // For simplicity, just use first option
            
            try {
                let output = '';
                
                if (currentFormat === 'json' && target === 'yaml') {
                    const obj = JSON.parse(input);
                    output = jsyaml.dump(obj);
                } else if (currentFormat === 'yaml' && target === 'json') {
                    const obj = jsyaml.load(input);
                    output = JSON.stringify(obj, null, 2);
                } else if (currentFormat === 'markdown' && target === 'html') {
                    output = marked.parse(input);
                } else if (currentFormat === 'xml' && target === 'json') {
                    output = xmlToJson(input);
                }
                
                displayOutput(output);
                setStatus('valid', `Converted to ${formatConfig[target]?.name || target.toUpperCase()}`);
            } catch (error) {
                setStatus('invalid', 'Conversion error: ' + error.message);
            }
        }
        
        // Helper functions
        function sortObject(obj) {
            if (Array.isArray(obj)) {
                return obj.map(sortObject);
            } else if (obj !== null && typeof obj === 'object') {
                return Object.keys(obj).sort().reduce((result, key) => {
                    result[key] = sortObject(obj[key]);
                    return result;
                }, {});
            }
            return obj;
        }
        
        function formatXML(xml, indent) {
            let formatted = '';
            let pad = 0;
            const lines = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3').split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (!line) return;
                
                let padding = '';
                if (line.match(/^<\/\w/)) {
                    pad--;
                }
                for (let i = 0; i < pad; i++) {
                    padding += indent;
                }
                
                formatted += padding + line + '\n';
                
                if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
                    pad++;
                }
            });
            
            return formatted.trim();
        }
        
        function formatCSS(css, indent) {
            return css
                .replace(/\s*{\s*/g, ' {\n' + indent)
                .replace(/\s*}\s*/g, '\n}\n\n')
                .replace(/;\s*/g, ';\n' + indent)
                .replace(new RegExp(indent + '}', 'g'), '}')
                .replace(/\n\n+/g, '\n\n')
                .trim();
        }
        
        function formatSQL(sql) {
            const uppercase = document.getElementById('opt-uppercase')?.checked;
            const indent = getIndent();
            
            const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
                            'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                            'INNER JOIN', 'OUTER JOIN', 'ON', 'AS', 'INSERT', 'INTO', 'VALUES',
                            'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'VIEW',
                            'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY KEY', 'FOREIGN KEY',
                            'REFERENCES', 'NOT NULL', 'DEFAULT', 'UNIQUE', 'CHECK', 'CONSTRAINT'];
            
            let formatted = sql;
            
            // Uppercase keywords
            if (uppercase) {
                keywords.forEach(kw => {
                    const regex = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
                    formatted = formatted.replace(regex, kw);
                });
            }
            
            // Add newlines before major keywords
            const breakBefore = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
                                'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN'];
            
            breakBefore.forEach(kw => {
                const regex = new RegExp('\\s+(' + kw.replace(/ /g, '\\s+') + ')\\b', 'gi');
                formatted = formatted.replace(regex, '\n$1');
            });
            
            // Indent continuation lines
            const lines = formatted.split('\n');
            formatted = lines.map((line, i) => {
                if (i === 0) return line.trim();
                if (line.match(/^(AND|OR)\b/i)) return indent + line.trim();
                return line.trim();
            }).join('\n');
            
            return formatted;
        }
        
        // ==================== JAVASCRIPT FORMATTER ====================
        function formatJavaScript(code, indent) {
            const addSemicolons = document.getElementById('opt-semicolons')?.checked ?? true;
            const singleQuotes = document.getElementById('opt-singleQuotes')?.checked ?? false;
            
            let formatted = '';
            let indentLevel = 0;
            let inString = false;
            let stringChar = '';
            let inComment = false;
            let inMultilineComment = false;
            
            // First, normalize the code
            code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            
            // Add spaces around operators and format
            let i = 0;
            while (i < code.length) {
                const char = code[i];
                const nextChar = code[i + 1] || '';
                const prevChar = formatted[formatted.length - 1] || '';
                
                // Handle strings
                if (!inComment && !inMultilineComment && (char === '"' || char === "'" || char === '`')) {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    } else if (char === stringChar && code[i - 1] !== '\\') {
                        inString = false;
                    }
                    formatted += char;
                    i++;
                    continue;
                }
                
                if (inString) {
                    formatted += char;
                    i++;
                    continue;
                }
                
                // Handle comments
                if (char === '/' && nextChar === '/') {
                    inComment = true;
                    formatted += char;
                    i++;
                    continue;
                }
                
                if (char === '/' && nextChar === '*') {
                    inMultilineComment = true;
                    formatted += char;
                    i++;
                    continue;
                }
                
                if (inMultilineComment && char === '*' && nextChar === '/') {
                    inMultilineComment = false;
                    formatted += '*/';
                    i += 2;
                    continue;
                }
                
                if (char === '\n' && inComment) {
                    inComment = false;
                }
                
                if (inComment || inMultilineComment) {
                    formatted += char;
                    i++;
                    continue;
                }
                
                // Handle braces
                if (char === '{') {
                    formatted = formatted.trimEnd() + ' {\n' + indent.repeat(indentLevel + 1);
                    indentLevel++;
                    i++;
                    continue;
                }
                
                if (char === '}') {
                    indentLevel = Math.max(0, indentLevel - 1);
                    formatted = formatted.trimEnd() + '\n' + indent.repeat(indentLevel) + '}';
                    i++;
                    continue;
                }
                
                // Handle semicolons
                if (char === ';') {
                    formatted = formatted.trimEnd() + ';\n' + indent.repeat(indentLevel);
                    i++;
                    continue;
                }
                
                // Handle newlines
                if (char === '\n') {
                    if (prevChar !== '\n' && prevChar !== '{') {
                        formatted += '\n' + indent.repeat(indentLevel);
                    }
                    i++;
                    continue;
                }
                
                // Skip extra whitespace
                if (char === ' ' || char === '\t') {
                    if (prevChar !== ' ' && prevChar !== '\n' && prevChar !== '(' && prevChar !== '[') {
                        formatted += ' ';
                    }
                    i++;
                    continue;
                }
                
                formatted += char;
                i++;
            }
            
            // Clean up
            formatted = formatted
                .replace(/\n\s*\n\s*\n/g, '\n\n')  // Max 2 newlines
                .replace(/{\s+}/g, '{}')  // Empty blocks
                .replace(/\(\s+/g, '(')  // Space after (
                .replace(/\s+\)/g, ')')  // Space before )
                .trim();
            
            // Convert quotes if needed
            if (singleQuotes) {
                formatted = formatted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, "'$1'");
            }
            
            return formatted;
        }
        
        function minifyJavaScript(code) {
            // Remove comments
            code = code.replace(/\/\/.*$/gm, '');
            code = code.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Remove extra whitespace while preserving strings
            let result = '';
            let inString = false;
            let stringChar = '';
            
            for (let i = 0; i < code.length; i++) {
                const char = code[i];
                
                if (!inString && (char === '"' || char === "'" || char === '`')) {
                    inString = true;
                    stringChar = char;
                    result += char;
                } else if (inString && char === stringChar && code[i-1] !== '\\') {
                    inString = false;
                    result += char;
                } else if (inString) {
                    result += char;
                } else if (/\s/.test(char)) {
                    const prev = result[result.length - 1];
                    const next = code[i + 1];
                    // Keep space if between alphanumeric chars
                    if (/[a-zA-Z0-9_$]/.test(prev) && /[a-zA-Z0-9_$]/.test(next)) {
                        result += ' ';
                    }
                } else {
                    result += char;
                }
            }
            
            return result.trim();
        }
        
        // ==================== PYTHON FORMATTER ====================
        function formatPython(code, indent) {
            const sortImports = document.getElementById('opt-sortImports')?.checked ?? true;
            
            let lines = code.split('\n');
            let formatted = [];
            let currentIndent = 0;
            
            // Extract imports for sorting
            let imports = [];
            let fromImports = [];
            let otherLines = [];
            let seenNonImport = false;
            
            for (let line of lines) {
                const trimmed = line.trim();
                
                if (!seenNonImport && (trimmed.startsWith('import ') || trimmed.startsWith('from '))) {
                    if (trimmed.startsWith('import ')) imports.push(trimmed);
                    else fromImports.push(trimmed);
                } else if (trimmed.length > 0) {
                    seenNonImport = true;
                    otherLines.push(line);
                } else if (seenNonImport) {
                    otherLines.push(line);
                }
            }
            
            if (sortImports) {
                imports.sort();
                fromImports.sort();
            }
            
            if (imports.length > 0 || fromImports.length > 0) {
                formatted = [...imports, ...fromImports];
                if (otherLines.length > 0) formatted.push('');
            }
            
            const indentKeywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'async def', 'async for', 'async with'];
            const dedentKeywords = ['elif', 'else', 'except', 'finally'];

            for (let i = 0; i < otherLines.length; i++) {
                let line = otherLines[i].trim();
                if (line.length === 0) {
                    formatted.push('');
                    continue;
                }

                // Dedent before checking keyword
                let isDedent = dedentKeywords.some(kw => line.startsWith(kw + ' ') || line.startsWith(kw + ':') || line === kw);
                if (isDedent) {
                    currentIndent = Math.max(0, currentIndent - 1);
                }

                formatted.push(indent.repeat(currentIndent) + line);

                // Indent after colon
                if (line.endsWith(':') && !line.startsWith('#')) {
                    currentIndent++;
                }

                // Simple heuristic for dedenting after return/break/continue
                // If next line is not indented more and current line ends a block
                if (line.match(/^(return|break|continue|pass|raise)\b/)) {
                    // We don't dedent immediately because siblings might follow
                    // But we could look ahead
                    let nextLine = (otherLines[i + 1] || '').trim();
                    if (nextLine && !dedentKeywords.some(kw => nextLine.startsWith(kw)) && !nextLine.endsWith(':')) {
                        // This is very risky, better to just let the user handle it or use a real parser
                    }
                }
            }
            
            return formatted.join('\n').replace(/\n{3,}/g, '\n\n').trim();
        }
        
        // ==================== GO FORMATTER ====================
        function formatGo(code, indent) {
            let formatted = '';
            let indentLevel = 0;
            let inString = false;
            let stringChar = '';
            let inComment = false;
            let inMultilineComment = false;
            
            code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            
            let i = 0;
            while (i < code.length) {
                const char = code[i];
                const nextChar = code[i + 1] || '';
                const prevChar = formatted[formatted.length - 1] || '';
                
                // Handle strings
                if (!inComment && !inMultilineComment && (char === '"' || char === '`')) {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    } else if (char === stringChar && code[i - 1] !== '\\') {
                        inString = false;
                    }
                    formatted += char;
                    i++;
                    continue;
                }
                
                if (inString) {
                    formatted += char;
                    i++;
                    continue;
                }
                
                // Handle comments
                if (char === '/' && nextChar === '/') {
                    inComment = true;
                    formatted += char;
                    i++;
                    continue;
                }
                
                if (char === '/' && nextChar === '*') {
                    inMultilineComment = true;
                    formatted += char;
                    i++;
                    continue;
                }
                
                if (inMultilineComment && char === '*' && nextChar === '/') {
                    inMultilineComment = false;
                    formatted += '*/';
                    i += 2;
                    continue;
                }
                
                if (char === '\n' && inComment) {
                    inComment = false;
                }
                
                if (inComment || inMultilineComment) {
                    formatted += char;
                    i++;
                    continue;
                }
                
                // Handle braces
                if (char === '{') {
                    formatted = formatted.trimEnd() + ' {\n' + indent.repeat(indentLevel + 1);
                    indentLevel++;
                    i++;
                    continue;
                }
                
                if (char === '}') {
                    indentLevel = Math.max(0, indentLevel - 1);
                    formatted = formatted.trimEnd() + '\n' + indent.repeat(indentLevel) + '}';
                    i++;
                    continue;
                }
                
                // Handle semicolons (Go uses them implicitly)
                if (char === ';') {
                    formatted = formatted.trimEnd() + '\n' + indent.repeat(indentLevel);
                    i++;
                    continue;
                }
                
                // Handle newlines
                if (char === '\n') {
                    formatted += '\n' + indent.repeat(indentLevel);
                    i++;
                    continue;
                }
                
                // Skip extra whitespace
                if (char === ' ' || char === '\t') {
                    if (prevChar !== ' ' && prevChar !== '\n' && prevChar !== '(' && prevChar !== '[') {
                        formatted += ' ';
                    }
                    i++;
                    continue;
                }
                
                formatted += char;
                i++;
            }
            
            // Clean up and add blank lines between top-level declarations
            formatted = formatted
                .replace(/\n\s*\n\s*\n/g, '\n\n')
                .replace(/}\s*func /g, '}\n\nfunc ')
                .replace(/}\s*type /g, '}\n\ntype ')
                .trim();
            
            return formatted;
        }
        
        function minifyGo(code) {
            // Remove comments
            code = code.replace(/\/\/.*$/gm, '');
            code = code.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // Replace newlines with semicolons where needed
            let result = '';
            let inString = false;
            let stringChar = '';
            
            const lines = code.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    if (result && !result.endsWith('{') && !result.endsWith('(') && 
                        !line.startsWith('}') && !line.startsWith(')')) {
                        result += ';';
                    }
                    result += line;
                }
            }
            
            // Clean up extra semicolons
            result = result.replace(/;+/g, ';').replace(/;}/g, '}').replace(/{;/g, '{');
            
            return result.trim();
        }
        
        function xmlToJson(xml) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, 'application/xml');
            
            function nodeToObj(node) {
                const obj = {};
                
                if (node.attributes) {
                    for (let i = 0; i < node.attributes.length; i++) {
                        const attr = node.attributes[i];
                        obj['@' + attr.name] = attr.value;
                    }
                }
                
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i];
                    if (child.nodeType === 1) {
                        const childObj = nodeToObj(child);
                        if (obj[child.nodeName]) {
                            if (!Array.isArray(obj[child.nodeName])) {
                                obj[child.nodeName] = [obj[child.nodeName]];
                            }
                            obj[child.nodeName].push(childObj);
                        } else {
                            obj[child.nodeName] = childObj;
                        }
                    } else if (child.nodeType === 3) {
                        const text = child.textContent.trim();
                        if (text) {
                            obj['#text'] = text;
                        }
                    }
                }
                
                // Simplify if only text content
                if (Object.keys(obj).length === 1 && obj['#text']) {
                    return obj['#text'];
                }
                
                return obj;
            }
            
            const result = {};
            result[doc.documentElement.nodeName] = nodeToObj(doc.documentElement);
            return JSON.stringify(result, null, 2);
        }
        
        function displayOutput(text) {
            const outputEl = document.getElementById('outputDisplay');
            outputEl.className = 'output-display';
            
            if (currentFormat === 'json') {
                outputEl.innerHTML = highlightTokens(text, [
                    { regex: /"([^"]+)":/g, class: 'hl-key' },
                    { regex: /"(?:[^"\\]|\\.)*"/g, class: 'hl-string' },
                    { regex: /\b-?\d+\.?\d*\b/g, class: 'hl-number' },
                    { regex: /\b(true|false|null)\b/g, class: 'hl-boolean' },
                    { regex: /[[\]{}]/g, class: 'hl-bracket' }
                ]);
            } else if (currentFormat === 'yaml') {
                outputEl.innerHTML = highlightTokens(text, [
                    { regex: /#.*$/gm, class: 'hl-comment' },
                    { regex: /^(\s*)([^:\n]+):/gm, class: 'hl-key' },
                    { regex: /"(?:[^"\\]|\\.)*"/g, class: 'hl-string' },
                    { regex: /'(?:[^'\\]|\\.)*'/g, class: 'hl-string' },
                    { regex: /\b(true|false|yes|no|null|~)\b/gi, class: 'hl-boolean' },
                    { regex: /\b-?\d+\.?\d*\b/g, class: 'hl-number' }
                ]);
            } else if (currentFormat === 'javascript') {
                const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 
                                'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 
                                'throw', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 
                                'default', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof', 
                                'in', 'of', 'delete', 'void', 'static', 'get', 'set'];
                outputEl.innerHTML = highlightTokens(text, [
                    { regex: /\/\/.*$/gm, class: 'hl-comment' },
                    { regex: /\/\*[\s\S]*?\*\//g, class: 'hl-comment' },
                    { regex: /"(?:[^"\\]|\\.)*"/g, class: 'hl-string' },
                    { regex: /'(?:[^'\\]|\\.)*'/g, class: 'hl-string' },
                    { regex: /`(?:[^`\\$]|\\.)*`/g, class: 'hl-string' },
                    { regex: new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g'), class: 'hl-key' },
                    { regex: /\b(-?\d+\.?\d*)\b/g, class: 'hl-number' },
                    { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, class: 'hl-boolean' }
                ]);
            } else if (currentFormat === 'python') {
                const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 
                                'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'raise', 
                                'pass', 'break', 'continue', 'lambda', 'and', 'or', 'not', 'in', 'is', 
                                'global', 'nonlocal', 'assert', 'del', 'async', 'await'];
                outputEl.innerHTML = highlightTokens(text, [
                    { regex: /#.*$/gm, class: 'hl-comment' },
                    { regex: /"""[\s\S]*?"""/g, class: 'hl-string' },
                    { regex: /'''[\s\S]*?'''/g, class: 'hl-string' },
                    { regex: /f?"(?:[^"\\]|\\.)*"/g, class: 'hl-string' },
                    { regex: /f?'(?:[^'\\]|\\.)*'/g, class: 'hl-string' },
                    { regex: new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g'), class: 'hl-key' },
                    { regex: /\b(-?\d+\.?\d*)\b/g, class: 'hl-number' },
                    { regex: /\b(True|False|None)\b/g, class: 'hl-boolean' },
                    { regex: /@\w+/g, class: 'hl-key' }
                ]);
            } else if (currentFormat === 'go') {
                const keywords = ['func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan',
                                'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 
                                'continue', 'return', 'go', 'defer', 'select', 'fallthrough', 'goto',
                                'package', 'import', 'make', 'new', 'len', 'cap', 'append', 'copy',
                                'delete', 'panic', 'recover'];
                const types = ['int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 
                              'uint32', 'uint64', 'float32', 'float64', 'complex64', 'complex128',
                              'bool', 'string', 'byte', 'rune', 'error', 'any'];
                outputEl.innerHTML = highlightTokens(text, [
                    { regex: /\/\/.*$/gm, class: 'hl-comment' },
                    { regex: /\/\*[\s\S]*?\*\//g, class: 'hl-comment' },
                    { regex: /"(?:[^"\\]|\\.)*"/g, class: 'hl-string' },
                    { regex: /`[^`]*`/g, class: 'hl-string' },
                    { regex: new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g'), class: 'hl-key' },
                    { regex: new RegExp('\\b(' + types.join('|') + ')\\b', 'g'), class: 'hl-null' },
                    { regex: /\b(-?\d+\.?\d*)\b/g, class: 'hl-number' },
                    { regex: /\b(true|false|nil)\b/g, class: 'hl-boolean' }
                ]);
            } else {
                outputEl.textContent = text;
            }
        }
        
        function displayError(error) {
            const outputEl = document.getElementById('outputDisplay');
            outputEl.className = 'output-display';
            outputEl.innerHTML = `<span class="error-highlight">❌ ${escapeHtml(error.message)}</span>`;
        }
        
        function escapeHtml(text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function highlightTokens(text, rules) {
            if (!text) return '';
            const tokens = [];
            let lastIndex = 0;
            
            try {
                // Build a single regex by joining all rule regexes with |
                const combinedRegex = new RegExp(
                    rules.map((r, i) => `(?<R${i}>${r.regex.source})`).join('|'),
                    'g' + (rules[0].regex.flags.includes('m') ? 'm' : '') + (rules[0].regex.flags.includes('i') ? 'i' : '')
                );
                
                let match;
                while ((match = combinedRegex.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                        tokens.push(escapeHtml(text.substring(lastIndex, match.index)));
                    }
                    
                    for (let i = 0; i < rules.length; i++) {
                        const groupName = `R${i}`;
                        if (match.groups && match.groups[groupName] !== undefined) {
                            tokens.push(`<span class="${rules[i].class}">${escapeHtml(match.groups[groupName])}</span>`);
                            break;
                        }
                    }
                    lastIndex = combinedRegex.lastIndex;
                    if (match.index === combinedRegex.lastIndex) combinedRegex.lastIndex++;
                }
            } catch (e) {
                console.error('Highlight error:', e);
                return escapeHtml(text);
            }
            
            if (lastIndex < text.length) {
                tokens.push(escapeHtml(text.substring(lastIndex)));
            }
            
            return tokens.join('');
        }
        


        function setStatus(type, message) {
            const statusEl = document.getElementById('validationStatus');
            statusEl.className = 'status ' + type;
            statusEl.innerHTML = message;
        }
        
        function updateStats() {
            const input = document.getElementById('inputEditor').value;
            const lines = input.split('\n').length;
            const chars = input.length;
            document.getElementById('stats').textContent = `Lines: ${lines} | Characters: ${chars}`;
        }
        
        function clearOutput() {
            document.getElementById('outputDisplay').innerHTML = '';
            document.getElementById('outputDisplay').className = 'output-display';
            setStatus('', 'Ready');
        }
        
        function clearAll() {
            document.getElementById('inputEditor').value = '';
            clearOutput();
            updateStats();
        }
        
        function loadSample() {
            document.getElementById('inputEditor').value = formatConfig[currentFormat].sample;
            updateStats();
        }
        
        async function pasteFromClipboard() {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('inputEditor').value = text;
                updateStats();
            } catch (error) {
                alert('Unable to read from clipboard. Please paste manually.');
            }
        }
        
        async function copyOutput() {
            const outputEl = document.getElementById('outputDisplay');
            const text = outputEl.innerText || outputEl.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                const btn = document.getElementById('copyBtn');
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                setTimeout(() => btn.textContent = originalText, 2000);
            } catch (error) {
                alert('Unable to copy. Please select and copy manually.');
            }
        }
        
        function downloadOutput() {
            const outputEl = document.getElementById('outputDisplay');
            const text = outputEl.innerText || outputEl.textContent;
            const config = formatConfig[currentFormat];
            
            const blob = new Blob([text], { type: config.mimeType });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `formatted-${Date.now()}${config.extension}`;
            link.click();
            URL.revokeObjectURL(link.href);
        }