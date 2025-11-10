/**
 * SQL Formatter - Similar to Poor Man's T-SQL Formatter
 * Tokenizes, formats, and syntax highlights SQL queries
 */

class SQLFormatter {
    constructor() {
        // SQL Keywords
        this.keywords = new Set([
            'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
            'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA',
            'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING',
            'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'IS', 'NULL',
            'AS', 'DISTINCT', 'ALL', 'ANY', 'SOME',
            'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
            'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC',
            'LIMIT', 'OFFSET', 'FETCH', 'FIRST', 'NEXT', 'ONLY', 'ROWS',
            'UNION', 'INTERSECT', 'EXCEPT', 'MINUS',
            'INTO', 'VALUES', 'SET',
            'BEGIN', 'END', 'IF', 'ELSE', 'WHILE', 'LOOP', 'RETURN',
            'DECLARE', 'EXECUTE', 'EXEC',
            'WITH', 'RECURSIVE', 'CTE',
            'PARTITION', 'OVER', 'WINDOW',
            'CAST', 'CONVERT', 'COALESCE', 'NULLIF',
            'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
            'CONSTRAINT', 'CASCADE', 'RESTRICT',
            'GRANT', 'REVOKE', 'DENY',
            'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'TRANSACTION',
            'PUBLIC', 'TRUE', 'FALSE'
        ]);

        // SQL Functions
        this.functions = new Set([
            'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
            'UPPER', 'LOWER', 'TRIM', 'LTRIM', 'RTRIM', 'SUBSTRING', 'CONCAT', 'LENGTH', 'LEN',
            'REPLACE', 'CHARINDEX', 'PATINDEX',
            'NOW', 'GETDATE', 'CURRENT_TIMESTAMP', 'DATE', 'TIME', 'DATETIME',
            'DATEADD', 'DATEDIFF', 'DATEPART', 'YEAR', 'MONTH', 'DAY',
            'ROUND', 'CEILING', 'FLOOR', 'ABS', 'POWER', 'SQRT',
            'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE',
            'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE',
            'STRING_AGG', 'ARRAY_AGG', 'JSON_AGG'
        ]);

        // Operators
        this.operators = new Set([
            '=', '<', '>', '<=', '>=', '<>', '!=',
            '+', '-', '*', '/', '%',
            '||', '&&',
            '(', ')', ',', ';', '.'
        ]);

        // Major clause keywords that should start new sections
        this.majorClauses = new Set([
            'SELECT', 'FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER',
            'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'JOIN',
            'UNION', 'INTERSECT', 'EXCEPT', 'MINUS'
        ]);

        // Default formatting options
        this.options = {
            indentType: 'spaces4',
            keywordCase: 'upper',
            commaPosition: 'after',
            expandCommaLists: true,
            expandBooleanExpr: true,
            expandCaseStatements: true
        };
    }

    /**
     * Set formatting options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Get indent string based on options
     */
    getIndent(level = 1) {
        const base = this.options.indentType === 'tabs' ? '\t' :
                     this.options.indentType === 'spaces2' ? '  ' : '    ';
        return base.repeat(level);
    }

    /**
     * Format keyword case based on options
     */
    formatKeyword(keyword) {
        const upper = keyword.toUpperCase();

        switch (this.options.keywordCase) {
            case 'upper':
                return upper;
            case 'lower':
                return keyword.toLowerCase();
            case 'proper':
                return upper.charAt(0) + keyword.slice(1).toLowerCase();
            default:
                return upper;
        }
    }

