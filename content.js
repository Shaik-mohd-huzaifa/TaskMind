let kanbanContainer = null;
let draggedTask = null;
let floatingIcon = null;

// Create floating icon
function createFloatingIcon() {
    if (floatingIcon) return floatingIcon;

    floatingIcon = document.createElement('div');
    floatingIcon.id = 'task-manager-floating-icon';
    floatingIcon.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: #4F46E5;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    `;
    
    floatingIcon.innerHTML = `
        <div class="icon-wrapper" style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            color: white;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.684 1.657A4.505 4.505 0 0018.75 7.5H5.25z"/>
            </svg>
        </div>
        <div class="task-count" style="
            position: absolute;
            top: -5px;
            right: -5px;
            background: #EF4444;
            color: white;
            border-radius: 12px;
            padding: 2px 6px;
            font-size: 12px;
            font-weight: 600;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        ">0</div>
    `;

    // Add hover effect
    floatingIcon.addEventListener('mouseenter', () => {
        floatingIcon.style.transform = 'scale(1.1)';
        floatingIcon.style.boxShadow = '0 8px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)';
    });

    floatingIcon.addEventListener('mouseleave', () => {
        floatingIcon.style.transform = 'scale(1)';
        floatingIcon.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    });

    document.body.appendChild(floatingIcon);
    
    // Simplified click handler
    floatingIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleKanban();
    });
    
    return floatingIcon;
}

// Update task count in floating icon
function updateTaskCount() {
    const currentUrl = window.location.hostname;
    chrome.storage.sync.get([currentUrl], (result) => {
        const tasks = result[currentUrl] || [];
        const pendingTasks = tasks.filter(task => !task.completed).length;
        const taskCount = floatingIcon.querySelector('.task-count');
        
        if (pendingTasks > 0) {
            taskCount.style.opacity = '1';
            taskCount.textContent = pendingTasks;
        } else {
            taskCount.style.opacity = '0';
        }
    });
}

// Create empty state for Kanban board
function createEmptyState() {
    return `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <button class="create-first-task">Create Task</button>
        </div>
    `;
}

