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
