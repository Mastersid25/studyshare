// Firebase configuration - replace this with your own Firebase project credentials
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js'; 
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js'; 
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js';    

const firebaseConfig = {
  apiKey: "AIzaSyBwXxfmIKwH43zNE5NCCHvzJ5YNobm1lLQ",
  authDomain: "mainminiproject-33e57.firebaseapp.com",
  projectId: "mainminiproject-33e57",
  storageBucket: "mainminiproject-33e57.appspot.com",
  messagingSenderId: "772675430843",
  appId: "1:772675430843:web:9f7dcc6e26b523fd047c9e",
  measurementId: "G-Y4JNPW985V"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseapp);
const storage = getStorage(firebaseapp);

// Get references to DOM elements
const fileInput = document.getElementById('fileUpload');
const uploadButton = document.getElementById('btn');
const statusDiv = document.getElementById('status');
const filePreviewDiv = document.getElementById('filePreview');

// Popup elements
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
const closePopupBtn = document.getElementById('closePopup');

// Add event listener to the upload button
uploadButton.addEventListener('click', () => {
    // Get the selected file
    const file = fileInput.files[0];

    // Check if a file was selected
    if (!file) {
        statusDiv.textContent = 'Please select a file.';
        return;
    }

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, 'uploads/' + file.name);

    // Upload the file to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes 
    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;   
        statusDiv.textContent = `Uploading: ${progress.toFixed(2)}%`;
    }, (error) => {
        // Handle errors
        statusDiv.textContent = 'Error uploading file: ' + error.message;
    }, () => {
        // Handle successful upload
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            statusDiv.textContent = 'File uploaded successfully. Download URL: ' + downloadURL;

            // Store the file information in Firestore
            addDoc(collection(db, 'uploads'), {
                fileName: file.name,
                fileURL: downloadURL,
                uploadedAt: new Date()
            }).then(() => {
                console.log('File information saved to Firestore');
            }).catch((error) => {
                console.error('Error saving file information: ', error);
            });

            // Create a new anchor element to download the file
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadURL;
            downloadLink.download = file.name;
            downloadLink.textContent = 'Download File';

            // Create a new image element to preview the file (if it's an image)
            if (file.type.startsWith('image/')) {
                const image = document.createElement('img');
                image.src = downloadURL;
                image.width = 300;
                image.height = 300;
                filePreviewDiv.appendChild(image);
            } else {
                // For non-image files, display a link to download
                filePreviewDiv.appendChild(downloadLink);
            }

            // Show popup
            overlay.style.display = 'block';
            popup.style.display = 'block';
        });
    });
});

// Close the popup when the button is clicked
closePopupBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    popup.style.display = 'none';
});