    /**
     * Tokenize SQL string into tokens
     */
    tokenize(sql) {
        const tokens = [];
        let i = 0;

        while (i < sql.length) {
            const char = sql[i];

            // Skip whitespace
            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // Single line comment --
            if (char === '-' && sql[i + 1] === '-') {
                let comment = '';
                while (i < sql.length && sql[i] !== '\n') {
                    comment += sql[i];
                    i++;
                }
                tokens.push({ type: 'comment', value: comment });
                continue;
            }

            // Multi-line comment /* */
            if (char === '/' && sql[i + 1] === '*') {
                let comment = '';
                while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) {
                    comment += sql[i];
                    i++;
                }
                comment += '*/';
                i += 2;
                tokens.push({ type: 'comment', value: comment });
                continue;
            }

            // String literals with single quotes
            if (char === "'") {
                let string = "'";
                i++;
                while (i < sql.length) {
                    if (sql[i] === "'" && sql[i + 1] === "'") {
                        // Escaped single quote
                        string += "''";
                        i += 2;
                    } else if (sql[i] === "'") {
                        string += "'";
                        i++;
                        break;
                    } else {
                        string += sql[i];
                        i++;
                    }
                }
                tokens.push({ type: 'string', value: string });
                continue;
            }

            // String literals with double quotes (identifiers or strings depending on DB)
            if (char === '"') {
                let string = '"';
                i++;
                while (i < sql.length && sql[i] !== '"') {
                    string += sql[i];
                    i++;
                }
                string += '"';
                i++;
                tokens.push({ type: 'identifier', value: string });
                continue;
            }

            // Numbers
            if (/\d/.test(char)) {
                let number = '';
                while (i < sql.length && /[\d.]/.test(sql[i])) {
                    number += sql[i];
                    i++;
                }
                tokens.push({ type: 'number', value: number });
                continue;
            }

            // Operators (multi-char first)
            if (char === '<' && sql[i + 1] === '=') {
                tokens.push({ type: 'operator', value: '<=' });
                i += 2;
                continue;
            }
            if (char === '>' && sql[i + 1] === '=') {
                tokens.push({ type: 'operator', value: '>=' });
                i += 2;
                continue;
            }
            if (char === '<' && sql[i + 1] === '>') {
                tokens.push({ type: 'operator', value: '<>' });
                i += 2;
                continue;
            }
            if (char === '!' && sql[i + 1] === '=') {
                tokens.push({ type: 'operator', value: '!=' });
                i += 2;
                continue;
            }
            if (char === '|' && sql[i + 1] === '|') {
                tokens.push({ type: 'operator', value: '||' });
                i += 2;
                continue;
            }
            if (char === '&' && sql[i + 1] === '&') {
                tokens.push({ type: 'operator', value: '&&' });
                i += 2;
                continue;
            }

            // Single char operators
            if (this.operators.has(char)) {
                tokens.push({ type: 'operator', value: char });
                i++;
                continue;
            }

            // Keywords, identifiers, functions
            if (/[a-zA-Z_]/.test(char)) {
                let word = '';
                while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) {
                    word += sql[i];
                    i++;
                }

                const upperWord = word.toUpperCase();

                if (this.keywords.has(upperWord)) {
                    tokens.push({ type: 'keyword', value: upperWord });
                } else if (this.functions.has(upperWord)) {
                    tokens.push({ type: 'function', value: upperWord });
                } else {
                    tokens.push({ type: 'identifier', value: word });
                }
                continue;
            }