// Create Kanban board container
function createKanbanBoard() {
    if (kanbanContainer) {
        return kanbanContainer;
    }

    kanbanContainer = document.createElement('div');
    kanbanContainer.id = 'task-manager-kanban';
    kanbanContainer.className = 'task-manager-kanban';
    
    const header = document.createElement('div');
    header.className = 'kanban-header';
    header.innerHTML = `
        <div class="header-content">
            <nav class="board-nav">
                <button class="nav-item" data-view="dashboard">Dashboard</button>
                <button class="nav-item active" data-view="kanban">Task Board</button>
                <button class="nav-item" data-view="notes">Notes</button>
                <button class="nav-item" data-view="chat">Chat</button>
            </nav>
        </div>
        <button class="close-kanban">×</button>
    `;

    const viewsContainer = document.createElement('div');
    viewsContainer.className = 'views-container';
    viewsContainer.innerHTML = `
        <div class="view-content kanban-view active">
            <div class="kanban-content">
                <div class="kanban-columns">
                    <div class="kanban-column" data-column="todo">
                        <div class="column-header">
                            To Do
                            <span class="task-counter">0</span>
                        </div>
                        <div class="task-list" data-column="todo"></div>
                    </div>
                    <div class="kanban-column" data-column="in-progress">
                        <div class="column-header">
                            In Progress
                            <span class="task-counter">0</span>
                        </div>
                        <div class="task-list" data-column="in-progress"></div>
                    </div>
                    <div class="kanban-column" data-column="done">
                        <div class="column-header">
                            Done
                            <span class="task-counter">0</span>
                        </div>
                        <div class="task-list" data-column="done"></div>
                    </div>
                </div>
                <div class="add-task-container">
                    <button id="add-task-button">+ Add New Task</button>
                </div>
            </div>
        </div>
        <div class="view-content dashboard-view">
            <div class="dashboard-content">
                <h3>Dashboard Coming Soon</h3>
                <p>Task analytics and insights will be available here.</p>
            </div>
        </div>
        <div class="view-content notes-view">
            <div class="notes-content">
                <div class="notes-header">
                    <h3>Notes</h3>
                    <button class="add-note-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Add Note
                    </button>
                </div>
                <div class="notes-grid"></div>
            </div>
        </div>
        <div class="view-content chat-view">
            <div class="chat-interface">
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-message system">
                        Hi! I can help you manage your tasks. Ask me anything about your tasks or websites.
                    </div>
                </div>
                <div class="chat-input-container">
                    <textarea 
                        id="chat-input" 
                        placeholder="Ask about your tasks (e.g., 'Show me tasks about videos')"
                        rows="1"
                    ></textarea>
                    <button id="send-message">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    kanbanContainer.appendChild(header);
    kanbanContainer.appendChild(viewsContainer);
    document.body.appendChild(kanbanContainer);

    // Create task modal if it doesn't exist
    if (!document.getElementById('task-modal')) {
        const taskModal = document.createElement('div');
        taskModal.id = 'task-modal';
        taskModal.className = 'task-modal hidden';
        taskModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Task Details</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="task-title">Title</label>
                        <input type="text" id="task-title" placeholder="Enter task title">
                    </div>
                    <div class="form-group">
                        <label for="task-deadline">Deadline</label>
                        <input type="datetime-local" id="task-deadline">
                    </div>
                    <div class="form-group">
                        <label for="task-description">Description</label>
                        <div class="description-container">
                            <textarea id="task-description" placeholder="Enter task description"></textarea>
                            <button class="ai-enhance" title="Enhance with AI">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ai-icon">
                                    <path d="M12.98 3L21 6.764v9.322l-3.375-1.459v-6.41L12.98 5.764l-4.645 2.453v6.41L5 16.087V6.764L12.98 3zM8.855 16.898L12.98 19l8.02-3.764v-3.361l-8.02 3.764-4.125-2.102v2.361zm-3.375 1.459L12.98 22l8.02-3.764v-3.361l-8.02 3.764-4.125-2.102v2.361z"/>
                                </svg>
                                <span class="ai-text">AI</span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="task-url">URL</label>
                        <input type="text" id="task-url" value="${window.location.href}" readonly>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-task">Cancel</button>
                    <button class="save-task">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(taskModal);
    }

    // Update the note modal HTML in createKanbanBoard function
    if (!document.getElementById('note-modal')) {
        const noteModal = document.createElement('div');
        noteModal.id = 'note-modal';
        noteModal.className = 'note-modal hidden';
        noteModal.innerHTML = `
            <div class="note-modal-content">
                <div class="modal-header">
                    <h3>Note</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="note-editor">
                    <div class="editor-toolbar">
                        <button class="ai-enhance" title="Enhance with AI">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ai-icon">
                                <path d="M12.98 3L21 6.764v9.322l-3.375-1.459v-6.41L12.98 5.764l-4.645 2.453v6.41L5 16.087V6.764L12.98 3zM8.855 16.898L12.98 19l8.02-3.764v-3.361l-8.02 3.764-4.125-2.102v2.361zm-3.375 1.459L12.98 22l8.02-3.764v-3.361l-8.02 3.764-4.125-2.102v2.361z"/>
                            </svg>
                            <span class="ai-text">AI</span>
                        </button>
                        <div class="preview-toggle">
                            <button class="toggle-preview" data-mode="edit">Preview</button>
                        </div>
                    </div>
                    <div class="editor-container">
                        <textarea id="note-content" placeholder="# Your Note Title
Write your note content here using markdown..."></textarea>
                        <div class="markdown-preview hidden"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-task">Cancel</button>
                    <button class="save-task">Save Note</button>
                </div>
            </div>
        `;
        document.body.appendChild(noteModal);
    }

    // Hide initially after creation
    kanbanContainer.classList.add('hidden');
    
    setupEventListeners();
    setupDragAndDrop();
    return kanbanContainer;
}

// Create task element
function createTaskElement(task, index) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.draggable = true;
    taskElement.dataset.taskId = index;
    
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadline && deadline < new Date();
    
    taskElement.innerHTML = `
        <div class="task-content">
            <div class="task-header">
                <span class="task-title">${task.title || 'Untitled Task'}</span>
                ${deadline ? `<span class="task-deadline ${isOverdue ? 'overdue' : ''}">${deadline.toLocaleDateString()}</span>` : ''}
            </div>
            <div class="task-preview">
                <p class="task-description-preview">${task.description ? task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '') : 'No description'}</p>
            </div>
            <div class="task-actions">
                <button class="edit-task" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="edit-icon">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                </button>
                <button class="delete-task" data-index="${index}">×</button>
            </div>
        </div>
    `;

    // Add click event to show task details
    taskElement.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-task') && !e.target.closest('.edit-task')) {
            showTaskDetails(task, index);
        }
    });

    // Add delete functionality
    taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(index);
    });

    // Add edit functionality
    taskElement.querySelector('.edit-task').addEventListener('click', (e) => {
        e.stopPropagation();
        showTaskDetails(task, index);
    });

    return taskElement;
}

// Show task details in modal
function showTaskDetails(task, index = null) {
    const modal = document.getElementById('task-modal');
    const titleInput = modal.querySelector('#task-title');
    const deadlineInput = modal.querySelector('#task-deadline');
    const descriptionInput = modal.querySelector('#task-description');
    const urlInput = modal.querySelector('#task-url');

    titleInput.value = task?.title || '';
    // Format deadline to show only date
    if (task?.deadline) {
        const date = new Date(task.deadline);
        const formattedDate = date.toISOString().split('T')[0];
        deadlineInput.value = formattedDate;
    } else {
        deadlineInput.value = '';
    }
    descriptionInput.value = task?.description || '';
    urlInput.value = task?.url || window.location.href;

    modal.classList.remove('hidden');
    modal.dataset.editIndex = index !== null ? index : '';

    // Focus on title input
    titleInput.focus();
}

// Enhance description with AI
async function enhanceDescription(description) {
    return await window.llmService.enhanceDescription(description);
}

// Load and render tasks with error handling
function loadTasks() {
    const currentUrl = window.location.hostname;
    
    chrome.storage.sync.get([currentUrl], (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading tasks:', chrome.runtime.lastError);
            renderTasks([]); // Render empty state on error
            return;
        }
        
        const tasks = result[currentUrl] || [];
        renderTasks(tasks);
    });
}

// Render tasks in columns
function renderTasks(tasks) {
    const kanbanView = kanbanContainer.querySelector('.kanban-view');
    
    if (tasks.length === 0) {
        kanbanView.innerHTML = createEmptyState();
        const createButton = kanbanView.querySelector('.create-first-task');
        createButton.addEventListener('click', () => {
            showTaskDetails();
        });
        return;
    }

    // Make sure we have the kanban structure
    if (!kanbanView.querySelector('.kanban-content')) {
        kanbanView.innerHTML = `
            <div class="kanban-content">
                <div class="kanban-columns">
                    <div class="kanban-column" data-column="todo">
                        <div class="column-header">
                            To Do
                            <span class="task-counter">0</span>
                        </div>
                        <div class="task-list" data-column="todo"></div>
                    </div>
                    <div class="kanban-column" data-column="in-progress">
                        <div class="column-header">
                            In Progress
                            <span class="task-counter">0</span>
                        </div>
                        <div class="task-list" data-column="in-progress"></div>
                    </div>
                    <div class="kanban-column" data-column="done">
                        <div class="column-header">
                            Done
                            <span class="task-counter">0</span>
                        </div>
                        <div class="task-list" data-column="done"></div>
                    </div>
                </div>
                <div class="add-task-container">
                    <button id="add-task-button">+ Add New Task</button>
                </div>
            </div>
        `;
        setupEventListeners();
        setupDragAndDrop();
    }

    const todoList = kanbanView.querySelector('[data-column="todo"] .task-list');
    const inProgressList = kanbanView.querySelector('[data-column="in-progress"] .task-list');
    const doneList = kanbanView.querySelector('[data-column="done"] .task-list');

    // Clear existing tasks
    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';

    // Count tasks for each column
    let todoCount = 0;
    let inProgressCount = 0;
    let doneCount = 0;

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        
        if (task.completed) {
            doneList.appendChild(taskElement);
            doneCount++;
        } else if (task.inProgress) {
            inProgressList.appendChild(taskElement);
            inProgressCount++;
        } else {
            todoList.appendChild(taskElement);
            todoCount++;
        }
    });

    // Update counters
    kanbanView.querySelector('[data-column="todo"] .task-counter').textContent = todoCount;
    kanbanView.querySelector('[data-column="in-progress"] .task-counter').textContent = inProgressCount;
    kanbanView.querySelector('[data-column="done"] .task-counter').textContent = doneCount;

    // Update floating icon count
    updateTaskCount();
}

// Add or update task
function saveTask(taskData, index = null) {
    const currentUrl = window.location.hostname;
    
    withErrorHandling(callback => 
        chrome.storage.sync.get([currentUrl], callback), 
        { [currentUrl]: [] }
    ).then(result => {
        const tasks = result[currentUrl] || [];
        const task = {
            title: taskData.title,
            description: taskData.description,
            deadline: taskData.deadline ? new Date(taskData.deadline).toISOString().split('T')[0] : null,
            url: taskData.url,
            completed: index !== null ? tasks[index].completed : false,
            inProgress: index !== null ? tasks[index].inProgress : false
        };

        if (index !== null) {
            tasks[index] = task;
        } else {
            tasks.push(task);
            incrementTasksCreated();
        }

        withErrorHandling(callback => 
            chrome.storage.sync.set({ [currentUrl]: tasks }, callback)
        ).then(() => loadTasks());
    });
}

// Delete task
function deleteTask(index) {
    const currentUrl = window.location.hostname;
    
    withErrorHandling(callback => 
        chrome.storage.sync.get([currentUrl], callback), 
        { [currentUrl]: [] }
    ).then(result => {
        const tasks = result[currentUrl] || [];
        tasks.splice(index, 1);
        
        withErrorHandling(callback => 
            chrome.storage.sync.set({ [currentUrl]: tasks }, callback)
        ).then(() => loadTasks());
    });
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
    const currentUrl = window.location.hostname;
    
    withErrorHandling(callback => 
        chrome.storage.sync.get([currentUrl], callback), 
        { [currentUrl]: [] }
    ).then(result => {
        const tasks = result[currentUrl] || [];
        const index = parseInt(taskId);
        if (tasks[index]) {
            tasks[index].completed = newStatus === 'done';
            tasks[index].inProgress = newStatus === 'in-progress';
            
            withErrorHandling(callback => 
                chrome.storage.sync.set({ [currentUrl]: tasks }, callback)
            ).then(() => loadTasks());
        }
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const taskLists = kanbanContainer.querySelectorAll('.task-list');

    taskLists.forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                if (afterElement) {
                    list.insertBefore(draggable, afterElement);
                } else {
                    list.appendChild(draggable);
                }
            }
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = draggedTask.dataset.taskId;
            const newStatus = list.dataset.column;
            updateTaskStatus(taskId, newStatus);
        });
    });
}

// Helper function to get the element to insert after when dragging
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Setup event listeners
function setupEventListeners() {
    // Add new task button
    const addTaskButton = kanbanContainer.querySelector('#add-task-button');
    addTaskButton.addEventListener('click', () => {
        showTaskDetails();
    });

    // Modal events
    const modal = document.getElementById('task-modal');
    const closeModal = modal.querySelector('.close-modal');
    const cancelButton = modal.querySelector('.cancel-task');
    const saveButton = modal.querySelector('.save-task');
    const aiEnhanceButton = modal.querySelector('.ai-enhance');

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    cancelButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    saveButton.addEventListener('click', () => {
        const titleInput = modal.querySelector('#task-title');
        const deadlineInput = modal.querySelector('#task-deadline');
        const descriptionInput = modal.querySelector('#task-description');
        const urlInput = modal.querySelector('#task-url');

        const taskData = {
            title: titleInput.value.trim(),
            deadline: deadlineInput.value,
            description: descriptionInput.value.trim(),
            url: urlInput.value
        };

        if (taskData.title) {
            const editIndex = modal.dataset.editIndex;
            saveTask(taskData, editIndex === '' ? null : parseInt(editIndex));
            modal.classList.add('hidden');
        }
    });

    aiEnhanceButton.addEventListener('click', async () => {
        const descriptionInput = modal.querySelector('#task-description');
        const enhancedDescription = await enhanceDescription(descriptionInput.value);
        descriptionInput.value = enhancedDescription;
    });

    // Close Kanban board
    const closeButton = kanbanContainer.querySelector('.close-kanban');
    closeButton.addEventListener('click', () => {
        kanbanContainer.classList.add('hidden');
    });

    // Setup drag and drop events for tasks
    kanbanContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            draggedTask = e.target;
            e.target.classList.add('dragging');
        }
    });

    kanbanContainer.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.classList.remove('dragging');
            draggedTask = null;
        }
    });

    // Listen for keyboard shortcut
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'toggle-kanban') {
            toggleKanban();
        }
    });

    // Navigation tabs
    const navItems = kanbanContainer.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items and views
            navItems.forEach(nav => nav.classList.remove('active'));
            kanbanContainer.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));
            
            // Add active class to clicked item and corresponding view
            item.classList.add('active');
            const viewName = item.dataset.view;
            kanbanContainer.querySelector(`.${viewName}-view`).classList.add('active');
            
            // Handle view change
            handleViewChange(viewName);
        });
    });

    // Chat functionality
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');

    function handleSendMessage() {
        const query = chatInput.value.trim();
        if (query) {
            handleChatQuery(query);
            chatInput.value = '';
        }
    }

    sendButton.addEventListener('click', handleSendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto-resize chat input
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
    });

    // Notes functionality
    const addNoteButton = kanbanContainer.querySelector('.add-note-button');
    if (addNoteButton) {
        addNoteButton.addEventListener('click', () => {
            showNoteModal();
        });
    }

    const noteModal = document.getElementById('note-modal');
    if (noteModal) {
        const closeNoteModal = noteModal.querySelector('.close-modal');
        const cancelButton = noteModal.querySelector('.cancel-task');
        const saveButton = noteModal.querySelector('.save-task');
        const aiEnhanceButton = noteModal.querySelector('.ai-enhance');
        const previewToggle = noteModal.querySelector('.toggle-preview');
        const contentInput = noteModal.querySelector('#note-content');
        const previewArea = noteModal.querySelector('.markdown-preview');

        closeNoteModal.addEventListener('click', () => {
            noteModal.classList.add('hidden');
        });

        cancelButton.addEventListener('click', () => {
            noteModal.classList.add('hidden');
        });

        saveButton.addEventListener('click', () => {
            const content = contentInput.value.trim();
            if (content) {
                const editIndex = noteModal.dataset.editIndex;
                if (editIndex) {
                    updateNote(editIndex, content);
                } else {
                    saveNote(content);
                }
                noteModal.classList.add('hidden');
                loadNotes(); // Refresh the notes grid
            }
        });

        aiEnhanceButton.addEventListener('click', async () => {
            const content = contentInput.value;
            const enhancedContent = await enhanceNote(content);
            contentInput.value = enhancedContent;
            updateMarkdownPreview(enhancedContent, previewArea);
        });

        previewToggle.addEventListener('click', () => {
            const isPreview = previewToggle.dataset.mode === 'edit';
            if (isPreview) {
                updateMarkdownPreview(contentInput.value, previewArea);
                contentInput.classList.add('hidden');
                previewArea.classList.remove('hidden');
                previewToggle.textContent = 'Edit';
                previewToggle.dataset.mode = 'preview';
            } else {
                contentInput.classList.remove('hidden');
                previewArea.classList.add('hidden');
                previewToggle.textContent = 'Preview';
                previewToggle.dataset.mode = 'edit';
            }
        });

        contentInput.addEventListener('input', () => {
            if (previewToggle.dataset.mode === 'preview') {
                updateMarkdownPreview(contentInput.value, previewArea);
            }
        });
    }

    // Add click event to note cards
    const notesGrid = document.querySelector('.notes-grid');
    if (notesGrid) {
        notesGrid.addEventListener('click', (e) => {
            const noteCard = e.target.closest('.note-card');
            if (noteCard) {
                const noteId = noteCard.dataset.noteId;
                const currentUrl = window.location.hostname;
                chrome.storage.sync.get([`${currentUrl}_notes`], (result) => {
                    const notes = result[`${currentUrl}_notes`] || [];
                    const note = notes.find(n => n.id === noteId);
                    if (note) {
                        showNoteModal(note);
                    }
                });
            }
        });
    }
}

// Toggle Kanban board visibility
function toggleKanban(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (!kanbanContainer) {
        createKanbanBoard();
    }
    
    const isHidden = kanbanContainer.classList.contains('hidden');
    
    if (isHidden) {
        kanbanContainer.classList.remove('hidden');
        kanbanContainer.style.display = 'flex';
        
        // Try to load tasks and notes, but don't reload if there's an error
        try {
            loadTasks();
            loadNotes();
        } catch (error) {
            console.error('Error loading content:', error);
        }
        
        // Update current view
        const activeView = kanbanContainer.querySelector('.nav-item.active');
        if (activeView) {
            handleViewChange(activeView.dataset.view);
        }
    } else {
        kanbanContainer.classList.add('hidden');
        kanbanContainer.style.display = 'none';
    }
}

// Update the initialization
function initialize() {
    createFloatingIcon();
    createKanbanBoard();
    updateTaskCount();
    trackPageVisit();
    loadNotes(); // Load notes on initialization
    
    // Add keyboard shortcut listener
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleKanban();
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Create task card for chat
function createTaskCard(task) {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const status = task.completed ? 'completed' : task.inProgress ? 'in-progress' : 'todo';
    const statusText = task.completed ? 'Completed' : task.inProgress ? 'In Progress' : 'To Do';
    
    return `
        <div class="chat-card task" data-task-id="${task.id}">
            <div class="chat-card-header">
                <div class="chat-card-title">${task.title || 'Untitled Task'}</div>
                <div class="chat-card-badge ${status}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                    </svg>
                    ${statusText}
                </div>
            </div>
            <div class="chat-card-content">
                ${task.description || 'No description'}
            </div>
            <div class="chat-card-footer">
                <div class="chat-card-meta">
                    ${deadline ? `
                        <div class="chat-card-date">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                            </svg>
                            ${deadline.toLocaleDateString()}
                        </div>
                    ` : ''}
                </div>
                <a href="${task.url}" class="chat-card-source" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" />
                    </svg>
                    View Source
                </a>
            </div>
        </div>
    `;
}

// Create note card for chat
function createNoteCard(note) {
    return `
        <div class="chat-card note" data-note-id="${note.id}">
            <div class="chat-card-header">
                <div class="chat-card-title">${note.title}</div>
                <div class="chat-card-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                    </svg>
                    Note
                </div>
            </div>
            <div class="chat-card-content">
                ${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}
            </div>
            <div class="chat-card-footer">
                <div class="chat-card-meta">
                    <div class="chat-card-date">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                        </svg>
                        ${new Date(note.created).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update addChatMessage function
function addChatMessage(message, type = 'user', tasks = null, notes = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    let messageContent = `<div class="message-text">${message}</div>`;
    
    // Add tasks if present
    if (tasks && tasks.length > 0) {
        messageContent += `
            <div class="chat-card-container">
                <div class="chat-cards-group">
                    <div class="chat-cards-header">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                        </svg>
                        Related Tasks
                    </div>
                    ${tasks.map(task => createTaskCard(task)).join('')}
                </div>
            </div>
        `;
    }
    
    // Add notes if present
    if (notes && notes.length > 0) {
        messageContent += `
            <div class="chat-card-container">
                <div class="chat-cards-group">
                    <div class="chat-cards-header">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clip-rule="evenodd"/>
                            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"/>
                        </svg>
                        Related Notes
                    </div>
                    ${notes.map(note => createNoteCard(note)).join('')}
                </div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = messageContent;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add click handlers for cards
    messageDiv.querySelectorAll('.chat-card.task').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {  // Don't trigger if clicking on the source link
                const taskId = card.dataset.taskId;
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    showTaskDetails(task);
                }
            }
        });
    });
    
    messageDiv.querySelectorAll('.chat-card.note').forEach(card => {
        card.addEventListener('click', () => {
            const noteId = card.dataset.noteId;
            const note = notes.find(n => n.id === noteId);
            if (note) {
                showNoteModal(note);
            }
        });
    });
}

// Add loading animation
function showLoadingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-loading';
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

// Create task widget HTML
function createTaskWidget(task) {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadline && deadline < new Date();
    
    return `
        <div class="task-widget">
            <div class="task-widget-header">
                <div class="task-widget-title">${task.title || 'Untitled Task'}</div>
                <div class="task-widget-status ${task.completed ? 'done' : task.inProgress ? 'in-progress' : 'todo'}">
                    ${task.completed ? 'Done' : task.inProgress ? 'In Progress' : 'To Do'}
                </div>
            </div>
            <div class="task-widget-description">
                ${task.description || 'No description'}
            </div>
            <div class="task-widget-footer">
                ${deadline ? `
                    <div class="task-widget-deadline ${isOverdue ? 'overdue' : ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                        </svg>
                        ${deadline.toLocaleDateString()}
                    </div>
                ` : ''}
                <a href="${task.url}" class="task-widget-url" target="_blank">View Website</a>
            </div>
        </div>
    `;
}

// Enhanced page content extraction
function getPageContent() {
    const title = document.title;
    const url = window.location.href;
    const domain = window.location.hostname;
    
    // Get meta information
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
    const author = document.querySelector('meta[name="author"]')?.content || '';
    
    // Get main content sections
    const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
    const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
    
    // Get main content
    const mainContent = (() => {
        // Try to get content from semantic elements first
        const article = document.querySelector('article')?.textContent;
        if (article) return article;
        
        const main = document.querySelector('main')?.textContent;
        if (main) return main;
        
        // If no semantic elements, try common content containers
        const content = document.querySelector('.content, .main-content, #content, #main-content')?.textContent;
        if (content) return content;
        
        // Fallback: get text from paragraphs
        const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim()).join(' ');
        if (paragraphs) return paragraphs;
        
        // Last resort: get body text
        return document.body.textContent;
    })().substring(0, 2000); // Limit content length
    
    // Get any code snippets
    const codeSnippets = Array.from(document.querySelectorAll('pre, code')).map(code => code.textContent).join('\n\n');
    
    // Get links
    const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => ({
            text: a.textContent.trim(),
            href: a.href
        }))
        .filter(link => link.text && !link.href.startsWith('javascript:'))
        .slice(0, 10); // Limit to 10 most relevant links

    return {
        url,
        domain,
        title,
        description,
        keywords,
        author,
        structure: {
            h1s,
            h2s,
            h3s
        },
        mainContent,
        codeSnippets: codeSnippets.length > 0 ? codeSnippets : null,
        links,
        timestamp: new Date().toISOString()
    };
}

// Add function to search notes
async function searchNotes(query) {
    return new Promise((resolve) => {
        const currentUrl = window.location.hostname;
        chrome.storage.sync.get([`${currentUrl}_notes`], (result) => {
            const notes = result[`${currentUrl}_notes`] || [];
            const relevantNotes = notes.filter(note => 
                note.title.toLowerCase().includes(query.toLowerCase()) ||
                note.content.toLowerCase().includes(query.toLowerCase())
            );
            resolve(relevantNotes);
        });
    });
}

// Update handleChatQuery function
async function handleChatQuery(query) {
    addChatMessage(query, 'user');
    const loadingIndicator = showLoadingIndicator();
    
    try {
        // Get all tasks for context
        const tasks = await getAllTasks();
        // Get relevant notes
        const relevantNotes = await searchNotes(query);
        // Get current page content
        const pageContent = getPageContent();
        
        // Determine if the query is related to the current page
        const isPageRelated = query.toLowerCase().includes('page') || 
                            query.toLowerCase().includes('website') ||
                            query.toLowerCase().includes('article') ||
                            query.toLowerCase().includes('content') ||
                            query.toLowerCase().includes('here');
        
        const systemPrompt = `You are a helpful task management assistant with access to:
            1. User's tasks: ${JSON.stringify(tasks)}
            2. User's notes: ${JSON.stringify(relevantNotes)}
            ${isPageRelated ? `3. Current webpage context: 
                - Title: ${pageContent.title}
                - Description: ${pageContent.description}
                - Main Content Summary: ${pageContent.mainContent.substring(0, 500)}...
                - Structure: ${JSON.stringify(pageContent.structure)}
                ${pageContent.codeSnippets ? `- Code Snippets: ${pageContent.codeSnippets}` : ''}
            ` : ''}

            When responding:
            1. Be concise and direct
            2. If the query is about the current page, use the webpage context to provide relevant information
            3. If asked about tasks, search through the tasks context
            4. If asked about notes, search through the notes context
            5. You can combine information from all sources to provide comprehensive answers
            6. If suggesting new tasks or notes, they should be relevant to the current context
            7. For code-related queries, reference any relevant code snippets from the page
            8. If no relevant information is found, say so clearly
            
            Current URL: ${pageContent.url}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.llmService.apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        loadingIndicator.remove();

        // Find relevant tasks and notes based on the response
        const relevantTasks = findRelevantTasks(tasks, query);
        
        // Create response HTML with tasks, notes, and page context
        addChatMessage(data.choices[0].message.content, 'assistant', relevantTasks, relevantNotes);
        
        // If the response suggests creating a task or note, show the appropriate modal
        const responseLower = data.choices[0].message.content.toLowerCase();
        if (responseLower.includes('create a task') || responseLower.includes('add a task')) {
            const suggestedTitle = pageContent.title;
            const suggestedDescription = pageContent.description || '';
            showTaskDetails({
                title: suggestedTitle,
                description: suggestedDescription,
                url: pageContent.url
            });
        } else if (responseLower.includes('create a note') || responseLower.includes('add a note')) {
            showNoteModal({
                content: `# ${pageContent.title}\n\n${pageContent.description}\n\nSource: ${pageContent.url}`
            });
        }
    } catch (error) {
        console.error('Error in chat:', error);
        loadingIndicator.remove();
        addChatMessage('Sorry, I encountered an error processing your request.', 'system');
    }
}

// Add function to create note widget
function createNoteWidget(note) {
    return `
        <div class="note-widget" data-note-id="${note.id}">
            <div class="note-widget-header">
                <div class="note-widget-title">${note.title}</div>
                <div class="note-widget-date">${new Date(note.created).toLocaleDateString()}</div>
            </div>
            <div class="note-widget-preview">
                ${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}
            </div>
        </div>
    `;
}

// Add these functions for notes functionality
function showNoteModal(note = null) {
    const modal = document.getElementById('note-modal');
    const contentInput = modal.querySelector('#note-content');
    const previewToggle = modal.querySelector('.toggle-preview');
    const previewArea = modal.querySelector('.markdown-preview');
    
    if (note) {
        contentInput.value = note.content;
        modal.dataset.editIndex = note.id;
        updateMarkdownPreview(note.content, previewArea);
    } else {
        contentInput.value = '';
        modal.dataset.editIndex = '';
        previewArea.innerHTML = '';
    }
    
    modal.classList.remove('hidden');
    contentInput.focus();
}

function saveNote(content) {
    const currentUrl = window.location.hostname;
    chrome.storage.sync.get([`${currentUrl}_notes`], (result) => {
        const notes = result[`${currentUrl}_notes`] || [];
        const lines = content.split('\n');
        let title = 'Untitled Note';
        
        // Extract title from first header in markdown
        for (const line of lines) {
            if (line.startsWith('# ')) {
                title = line.substring(2).trim();
                break;
            }
        }
        
        const note = {
            id: Date.now().toString(),
            title,
            content,
            created: new Date().toISOString()
        };
        
        notes.push(note);
        chrome.storage.sync.set({ [`${currentUrl}_notes`]: notes }, loadNotes);
    });
}

function loadNotes() {
    const currentUrl = window.location.hostname;
    chrome.storage.sync.get([`${currentUrl}_notes`], (result) => {
        const notes = result[`${currentUrl}_notes`] || [];
        renderNotes(notes);
    });
}

function renderNotes(notes) {
    const notesGrid = document.querySelector('.notes-grid');
    if (!notesGrid) return;
    
    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>No notes yet</h3>
                <p>Create your first note to get started</p>
            </div>
        `;
        return;
    }
    
    notesGrid.innerHTML = notes.map(note => `
        <div class="note-card" data-note-id="${note.id}">
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.content.split('\n')[0]}</div>
            <div class="note-footer">
                ${new Date(note.created).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

// Add function to enhance note with AI
async function enhanceNote(content) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.llmService.apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that enhances markdown notes. Improve the content while maintaining the original structure and markdown formatting. Make it more detailed and well-organized."
                    },
                    {
                        role: "user",
                        content: content
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error enhancing note:', error);
        return content;
    }
}

