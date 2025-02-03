# TaskMind

TaskMind is an intelligent Chrome extension designed to revolutionize how you manage tasks and take notes while browsing the web. It provides a seamless, website-specific task management system that helps you stay organized and productive.

## What is TaskMind?

TaskMind integrates directly into your browsing experience, offering a floating, draggable interface that can be accessed on any webpage. The extension creates a dedicated workspace for each website you visit, allowing you to:

- **Organize Tasks**: Create and manage website-specific tasks using a Kanban-style board with To Do, In Progress, and Done columns
- **Take Smart Notes**: Capture important information with markdown support and AI-powered content enhancement
- **Track Progress**: Monitor your productivity with a comprehensive analytics dashboard
- **Chat with AI**: Get intelligent assistance for your tasks and notes through natural conversation
- **Stay Focused**: Keep track of deadlines and important tasks with a persistent, unobtrusive floating icon

## Why TaskMind?

- 🎯 **Website Context**: All tasks and notes are organized by website, making it easy to manage site-specific activities
- 🤖 **AI-Powered**: Leverage OpenAI's technology to enhance task descriptions and note content
- 📊 **Analytics**: Gain insights into your task completion rates and website engagement
- 💻 **User-Friendly**: Intuitive drag-and-drop interface with modern design
- 🔒 **Privacy-Focused**: Your data is stored locally in Chrome's storage

Whether you're researching, working on projects, or just trying to stay organized while browsing, TaskMind provides the tools you need to manage your online tasks effectively.

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