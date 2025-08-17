document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
  const userEmailSpan = document.getElementById('user-email');
  const displayUserId = document.getElementById('displayUserId');
  const adminUploadSection = document.getElementById('adminSection');
  const availableFilesList = document.getElementById('available-files-list');
  const adminPdfFile = document.getElementById('admin-pdf-file');
  const adminPdfTitle = document.getElementById('admin-pdf-title');
  const adminPdfCategory = document.getElementById('admin-pdf-category');
  const adminUploadButton = document.getElementById('admin-upload-button');
  const uploadMessage = document.getElementById('upload-message');
  const chatInput = document.getElementById('chat-input');
  const sendChatButton = document.getElementById('send-chat-button');
  const chatWindow = document.querySelector('.chat-window');
  const pdfFileInput = document.getElementById('pdf-file-input');
  const summarizePdfButton = document.getElementById('summarize-pdf-button');
  const pdfSummaryOutput = document.getElementById('pdf-summary-output');

  // Progress Bar elements
  const progressBarContainer = document.querySelector('.progress-bar-container');
  const progressBar = document.querySelector('.progress-bar');

  // Navigation elements
  const navDownloads = document.getElementById('navDownloads');
  const navChatbot = document.getElementById('navChatbot');
  const navSummarizer = document.getElementById('navSummarizer');
  const navAdmin = document.getElementById('navAdmin');
  const adminNavListItem = document.getElementById('adminNavListItem'); // New: List item for admin nav
  const logoutNav = document.getElementById('logout-nav');

  // Section elements
  const downloadsSection = document.getElementById('downloadsSection');
  const chatbotSection = document.getElementById('chatbotSection');
  const summarizerSection = document.getElementById('summarizerSection');
  const adminSection = document.getElementById('adminSection');

  // Main header title
  const pageTitle = document.getElementById('pageTitle');

  // Downloads search elements
  const downloadSearchInput = document.getElementById('downloadSearch');
  const searchDownloadsBtn = document.getElementById('searchDownloadsBtn');
  const noDownloadsMessage = document.getElementById('noDownloadsMessage');

  // Custom Message Box elements
  const messageBox = document.getElementById('messageBox');
  const messageText = document.getElementById('messageText');
  const closeMessageBtn = document.getElementById('closeMessage');

  // --- Helper Functions ---

  // Function to display custom message box
  function showMessage(message) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
  }

  // Function to hide custom message box
  function hideMessage() {
    messageBox.classList.add('hidden');
  }

  // Event listener for closing the custom message box
  if (closeMessageBtn) closeMessageBtn.addEventListener('click', hideMessage);

  function showAuthMessage(message, type) {
    // This function is primarily for the index.html login/signup messages.
    // On dashboard, we use the custom messageBox.
    console.log(`Auth Message (Dashboard): ${message} (${type})`);
    showMessage(message); // Use the custom message box for consistency
  }

  // Function to show a specific content section and hide others
  function showSection(sectionElement, title) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.style.display = 'none';
      section.classList.remove('active');
    });

    // Show the selected section
    sectionElement.style.display = 'block';
    sectionElement.classList.add('active');
    pageTitle.textContent = title; // Update the main header title

    // Update active class for sidebar navigation links
    document.querySelectorAll('.nav-item').forEach(navItem => {
      navItem.classList.remove('active');
    });
    // Add active class to the clicked navigation link
    if (sectionElement === downloadsSection) navDownloads.classList.add('active');
    else if (sectionElement === chatbotSection) navChatbot.classList.add('active');
    else if (sectionElement === summarizerSection) navSummarizer.classList.add('active');
    else if (sectionElement === adminSection) navAdmin.classList.add('active');
  }

  // Function to fetch and display files (now with search capability)
  async function fetchAndDisplayFiles(searchTerm = '') {
    if (!availableFilesList) return;
    availableFilesList.innerHTML = '<p class="text-center text-gray-500">Loading files...</p>';
    noDownloadsMessage.style.display = 'none'; // Hide no results message initially

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to fetch files from server.');
      }

      let files = await response.json();

      // Filter files based on search term
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        files = files.filter(file =>
          file.fileName.toLowerCase().includes(lowerCaseSearchTerm) ||
          (file.title && file.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (file.category && file.category.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (file.uploadDate && new Date(file.uploadDate).toLocaleDateString().toLowerCase().includes(lowerCaseSearchTerm)) // Search by formatted date
        );
      }

      availableFilesList.innerHTML = ''; // Clear existing list

      if (files.length === 0) {
        noDownloadsMessage.style.display = 'block';
      } else {
        files.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.className = 'file-item';
          const displayTitle = file.title || file.fileName;
          const displayCategory = file.category ? `Category: ${file.category} | ` : '';
          const displayDate = file.uploadDate ? `Uploaded: ${new Date(file.uploadDate).toLocaleDateString()}` : '';

          fileItem.innerHTML = `
                        <div>
                            <p>${displayTitle}</p>
                            <p class="text-sm text-gray-600">${displayCategory}${displayDate}</p>
                        </div>
                        <a href="${file.fileUrl}" target="_blank" class="download-btn" download="${displayTitle.replace(/\s/g, '_')}.${file.fileName.split('.').pop()}">Download</a>
                    `;
          availableFilesList.appendChild(fileItem);
        });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      availableFilesList.innerHTML = `<p class="text-red-500">Failed to load files. Error: ${error.message}</p>`;
      showMessage(`Failed to load files: ${error.message}`);
    }
  }

  // Function to check authentication and setup UI
  function checkAuthAndSetupUI() {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    if (token) {
      // Update user email and ID display
      if (userEmailSpan) userEmailSpan.textContent = userEmail;
      if (displayUserId) displayUserId.textContent = userEmail;

      // Control visibility of admin nav item
      if (adminNavListItem) {
        adminNavListItem.style.display = isAdmin ? 'list-item' : 'none'; // Show/hide the entire list item
      }

      // Initial load of files for the downloads section
      fetchAndDisplayFiles();
      showSection(downloadsSection, 'Downloads'); // Default to downloads section
    } else {
      // Redirect to index page if not logged in
      window.location.href = 'index.html';
    }
  }

  // --- Event Listeners ---

  // Sidebar Navigation
  if (navDownloads) navDownloads.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(downloadsSection, 'Downloads');
    fetchAndDisplayFiles(); // Refresh files when navigating to downloads
  });

  if (navChatbot) navChatbot.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(chatbotSection, 'AI Chatbot');
  });

  if (navSummarizer) navSummarizer.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(summarizerSection, 'PDF Summarizer');
  });

  if (navAdmin) navAdmin.addEventListener('click', (e) => {
    e.preventDefault();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      showSection(adminSection, 'Admin Section'); // Changed title here
    } else {
      showMessage("You do not have administrative privileges to access this section.");
    }
  });

  if (logoutNav) logoutNav.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    showMessage("Logged out successfully!");
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });

  // Chatbot Functionality
  if (sendChatButton) sendChatButton.addEventListener('click', async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage !== '') {
      const userMessageElement = document.createElement('p');
      userMessageElement.className = 'user-message';
      userMessageElement.innerHTML = `<strong>You:</strong> ${userMessage}`;
      chatWindow.appendChild(userMessageElement);
      chatWindow.scrollTop = chatWindow.scrollHeight;
      chatInput.value = '';

      const botThinkingMessage = document.createElement('p');
      botThinkingMessage.className = 'bot-message';
      botThinkingMessage.innerHTML = `<strong>Bot:</strong> Thinking...`;
      chatWindow.appendChild(botThinkingMessage);
      chatWindow.scrollTop = chatWindow.scrollHeight;

      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['x-auth-token'] = token;
        }
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ message: userMessage }),
        });
        const data = await response.json();

        botThinkingMessage.innerHTML = `<strong>Bot:</strong> ${data.response}`;
        chatWindow.scrollTop = chatWindow.scrollHeight;
      } catch (error) {
        console.error('Error sending chat message:', error);
        botThinkingMessage.innerHTML = `<strong>Bot:</strong> An error occurred while fetching response.`;
        showMessage('An error occurred with the chatbot. Please try again.');
      }
    }
  });

  // PDF Summarizer Functionality
  if (summarizePdfButton) summarizePdfButton.addEventListener('click', async () => {
    if (!pdfFileInput.files.length) {
      showMessage('Please select a PDF file to summarize.');
      return;
    }
    const file = pdfFileInput.files[0];
    const formData = new FormData();
    formData.append('pdfFile', file);
    if (pdfSummaryOutput) pdfSummaryOutput.textContent = 'Summarizing... This may take a moment.';
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['x-auth-token'] = token;
      }
      const response = await fetch('http://localhost:5000/api/pdf/summarize', {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      const data = await response.json();
      if (pdfSummaryOutput) {
        if (response.ok) {
          pdfSummaryOutput.textContent = `Summary: ${data.summary || data.msg}`;
        } else {
          pdfSummaryOutput.textContent = `Error: ${data.msg || 'Unknown summarization error'}`;
          showMessage(`Summarization failed: ${data.msg || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error during PDF summarization:', error);
      if (pdfSummaryOutput) pdfSummaryOutput.textContent = 'An error occurred during PDF summarization.';
      showMessage('An error occurred during PDF summarization.');
    }
  });

  // Admin Upload Event Listener with Progress Bar
  if (adminUploadButton) adminUploadButton.addEventListener('click', () => {
    if (!adminPdfFile.files.length) {
      showMessage('Please select a PDF file to upload.');
      return;
    }
    const file = adminPdfFile.files[0];
    const title = adminPdfTitle.value.trim();
    const category = adminPdfCategory.value.trim();

    if (!title || !category) {
      showMessage('Please enter both file title and category.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showMessage('You must be logged in to upload files.');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('title', title);
    formData.append('category', category);

    if (uploadMessage) uploadMessage.textContent = 'Uploading file...';
    if (progressBarContainer) progressBarContainer.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        if (progressBar) progressBar.style.width = percentComplete + '%';
      }
    };

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        if (uploadMessage) uploadMessage.textContent = `Success: ${data.msg}`;
        adminPdfTitle.value = '';
        adminPdfCategory.value = '';
        adminPdfFile.value = '';
        fetchAndDisplayFiles();
      } else {
        const data = JSON.parse(xhr.responseText);
        if (uploadMessage) uploadMessage.textContent = `Error: ${data.msg || 'Unknown upload error'}`;
        showMessage(`Upload failed: ${data.msg || 'Unknown error'}`);
      }
      if (progressBarContainer) progressBarContainer.style.display = 'none';
    };

    xhr.onerror = function () {
      if (uploadMessage) uploadMessage.textContent = 'An error occurred during upload.';
      showMessage('An error occurred during upload.');
      if (progressBarContainer) progressBarContainer.style.display = 'none';
    };

    xhr.open('POST', 'http://localhost:5000/api/upload');
    xhr.setRequestHeader('x-auth-token', token);
    xhr.send(formData);
  });

  // Downloads Search Functionality
  if (searchDownloadsBtn) searchDownloadsBtn.addEventListener('click', () => {
    const searchTerm = downloadSearchInput.value.trim();
    fetchAndDisplayFiles(searchTerm);
  });

  // Initial setup when dashboard loads
  checkAuthAndSetupUI();
});