// Add function to update markdown preview
function updateMarkdownPreview(content, previewElement) {
    let html = content
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        // Bold and Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*\d+\.\s+(.*$)/gm, '<li class="ordered">$1</li>')
        .replace(/^\s*[\-\*]\s+(.*$)/gm, '<li class="unordered">$1</li>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Blockquotes
        .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Paragraphs
        .replace(/\n\n([^#\n].*)/g, '<p>$1</p>')
        // Line breaks
        .replace(/\n(?![<])/g, '<br>');

    // Process lists to add proper ul/ol wrappers
    html = html.replace(/<li class="unordered">.*?<\/li>(\s*<li class="unordered">.*?<\/li>)*/g, function(match) {
        return '<ul>' + match.replace(/class="unordered"/g, '') + '</ul>';
    });
    
    html = html.replace(/<li class="ordered">.*?<\/li>(\s*<li class="ordered">.*?<\/li>)*/g, function(match) {
        return '<ol>' + match.replace(/class="ordered"/g, '') + '</ol>';
    });

    previewElement.innerHTML = html;
}

// Add function to update existing note
function updateNote(noteId, content) {
    const currentUrl = window.location.hostname;
    chrome.storage.sync.get([`${currentUrl}_notes`], (result) => {
        const notes = result[`${currentUrl}_notes`] || [];
        const noteIndex = notes.findIndex(note => note.id === noteId);
        
        if (noteIndex !== -1) {
            const lines = content.split('\n');
            let title = 'Untitled Note';
            
            // Extract title from first header in markdown
            for (const line of lines) {
                if (line.startsWith('# ')) {
                    title = line.substring(2).trim();
                    break;
                }
            }
            
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                content,
                updated: new Date().toISOString()
            };
            
            chrome.storage.sync.set({ [`${currentUrl}_notes`]: notes }, loadNotes);
        }
    });
}

// Helper function to find relevant tasks based on query
function findRelevantTasks(allTasks, query) {
    const relevantTasks = [];
    const queryLower = query.toLowerCase();
    
    for (const [website, tasks] of Object.entries(allTasks)) {
        for (const task of tasks) {
            if (
                task.title?.toLowerCase().includes(queryLower) ||
                task.description?.toLowerCase().includes(queryLower)
            ) {
                relevantTasks.push({ ...task, website });
            }
        }
    }
    
    return relevantTasks;
}

// Get all tasks across all websites
async function getAllTasks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(null, (result) => {
            const allTasks = {};
            for (const [website, tasks] of Object.entries(result)) {
                if (Array.isArray(tasks)) {
                    allTasks[website] = tasks;
                }
            }
            resolve(allTasks);
        });
    });
}