            // Unknown character, just add it
            tokens.push({ type: 'unknown', value: char });
            i++;
        }

        return tokens;
    }

    /**
     * Format SQL with proper indentation and line breaks
     */
    format(sql) {
        const tokens = this.tokenize(sql);
        let formatted = '';
        let indentLevel = 0;
        let i = 0;
        let inSelectList = false;
        let inCaseStatement = false;
        let caseIndentLevel = 0;
        let needsNewLine = false;
        let lastTokenWasKeyword = false;

        while (i < tokens.length) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];
            const prevToken = tokens[i - 1];

            // Handle comments
            if (token.type === 'comment') {
                if (needsNewLine) {
                    formatted += '\n' + this.getIndent(indentLevel);
                    needsNewLine = false;
                }
                formatted += token.value;
                if (token.value.startsWith('--')) {
                    formatted += '\n' + this.getIndent(indentLevel);
                }
                i++;
                continue;
            }

            // Handle keywords
            if (token.type === 'keyword') {
                const keyword = token.value;
                const formattedKeyword = this.formatKeyword(keyword);

                // SELECT starts a select list
                if (keyword === 'SELECT') {
                    if (needsNewLine || formatted.trim().length > 0) {
                        formatted += '\n' + this.getIndent(indentLevel);
                    }
                    formatted += formattedKeyword;
                    inSelectList = true;
                    needsNewLine = this.options.expandCommaLists;
                    if (needsNewLine) indentLevel++;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // FROM ends select list
                if (keyword === 'FROM') {
                    if (inSelectList) {
                        inSelectList = false;
                        if (this.options.expandCommaLists) indentLevel--;
                    }
                    formatted += '\n' + this.getIndent(indentLevel);
                    formatted += formattedKeyword;
                    lastTokenWasKeyword = true;
                    needsNewLine = false;
                    i++;
                    continue;
                }

                // WHERE, GROUP BY, HAVING, ORDER BY
                if (keyword === 'WHERE' || keyword === 'GROUP' || keyword === 'HAVING' || keyword === 'ORDER') {
                    formatted += '\n' + this.getIndent(indentLevel);
                    formatted += formattedKeyword;

                    // Check for BY after GROUP/ORDER
                    if ((keyword === 'GROUP' || keyword === 'ORDER') && nextToken && nextToken.value === 'BY') {
                        formatted += ' ' + this.formatKeyword(nextToken.value);
                        i += 2;
                    } else {
                        i++;
                    }
                    lastTokenWasKeyword = true;
                    needsNewLine = false;
                    continue;
                }

                // JOIN clauses
                if (keyword === 'JOIN' || (keyword === 'INNER' || keyword === 'LEFT' || keyword === 'RIGHT' ||
                    keyword === 'FULL' || keyword === 'CROSS') && nextToken && nextToken.value === 'JOIN') {

                    formatted += '\n' + this.getIndent(indentLevel);

                    if (keyword !== 'JOIN') {
                        formatted += formattedKeyword + ' ' + this.formatKeyword(nextToken.value);
                        i += 2;
                    } else {
                        formatted += formattedKeyword;
                        i++;
                    }
                    lastTokenWasKeyword = true;
                    needsNewLine = false;
                    continue;
                }

                // ON clause for joins
                if (keyword === 'ON') {
                    formatted += '\n' + this.getIndent(indentLevel + 1);
                    formatted += formattedKeyword;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // AND/OR in WHERE/ON clauses
                if ((keyword === 'AND' || keyword === 'OR') && this.options.expandBooleanExpr) {
                    const currentIndent = inSelectList ? indentLevel : indentLevel + 1;
                    formatted += '\n' + this.getIndent(currentIndent);
                    formatted += formattedKeyword;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // CASE statement
                if (keyword === 'CASE' && this.options.expandCaseStatements) {
                    if (inSelectList && needsNewLine) {
                        formatted += '\n' + this.getIndent(indentLevel);
                        needsNewLine = false;
                    }
                    formatted += formattedKeyword;
                    inCaseStatement = true;
                    caseIndentLevel = indentLevel;
                    indentLevel++;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // WHEN in CASE
                if (keyword === 'WHEN' && inCaseStatement && this.options.expandCaseStatements) {
                    formatted += '\n' + this.getIndent(indentLevel);
                    formatted += formattedKeyword;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // THEN in CASE
                if (keyword === 'THEN' && inCaseStatement && this.options.expandCaseStatements) {
                    formatted += ' ' + formattedKeyword;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // ELSE in CASE
                if (keyword === 'ELSE' && inCaseStatement && this.options.expandCaseStatements) {
                    formatted += '\n' + this.getIndent(indentLevel);
                    formatted += formattedKeyword;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // END in CASE
                if (keyword === 'END' && inCaseStatement && this.options.expandCaseStatements) {
                    indentLevel--;
                    formatted += '\n' + this.getIndent(indentLevel);
                    formatted += formattedKeyword;
                    inCaseStatement = false;
                    lastTokenWasKeyword = true;
                    i++;
                    continue;
                }

                // Default keyword handling
                if (lastTokenWasKeyword) {
                    formatted += ' ' + formattedKeyword;
                } else {
                    formatted += ' ' + formattedKeyword;
                }
                lastTokenWasKeyword = true;
                i++;
                continue;
            }

            // Handle commas in SELECT lists
            if (token.type === 'operator' && token.value === ',') {
                if (this.options.commaPosition === 'before') {
                    if (inSelectList && this.options.expandCommaLists) {
                        formatted += '\n' + this.getIndent(indentLevel) + ',';
                    } else {
                        formatted += ' ,';
                    }
                } else if (this.options.commaPosition === 'spaced') {
                    if (inSelectList && this.options.expandCommaLists) {
                        formatted += '\n' + this.getIndent(indentLevel - 1) + ',';
                    } else {
                        formatted += ' ,';
                    }
                } else {
                    // after (default)
                    formatted += ',';
                    if (inSelectList && this.options.expandCommaLists) {
                        needsNewLine = true;
                    }
                }
                lastTokenWasKeyword = false;
                i++;
                continue;
            }

            // Handle other tokens
            if (needsNewLine) {
                formatted += '\n' + this.getIndent(indentLevel);
                needsNewLine = false;
            }

            // Determine if we need a space before this token
            let needsSpaceBefore = false;
            if (formatted.length > 0 && !formatted.endsWith(' ') && !formatted.endsWith('\n')) {
                const lastChar = formatted[formatted.length - 1];

                // Need space after keyword
                if (lastTokenWasKeyword && token.type !== 'operator') {
                    needsSpaceBefore = true;
                }
                // Need space before string, number, identifier, function (except after dot or open paren)
                else if ((token.type === 'string' || token.type === 'number' ||
                          token.type === 'identifier' || token.type === 'function') &&
                         lastChar !== '.' && lastChar !== '(') {
                    needsSpaceBefore = true;
                }
                // Need space before dot if previous was operator (except closing paren)
                else if (token.type === 'operator' && token.value === '.' && lastChar === ')') {
                    needsSpaceBefore = false;
                }
                // No space before dot after identifier/keyword
                else if (token.type === 'operator' && token.value === '.') {
                    needsSpaceBefore = false;
                }
                // No space after dot
                else if (lastChar === '.') {
                    needsSpaceBefore = false;
                }
            }

            if (needsSpaceBefore) {
                formatted += ' ';
            }

            // Add the token value
            if (token.type === 'string') {
                formatted += token.value;
            } else if (token.type === 'number') {
                formatted += token.value;
            } else if (token.type === 'identifier') {
                formatted += token.value;
            } else if (token.type === 'function') {
                formatted += this.formatKeyword(token.value);
            } else if (token.type === 'operator') {
                if (token.value === '(' || token.value === ')') {
                    formatted += token.value;
                } else if (token.value === ';') {
                    formatted += token.value;
                } else if (token.value === '.') {
                    formatted += token.value;
                } else {
                    // Add spaces around operators like =, <, >, etc.
                    const prevChar = formatted[formatted.length - 1];
                    if (prevChar && prevChar !== ' ' && prevChar !== '\n') {
                        formatted += ' ';
                    }
                    formatted += token.value;
                    // Space after operator will be handled by next token's needsSpaceBefore logic
                    formatted += ' ';
                }
            } else {
                formatted += token.value;
            }

            lastTokenWasKeyword = false;
            i++;
        }

        return formatted.trim();
    }

    /**
     * Minify SQL - remove unnecessary whitespace and comments
     */
    minify(sql) {
        const tokens = this.tokenize(sql);
        let minified = '';
        let lastTokenType = null;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Skip comments
            if (token.type === 'comment') {
                continue;
            }

            // Add space between tokens when needed
            const needsSpace = lastTokenType &&
                              (lastTokenType === 'keyword' || lastTokenType === 'identifier' ||
                               lastTokenType === 'function' || lastTokenType === 'number') &&
                              (token.type === 'keyword' || token.type === 'identifier' ||
                               token.type === 'function' || token.type === 'number');

            if (needsSpace && minified.length > 0) {
                minified += ' ';
            }

            // Add token
            if (token.type === 'keyword' || token.type === 'function') {
                minified += token.value.toUpperCase();
            } else {
                minified += token.value;
            }

            lastTokenType = token.type;
        }

        return minified;
    }

    /**
     * Generate syntax highlighted HTML
     */
    highlightSyntax(sql, formatted = true) {
        const tokens = this.tokenize(sql);
        let html = '';

        for (const token of tokens) {
            let className = '';
            let value = token.value;

            switch (token.type) {
                case 'keyword':
                    className = 'sql-keyword';
                    value = formatted ? this.formatKeyword(value) : value.toUpperCase();
                    break;
                case 'function':
                    className = 'sql-function';
                    value = formatted ? this.formatKeyword(value) : value.toUpperCase();
                    break;
                case 'string':
                    className = 'sql-string';
                    break;
                case 'comment':
                    className = 'sql-comment';
                    break;
                case 'number':
                    className = 'sql-number';
                    break;
                case 'operator':
                    className = 'sql-operator';
                    break;
                case 'identifier':
                    className = 'sql-identifier';
                    break;
                default:
                    className = '';
            }

            if (className) {
                html += `<span class="${className}">${this.escapeHtml(value)}</span>`;
            } else {
                html += this.escapeHtml(value);
            }
        }

        return html;
    }

    /**
     * Format and highlight SQL
     */
    formatAndHighlight(sql) {
        const formatted = this.format(sql);
        const highlighted = this.highlightSyntax(formatted, true);
        return { formatted, highlighted };
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate styled HTML for copying (Poor SQL style)
     */
    generateStyledHtml(sql) {
        const formatted = this.format(sql);
        const highlighted = this.highlightSyntax(formatted, true);

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style type="text/css">
.SQLCode {
    font-size: 13px;
    font-weight: bold;
    font-family: 'Consolas', 'Courier New', monospace;
    white-space: pre;
    color: #000000;
}
.sql-comment {
    color: #00AA00;
}
.sql-string {
    color: #AA0000;
}
.sql-function {
    color: #AA00AA;
}
.sql-keyword {
    color: #0000AA;
}
.sql-operator {
    color: #777777;
}
.sql-number {
    color: #000000;
}
.sql-identifier {
    color: #000000;
}
</style>
</head>
<body>
<pre class="SQLCode">${highlighted}</pre>
</body>
</html>`;
    }
}

// Export for use in popup.js
window.SQLFormatter = SQLFormatter;
