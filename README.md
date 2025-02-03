# TaskMind - Chrome Extension

A powerful Chrome extension that helps you manage tasks, take notes, and interact with AI while browsing the web. Perfect for organizing your webpage-specific tasks and notes.

## Features

- 📋 Kanban-style task management
- 📝 Markdown-supported note-taking
- 🤖 AI-powered task and note enhancement
- 📊 Website-specific analytics dashboard
- 💬 AI chat interface for task and note queries
- 🔍 Smart search across tasks and notes
- 🎯 Task deadline tracking
- 📈 Progress analytics
- 🔄 Draggable floating icon

## Installation Guide

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shaik-mohd-huzaifa/TaskMind.git
   cd TaskMind
   ```

2. **Configure OpenAI API Key**
   - Open `llm-service.js`
   - Locate the `LLMService` class constructor
   - Replace the `apiKey` with your OpenAI API key:
   ```javascript
   class LLMService {
       constructor() {
           this.apiKey = 'your-openai-api-key-here';
           // ... other configurations
       }
   }
   ```

3. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the TaskMind directory

### Usage

1. **Access the Extension**
   - Click the extension icon in the Chrome toolbar
   - Use the keyboard shortcut `Ctrl+Shift+T` (or `Cmd+Shift+T` on Mac)
   - Use the draggable floating icon on any webpage

2. **Task Management**
   - Create tasks with `+ Add New Task`
   - Drag tasks between To Do, In Progress, and Done columns
   - Click tasks to edit details
   - Use AI enhancement for task descriptions

3. **Note Taking**
   - Switch to Notes view
   - Create new notes with markdown support
   - Use AI to enhance note content
   - Preview notes in rendered markdown

4. **Dashboard**
   - View analytics for the current website
   - Track task completion rates
   - Monitor page visits
   - See note statistics

5. **AI Chat**
   - Ask questions about your tasks and notes
   - Get AI-powered suggestions
   - Search through your content

## API Key Setup

1. **Get OpenAI API Key**
   - Visit [OpenAI's website](https://platform.openai.com/)
   - Create an account or log in
   - Navigate to API section
   - Generate a new API key

2. **Configure the Extension**
   - Locate `llm-service.js` in the extension directory
   - Find the `LLMService` class constructor
   - Replace the `apiKey` with your actual OpenAI API key
   - Save the file
   - Reload the extension in Chrome

## Security Note

⚠️ Never commit your API key to version control. Consider using environment variables or a secure configuration method for production deployments.

## Development

### Project Structure
```
TaskMind/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup interface
├── content.js          # Content script for web page interaction
├── background.js       # Background script
├── llm-service.js      # AI service configuration
├── content.css         # Content styles
├── styles.css          # Popup styles
└── icons/              # Extension icons
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify for your own projects!

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/Shaik-mohd-huzaifa/TaskMind/issues) section
2. Create a new issue with detailed information
3. Join our community discussions 