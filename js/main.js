let userId = '';
let categories = [];
let videos = [];

// Function to hide all screens and reset all buttons and containers
function hideAllScreens() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('category-screen').classList.add('hidden');
    document.getElementById('video-screen').classList.add('hidden');

    document.getElementById('back-to-start').classList.add('hidden');
    document.getElementById('back-to-category').classList.add('hidden');
    document.getElementById('video-container').classList.add('hidden');
    document.getElementById('category-container').classList.add('hidden');
}

// Ensure all unnecessary elements are hidden on load
function resetUI() {
    hideAllScreens(); // Hide all screens initially
    document.getElementById('start-button').classList.add('hidden');
    document.getElementById('user-id-section').classList.add('hidden');
    document.getElementById('category-container').innerHTML = ''; // Clear category container
    document.getElementById('video-frame').src = ''; // Clear video frame source
}

// Check the state and initialize the app on page load
window.onload = function () {
    resetUI(); // Reset UI elements on load
    showStartScreen(); // Always show the start screen first
};

// Show start screen function
function showStartScreen() {
    hideAllScreens(); // Hide all other screens before showing start screen
    stopVideo(); // Stop any playing video
    document.getElementById('start-screen').classList.remove('hidden'); // Show start screen

    const storedId = localStorage.getItem('userId');
    if (storedId && storedId.trim() !== '') {
        userId = storedId;
        document.getElementById('user-id-section').classList.add('hidden'); // Hide User ID input if already stored
        document.getElementById('start-button').classList.remove('hidden'); // Show the start game button
    } else {
        document.getElementById('user-id-section').classList.remove('hidden'); // Show the User ID input form
        document.getElementById('start-button').classList.add('hidden'); // Hide the start button
    }
}

// Load categories and videos from a JSON file
async function loadCategories() {
    try {
        const response = await fetch('videos.json');
        const data = await response.json();
        categories = data.categories;
        videos = data.videos;
        showCategories(); // Show the categories once loaded
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Show category selection screen
function showCategories() {
    hideAllScreens(); // Hide all screens before showing categories
    stopVideo(); // Stop any playing video before navigating
    document.getElementById('category-screen').classList.remove('hidden'); // Show category screen
    document.getElementById('back-to-start').classList.remove('hidden'); // Show back button to start screen
    document.getElementById('category-container').classList.remove('hidden'); // Show category container

    const categoryContainer = document.getElementById('category-container');
    categoryContainer.innerHTML = ''; // Clear existing categories

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerText = category.name;
        card.addEventListener('click', () => showVideoScreen(category.id)); // Navigate to video screen on click
        categoryContainer.appendChild(card);
    });
}

function showVideoScreen(categoryId) {
    hideAllScreens(); // Hide all screens before showing the video screen
    document.getElementById('video-screen').classList.remove('hidden'); // Show video screen
    document.getElementById('back-to-category').classList.remove('hidden'); // Show back button to category screen
    document.getElementById('video-container').classList.remove('hidden'); // Show video container

    // Filter videos by the selected category ID
    const selectedVideos = videos.filter(video => video.categoryId === categoryId);

    if (selectedVideos.length > 0) {
        const videoUrl = selectedVideos[0].url; // Get the first video URL in the selected category

        const videoContainer = document.getElementById('video-container');

        // Embed an HTML5 video element with autoplay, loop, sound unmuted, and inline playback on mobile
        videoContainer.innerHTML = `
            <video id="local-video" src="${videoUrl}" controls autoplay loop playsinline webkit-playsinline style="width: 800px; height: auto;">
                Your browser does not support the video tag.
            </video>
            <video id="camera-preview" width="150px" autoplay muted playsinline webkit-playsinline style="border: 2px solid #e0a80b; border-radius: 15px;"></video>
        `;

        // Adjust the video dimensions dynamically based on the video's actual aspect ratio
        const videoElement = document.getElementById('local-video');
        videoElement.addEventListener('loadedmetadata', () => {
            const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            const maxVideoWidth = 800; // Set desired maximum width
            videoElement.style.width = `${Math.min(maxVideoWidth, maxVideoWidth * aspectRatio)}px`;
            videoElement.style.height = `${Math.min(500, 500 / aspectRatio)}px`;
        });

        // Add event listener to handle exiting fullscreen mode gracefully
        videoElement.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                videoElement.pause(); // Pause the video on exiting fullscreen
            }
        });

        // Start camera preview
        startCameraPreview();
    }
}

// Function to stop video playback
function stopVideo() {
    const videoElement = document.getElementById('local-video');
    if (videoElement) {
        videoElement.pause(); // Pause the video
        videoElement.currentTime = 0; // Reset video to the beginning
    }
}

// Function to start the camera preview using getUserMedia
function startCameraPreview() {
    const cameraPreview = document.getElementById('camera-preview');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraPreview.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing camera:", error);
        });
}

// Event listener for User ID submission
document.getElementById('submit-id-button').addEventListener('click', () => {
    const enteredId = document.getElementById('user-id-input').value.trim();
    if (enteredId !== '') {
        userId = enteredId;
        localStorage.setItem('userId', userId);  // Store User ID in Local Storage
        document.getElementById('user-id-section').classList.add('hidden'); // Hide User ID input section
        document.getElementById('start-button').classList.remove('hidden'); // Show start game button
    }
});

// Start game button - Navigate to category selection
document.getElementById('start-button').addEventListener('click', () => {
    loadCategories(); // Load categories and show category screen
});

// Back button to start screen from category screen
document.getElementById('back-to-start').addEventListener('click', () => {
    showStartScreen(); // Show start screen when back button is clicked
});

// Back button to category screen from video screen
document.getElementById('back-to-category').addEventListener('click', () => {
    showCategories(); // Show category screen when back button is clicked
});
