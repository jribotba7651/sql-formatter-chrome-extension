// DOM Elements
const sqlInput = document.getElementById('sqlInput');
const sqlOutput = document.getElementById('sqlOutput');
const syntaxPreview = document.getElementById('syntaxPreview');
const outputSection = document.getElementById('outputSection');
const statusMessage = document.getElementById('statusMessage');
const charCount = document.getElementById('charCount');

// Option elements
const indentType = document.getElementById('indentType');
const keywordCase = document.getElementById('keywordCase');
const commaPosition = document.getElementById('commaPosition');
const expandCommaLists = document.getElementById('expandCommaLists');
const expandBooleanExpr = document.getElementById('expandBooleanExpr');
const expandCaseStatements = document.getElementById('expandCaseStatements');

// Button elements
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const clearBtn = document.getElementById('clearBtn');
const copyPlainBtn = document.getElementById('copyPlainBtn');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');

// Initialize SQL Formatter
const formatter = new SQLFormatter();

// Load saved options from storage
chrome.storage.sync.get({
    indentType: 'spaces4',
    keywordCase: 'upper',
    commaPosition: 'after',
    expandCommaLists: true,
    expandBooleanExpr: true,
    expandCaseStatements: true
}, (items) => {
    indentType.value = items.indentType;
    keywordCase.value = items.keywordCase;
    commaPosition.value = items.commaPosition;
    expandCommaLists.checked = items.expandCommaLists;
    expandBooleanExpr.checked = items.expandBooleanExpr;
    expandCaseStatements.checked = items.expandCaseStatements;

    updateFormatterOptions();
});

// Save options when changed
function saveOptions() {
    chrome.storage.sync.set({
        indentType: indentType.value,
        keywordCase: keywordCase.value,
        commaPosition: commaPosition.value,
        expandCommaLists: expandCommaLists.checked,
        expandBooleanExpr: expandBooleanExpr.checked,
        expandCaseStatements: expandCaseStatements.checked
    });
}

// Update formatter with current options
function updateFormatterOptions() {
    formatter.setOptions({
        indentType: indentType.value,
        keywordCase: keywordCase.value,
        commaPosition: commaPosition.value,
        expandCommaLists: expandCommaLists.checked,
        expandBooleanExpr: expandBooleanExpr.checked,
        expandCaseStatements: expandCaseStatements.checked
    });
}

// Event listeners for options
indentType.addEventListener('change', () => {
    saveOptions();
    updateFormatterOptions();
});

keywordCase.addEventListener('change', () => {
    saveOptions();
    updateFormatterOptions();
});

commaPosition.addEventListener('change', () => {
    saveOptions();
    updateFormatterOptions();
});

expandCommaLists.addEventListener('change', () => {
    saveOptions();
    updateFormatterOptions();
});

expandBooleanExpr.addEventListener('change', () => {
    saveOptions();
    updateFormatterOptions();
});

expandCaseStatements.addEventListener('change', () => {
    saveOptions();
    updateFormatterOptions();
});

// Show status message
function showStatus(message, type = 'success', duration = 3000) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, duration);
}

// Update character count
function updateCharCount() {
    const count = sqlOutput.value.length;
    charCount.textContent = `${count} characters`;
}

// Format SQL button
formatBtn.addEventListener('click', () => {
    const sql = sqlInput.value.trim();

    if (!sql) {
        showStatus('Please enter some SQL to format', 'info');
        return;
    }

    try {
        updateFormatterOptions();
        const result = formatter.formatAndHighlight(sql);

        sqlOutput.value = result.formatted;
        syntaxPreview.innerHTML = result.highlighted;

        outputSection.style.display = 'block';
        updateCharCount();
        showStatus('✨ SQL formatted successfully!', 'success');
    } catch (error) {
        showStatus('❌ Error formatting SQL: ' + error.message, 'error');
        console.error(error);
    }
});

