// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Website Task Manager installed');
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-kanban') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle-kanban' });
        });
    }
});

// You can add more background functionality here in the future
// Such as notifications, task reminders, etc. 