// Add analytics tracking functions
function trackPageVisit() {
    const currentUrl = window.location.hostname;
    chrome.storage.sync.get([`${currentUrl}_analytics`], (result) => {
        let analytics = result[`${currentUrl}_analytics`] || {
            visits: 0,
            tasks_created: 0,
            last_visit: null,
            first_visit: null
        };
        
        analytics.visits++;
        analytics.last_visit = new Date().toISOString();
        if (!analytics.first_visit) {
            analytics.first_visit = new Date().toISOString();
        }
        
        chrome.storage.sync.set({ [`${currentUrl}_analytics`]: analytics });
    });
}

function incrementTasksCreated() {
    const currentUrl = window.location.hostname;
    chrome.storage.sync.get([`${currentUrl}_analytics`], (result) => {
        let analytics = result[`${currentUrl}_analytics`] || {
            visits: 0,
            tasks_created: 0,
            last_visit: null,
            first_visit: null
        };
        
        analytics.tasks_created++;
        chrome.storage.sync.set({ [`${currentUrl}_analytics`]: analytics });
    });
}

// Update dashboard content
function updateDashboardContent() {
    const dashboardView = document.querySelector('.dashboard-content');
    const currentUrl = window.location.hostname;
    
    chrome.storage.sync.get([currentUrl, `${currentUrl}_analytics`, `${currentUrl}_notes`], (result) => {
        const tasks = result[currentUrl] || [];
        const analytics = result[`${currentUrl}_analytics`] || {
            visits: 0,
            tasks_created: 0,
            last_visit: null,
            first_visit: null
        };
        const notes = result[`${currentUrl}_notes`] || [];
        
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
        const taskCreationRate = analytics.visits > 0 ? ((analytics.tasks_created / analytics.visits) * 100).toFixed(1) : 0;
        
        dashboardView.innerHTML = `
            <style>
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    padding: 20px;
                }
                
                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                
                .stat-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .stat-value {
                    font-size: 36px;
                    font-weight: 700;
                    color: #111827;
                    line-height: 1;
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }
                
                .stat-value.percentage::after {
                    content: '%';
                    font-size: 16px;
                    color: #6b7280;
                    font-weight: 500;
                }
                
                .stat-subtitle {
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.4;
                }
                
                .stat-card:nth-child(1) {
                    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                }
                
                .stat-card:nth-child(2) {
                    background: linear-gradient(135deg, #059669 0%, #10B981 100%);
                }
                
                .stat-card:nth-child(3) {
                    background: linear-gradient(135deg, #EA580C 0%, #F97316 100%);
                }
                
                .stat-card:nth-child(4) {
                    background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
                }
                
                .stat-card:nth-child(n) .stat-title,
                .stat-card:nth-child(n) .stat-value,
                .stat-card:nth-child(n) .stat-subtitle,
                .stat-card:nth-child(n) .stat-value.percentage::after {
                    color: white;
                }
                
                .stat-value-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .stat-icon {
                    width: 24px;
                    height: 24px;
                    opacity: 0.9;
                }
            </style>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-title">Page Visits</div>
                    <div class="stat-value-wrapper">
                        <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                        </svg>
                        <div class="stat-value">${analytics.visits}</div>
                    </div>
                    <div class="stat-subtitle">First visit: ${analytics.first_visit ? new Date(analytics.first_visit).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Task Creation Rate</div>
                    <div class="stat-value-wrapper">
                        <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7V8h-2v4H8l4 4 4-4h-2z"/>
                        </svg>
                        <div class="stat-value percentage">${taskCreationRate}</div>
                    </div>
                    <div class="stat-subtitle">${analytics.tasks_created} tasks created over ${analytics.visits} visits</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Task Completion Rate</div>
                    <div class="stat-value-wrapper">
                        <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7V8h-2v4H8l4 4 4-4h-2z"/>
                        </svg>
                        <div class="stat-value percentage">${completionRate}</div>
                    </div>
                    <div class="stat-subtitle">${completedTasks} of ${totalTasks} tasks completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Current Notes</div>
                    <div class="stat-value-wrapper">
                        <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7V8h-2v4H8l4 4 4-4h-2z"/>
                        </svg>
                        <div class="stat-value">${notes.length}</div>
                    </div>
                    <div class="stat-subtitle">Total notes for this website</div>
                </div>
            </div>
        `;
    });
}