// Minify SQL button
minifyBtn.addEventListener('click', () => {
    const sql = sqlInput.value.trim();

    if (!sql) {
        showStatus('Please enter some SQL to minify', 'info');
        return;
    }

    try {
        updateFormatterOptions();
        const minified = formatter.minify(sql);
        const highlighted = formatter.highlightSyntax(minified, false);

        sqlOutput.value = minified;
        syntaxPreview.innerHTML = highlighted;

        outputSection.style.display = 'block';
        updateCharCount();
        showStatus('🗜️ SQL minified successfully!', 'success');
    } catch (error) {
        showStatus('❌ Error minifying SQL: ' + error.message, 'error');
        console.error(error);
    }
});

// Clear all button
clearBtn.addEventListener('click', () => {
    sqlInput.value = '';
    sqlOutput.value = '';
    syntaxPreview.innerHTML = '';
    outputSection.style.display = 'none';
    showStatus('Cleared', 'info', 1500);
});

// Copy plain text button
copyPlainBtn.addEventListener('click', async () => {
    if (!sqlOutput.value) {
        showStatus('No SQL to copy', 'info');
        return;
    }

    try {
        await navigator.clipboard.writeText(sqlOutput.value);
        showStatus('📋 Copied plain text to clipboard!', 'success');
    } catch (error) {
        showStatus('❌ Failed to copy to clipboard', 'error');
        console.error(error);
    }
});

// Copy HTML button (with syntax highlighting)
copyHtmlBtn.addEventListener('click', async () => {
    if (!sqlOutput.value) {
        showStatus('No SQL to copy', 'info');
        return;
    }

    try {
        updateFormatterOptions();
        const styledHtml = formatter.generateStyledHtml(sqlOutput.value);

        // Copy both HTML and plain text to clipboard
        const htmlBlob = new Blob([styledHtml], { type: 'text/html' });
        const textBlob = new Blob([sqlOutput.value], { type: 'text/plain' });

        const clipboardItem = new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
        });

        await navigator.clipboard.write([clipboardItem]);
        showStatus('🎨 Copied HTML with syntax highlighting! Paste into Word/Outlook.', 'success', 4000);
    } catch (error) {
        console.error('Clipboard error:', error);
        // Fallback to plain text
        try {
            await navigator.clipboard.writeText(sqlOutput.value);
            showStatus('⚠️ Copied as plain text (HTML copy failed)', 'info', 3000);
        } catch (fallbackError) {
            showStatus('❌ Could not copy to clipboard', 'error');
        }
    }
});

// About link
document.getElementById('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    const aboutText = `SQL Formatter & Beautifier v1.0.0

A free SQL formatter for PostgreSQL, MySQL, T-SQL, Oracle and more.

Features:
• Format SQL with customizable indentation
• Syntax highlighting with colors (Poor SQL style)
• Multiple formatting options (keywords case, comma position, etc.)
• Minify SQL (remove whitespace and comments)
• Copy as HTML with colors for Word/Outlook
• Supports all major SQL dialects
• All processing done locally (private & secure)

Inspired by Poor Man's T-SQL Formatter

Created by jibaroenlaluna
🌙 www.jibaroenlaluna.com

Made with ❤️ in Puerto Rico 🇵🇷

GitHub: github.com/jibaroenlaluna/sql-formatter-chrome-extension`;

    alert(aboutText);
});

// Keyboard shortcuts
sqlInput.addEventListener('keydown', (e) => {
    // Ctrl+Enter to format
    if (e.ctrlKey && e.key === 'Enter') {
        formatBtn.click();
    }
    // Ctrl+Shift+Enter to minify
    if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        minifyBtn.click();
    }
});

// Auto-save input to restore on next open
sqlInput.addEventListener('input', () => {
    chrome.storage.local.set({ lastInput: sqlInput.value });
});

// Restore last input on load
chrome.storage.local.get(['lastInput'], (result) => {
    if (result.lastInput) {
        sqlInput.value = result.lastInput;
    }
});
