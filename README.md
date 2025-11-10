# SQL Formatter & Beautifier - Chrome Extension

A free and open-source SQL formatter Chrome extension for all major databases. Format SQL queries with syntax highlighting and multiple customization options.

## Features

- ✨ **Format SQL** with proper indentation and line breaks
- 🎨 **Syntax Highlighting** with colors for keywords, strings, comments, etc.
- 🗜️ **Minify SQL** to remove whitespace and comments
- 📋 **Copy as HTML** with syntax highlighting for Word/Outlook
- ⚙️ **Customizable Options**:
  - Indentation type (2 spaces, 4 spaces, tabs)
  - Keyword case (UPPERCASE, lowercase, ProperCase)
  - Comma position (before, after, spaced)
  - Expand comma lists (each column on new line)
  - Expand boolean expressions (AND/OR on new line)
  - Expand CASE statements
- 💾 **Auto-save** your last input
- 🔒 **100% Private** - all processing done locally, no data sent anywhere

## Installation

1. Download or clone this repository
2. Add icon files to the `icons/` folder (see ICONS-README.txt)
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top-right corner)
5. Click "Load unpacked"
6. Select the `sql-formatter-chrome-extension` folder

## Usage

1. Click the extension icon in Chrome toolbar
2. Paste your SQL query into the input area
3. Adjust formatting options if needed
4. Click "Format SQL" to format with proper indentation
5. Or click "Minify SQL" to compress the query
6. Copy the result:
   - "Copy Plain Text" - copies formatted SQL as text
   - "Copy as HTML" - copies with syntax highlighting for Word/Outlook

## Keyboard Shortcuts

- `Ctrl+Enter` - Format SQL
- `Ctrl+Shift+Enter` - Minify SQL

## Examples

### Input SQL:
```sql
SELECT i.item_number AS "Item Number", i.item_descrip1 AS "Description", c.classcode_code AS "Class Code" FROM public.item i LEFT JOIN public.classcode c ON i.item_classcode_id = c.classcode_id WHERE i.item_active = TRUE ORDER BY i.item_number;
```

### Formatted Output:
```sql
SELECT i.item_number AS "Item Number",
    i.item_descrip1 AS "Description",
    c.classcode_code AS "Class Code"
FROM public.item i
LEFT JOIN public.classcode c
    ON i.item_classcode_id = c.classcode_id
WHERE i.item_active = TRUE
ORDER BY i.item_number;
```

## Supported SQL Dialects

- PostgreSQL
- MySQL
- SQL Server (T-SQL)
- Oracle
- SQLite
- Most standard SQL

## Inspired By

This extension is inspired by [Poor Man's T-SQL Formatter](http://architectshack.com/PoorMansTSqlFormatter.ashx) by Tao Klerks, which is an excellent free SQL formatting tool.

## License

MIT License - Free to use and modify

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## Privacy

This extension does NOT:
- Send your SQL queries anywhere
- Track your usage
- Require any external connections
- Store your data on any server

All formatting is done locally in your browser.

## Author

Created by **jibaroenlaluna** 🌙
Website: [www.jibaroenlaluna.com](https://www.jibaroenlaluna.com)

Made with ❤️ in Puerto Rico 🇵🇷

## Support

If you find this extension useful, please:
- ⭐ Star this repository
- 🐛 Report bugs or request features in Issues
- 🔗 Share it with other database developers

## Other Projects

Check out my other Chrome extensions:
- [Jibaro Rich Text Converter](https://github.com/jibaroenlaluna/jibaro-chrome-extension) - Convert Markdown to Rich HTML for Word/Outlook