// Add function to handle view changes
function handleViewChange(viewName) {
    if (viewName === 'dashboard') {
        updateDashboardContent();
    } else if (viewName === 'notes') {
        loadNotes();
    }
}

// Add message listener for opening dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'open-dashboard') {
        if (!kanbanContainer) {
            createKanbanBoard();
        }
        
        // Show the kanban board if it's hidden
        kanbanContainer.classList.remove('hidden');
        kanbanContainer.style.display = 'flex';
        
        // Switch to dashboard view
        const navItems = kanbanContainer.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        kanbanContainer.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));
        
        const dashboardNav = kanbanContainer.querySelector('[data-view="dashboard"]');
        const dashboardView = kanbanContainer.querySelector('.dashboard-view');
        
        if (dashboardNav && dashboardView) {
            dashboardNav.classList.add('active');
            dashboardView.classList.add('active');
            updateDashboardContent();
        }
    }
});

// Update error handling wrapper
function withErrorHandling(operation, fallback = null) {
    return new Promise((resolve) => {
        try {
            operation((result) => {
                if (chrome.runtime.lastError) {
                    console.error('Chrome storage error:', chrome.runtime.lastError);
                    resolve(fallback);
                    return;
                }
                resolve(result);
            });
        } catch (error) {
            console.error('Operation error:', error);
            resolve(fallback);
        }
    });
}

// Remove the extension context check function as it's no longer needed
// function checkExtensionContext() { ... } // Remove this function 