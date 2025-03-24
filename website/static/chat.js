// Select all alert elements with the class "alert-warning"
var alerts = document.querySelectorAll('.alert-warning');

// Loop through each alert element
alerts.forEach(function(alert) {
    setTimeout(function() {
        alert.remove(); // Remove the alert element from the DOM
    }, 3000); // Adjust the delay time as needed
});

function handleKeyPress(event) {
    if (event.keyCode === 13) {
        sendMessage();
    }
}

function clearChat() {
    var chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // Clear the chat box content
}

function startSpeechRecognition() {
    // Check if the browser supports SpeechRecognition API
    if ('webkitSpeechRecognition' in window) {
        // Create a new instance of SpeechRecognition
        var recognition = new webkitSpeechRecognition();

        // Set properties for SpeechRecognition
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // Start speech recognition
        recognition.start();

        // Event listener for when speech is recognized
        recognition.onresult = function(event) {
            // Get the recognized speech transcript
            var transcript = event.results[0][0].transcript;
            // Set the transcript to the user input field
            document.getElementById('user-input').value = transcript;
            // Trigger sendMessage function with the transcript
            sendMessage('speech');
        };

        // Event listener for when speech recognition ends
        recognition.onend = function() {
            recognition.stop();
        };
    } else {
        alert('Speech recognition is not supported in this browser.');
    }
}

// function sendMessage(event) {
//     var userInput = document.getElementById('user-input').value.trim();

//     if (userInput !== '') {
//         appendMessage('user', userInput);

//         var xhr = new XMLHttpRequest();
//         xhr.open('POST', 'http://localhost:5005/webhooks/rest/webhook', true);
//         xhr.setRequestHeader('Content-Type', 'application/json');
//         xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));

//         xhr.onreadystatechange = function() {
//             if (xhr.readyState === XMLHttpRequest.DONE) {
//                 if (xhr.status === 200) {
//                     var data = JSON.parse(xhr.responseText);
//                     var rasaResponse = data && data.length > 0 ? data[0] : null;
//                     if (rasaResponse && rasaResponse.hasOwnProperty('text')) {
//                         var responseText = rasaResponse.text;
//                         if (isYouTubeLink(responseText)) {
//                             appendMessage('bot', responseText);
//                             appendVideoButton(responseText);
//                         } else {
//                             appendMessage('bot', responseText);
//                         }
//                         // Convert Rasa response to speech if event indicates speech input
//                         if (event === 'speech') {
//                             convertTextToSpeech(responseText);
//                         }
//                     } else if (rasaResponse && rasaResponse.hasOwnProperty('payload') && rasaResponse.payload.hasOwnProperty('report_content')) {
//                         // Modification: Handle the case when Rasa response contains a report content
//                         var reportContent = rasaResponse.payload.report_content;
//                         var viewReportButton = document.createElement('button');
//                         viewReportButton.textContent = 'Click here to view report';
//                         viewReportButton.onclick = function() {
//                             displayReport(reportContent);
//                         };
//                         var chatBox = document.getElementById('chat-box');
//                         chatBox.appendChild(viewReportButton);
//                     } else {
//                         appendMessage('bot', 'Sorry, I didn\'t understand that.');
//                     }
//                 } else {
//                     appendMessage('bot', 'Sorry, an error occurred. Status: ' + xhr.status);
//                 }
//             }
//         };

//         xhr.onerror = function() {
//             appendMessage('bot', 'Sorry, an error occurred. Network error.');
//         };

//         xhr.send(JSON.stringify({ 'message': userInput }));
//         document.getElementById('user-input').value = '';
//     }
// }

function sendMessage() {
    var userInput = document.getElementById('user-input').value.trim();

    if (userInput !== '') {
        appendMessage('user', userInput);
        sendMessageToRasa(userInput);
        document.getElementById('user-input').value = '';
    }
}

// function sendMessageToRasa(userInput) {
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', 'http://localhost:5005/webhooks/rest/webhook', true);
//     xhr.setRequestHeader('Content-Type', 'application/json');

//     xhr.onreadystatechange = function() {
//         if (xhr.readyState === XMLHttpRequest.DONE) {
//             if (xhr.status === 200) {
//                 var data = JSON.parse(xhr.responseText);
//                 var rasaResponse = data && data.length > 0 ? data[0] : null;
//                 if (rasaResponse && rasaResponse.hasOwnProperty('text')) {
//                     var responseText = rasaResponse.text;
//                     if (isYouTubeLink(responseText)) {
//                         appendMessage('bot', responseText);
//                         appendVideoButton(responseText);
//                     } else {
//                         appendMessage('bot', responseText);
//                     }
//                     // Convert Rasa response to speech if event indicates speech input
//                     if (event === 'speech') {
//                         convertTextToSpeech(responseText);
//                     }

//                     // If the response indicates the end of the conversation, send a request to generate the report
//                     if (responseText.toLowerCase().includes('bye')) {
//                         sendReportRequest();
//                     }
//                 } else {
//                     appendMessage('bot', 'Sorry, I didn\'t understand that.');
//                 }
//             } else {
//                 appendMessage('bot', 'Sorry, an error occurred. Status: ' + xhr.status);
//             }
//         }
//     };

//     xhr.onerror = function() {
//         appendMessage('bot', 'Sorry, an error occurred. Network error.');
//     };

//     xhr.send(JSON.stringify({ 'message': userInput }));
// }

function sendMessageToRasa(userInput) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5005/webhooks/rest/webhook', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var rasaResponse = data && data.length > 0 ? data[0] : null;
                if (rasaResponse && rasaResponse.hasOwnProperty('text')) {
                    var responseText = rasaResponse.text;
                    if (isYouTubeLink(responseText)) {
                        appendMessage('bot', responseText);
                        appendVideoButton(responseText);
                    } else {
                        appendMessage('bot', responseText);
                    }

                    if (event === 'speech') {
                        convertTextToSpeech(responseText);
                    }  
                } else {
                    appendMessage('bot', 'Sorry, I didn\'t understand that.');
                }
            } else {
                appendMessage('bot', 'Sorry, an error occurred. Status: ' + xhr.status);
            }
        }
    };

    xhr.onerror = function() {
        appendMessage('bot', 'Sorry, an error occurred. Network error.');
    };

    xhr.send(JSON.stringify({ 'message': userInput }));
}


// function sendReportRequest() {
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', '/generate-report/', true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));

//     xhr.onreadystatechange = function() {
//         if (xhr.readyState === XMLHttpRequest.DONE) {
//             if (xhr.status === 200) {
//                 var data = JSON.parse(xhr.responseText);
//                 if (data.hasOwnProperty('report_content')) {
//                     var reportContent = data.report_content;
//                     appendReportButton(reportContent);
//                 } else {
//                     appendMessage('bot', 'Sorry, an error occurred while generating the report.');
//                 }
//             } else {
//                 appendMessage('bot', 'Sorry, an error occurred. Status: ' + xhr.status);
//             }
//         }
//     };

//     xhr.onerror = function() {
//         appendMessage('bot', 'Sorry, an error occurred. Network error.');
//     };

//     xhr.send(JSON.stringify({ 'message': 'bye' }));
// }

function sendReportRequest() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/generate-report/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.hasOwnProperty('report_content')) {
                    var reportContent = data.report_content;
                    displayReport(reportContent);
                } else {
                    appendMessage('bot', 'Sorry, an error occurred while generating the report.');
                }
            } else {
                appendMessage('bot', 'Sorry, an error occurred. Status: ' + xhr.status);
            }
        }
    };

    xhr.onerror = function() {
        appendMessage('bot', 'Sorry, an error occurred. Network error.');
    };

    xhr.send(JSON.stringify({ 'message': 'display report' }));
}
// Function to get the CSRF token from the cookie
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function appendReportButton(reportContent) {
    var chatBox = document.getElementById('chat-box');
    var viewReportButton = document.createElement('button');
    viewReportButton.textContent = 'Click here to view report';
    viewReportButton.onclick = function() {
        displayReport(reportContent);
    };
    chatBox.appendChild(viewReportButton);
}

// Function to convert text to speech
function convertTextToSpeech(text) {
    // Check if the text contains a YouTube link
    var youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=([^#\&\?]*))/;
    var match = youtubeRegex.exec(text);

    // If a YouTube link is found, read the text before the link
    if (match) {
        var beforeLink = text.substring(0, match.index);
        var utterance = new SpeechSynthesisUtterance(beforeLink);
        window.speechSynthesis.speak(utterance);
    } else {
        // If no YouTube link is found, read the entire text
        var utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}

function appendMessage(sender, message) {
    var chatBox = document.getElementById('chat-box');
    var cssClass = sender === 'bot' ? 'bot-message' : 'user-message';
    var messageElement = document.createElement('p');
    messageElement.className = 'message ' + cssClass;
    messageElement.innerHTML = message; // Use innerHTML to render links
    chatBox.appendChild(messageElement);

    // Scroll to the bottom of the chat box to show the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// function appendMessage(sender, message) {
//     var chatBox = document.getElementById('chat-box');
//     var cssClass = sender === 'bot' ? 'bot-message' : 'user-message';
//     var messageElement = document.createElement('p');
//     messageElement.className = 'message ' + cssClass;

//     if (message.startsWith('data:application/pdf;base64,')) {
//         // If the message starts with the base64 data URI, it contains a report
//         var reportContent = message.substring('data:application/pdf;base64,'.length);
//         var viewReportButton = document.createElement('button');
//         viewReportButton.textContent = 'Click here to view report';
//         viewReportButton.onclick = function() {
//             displayReport(reportContent);
//         };
//         messageElement.appendChild(viewReportButton);
//     } else {
//         messageElement.innerHTML = message; // Use innerHTML to render links
//     }

//     chatBox.appendChild(messageElement);

//     // Scroll to the bottom of the chat box to show the latest message
//     chatBox.scrollTop = chatBox.scrollHeight;
// }


function isYouTubeLink(text) {
    // Regular expression to check if the text contains a YouTube link
    var youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=([^#\&\?]*))/;
    var isLink = youtubeRegex.test(text);
    //console.log("Is YouTube Link:", isLink);
    return isLink;
}

function appendVideoButton(youtubeLink) {
    //console.log("Playing Video:", youtubeLink);
    var chatBox = document.getElementById('chat-box');
    var button = document.createElement('button');
    button.textContent = 'Click here to watch';
    button.style.padding = '6px';
    button.style.margin = '8px';

    button.onclick = function() {
        playVideo(youtubeLink);
    };
    chatBox.appendChild(button);
    //console.log("Video Button Appended");
}

function playVideo(youtubeLink) {
    var videoId = extractVideoId(youtubeLink);
    if (videoId) {
        var chatBox = document.getElementById('chat-box');
        var videoElement = document.createElement('iframe');
        videoElement.width = '560';
        videoElement.height = '315';
        videoElement.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1'; // Removed additional parameters
        videoElement.frameborder = '0';
        videoElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        videoElement.allowfullscreen = true;

        // Create a close button
        var closeButton = document.createElement('button');
        closeButton.textContent = 'Close Video';
        closeButton.style.margin = '8px';
        closeButton.style.padding = '6px';

        closeButton.onclick = function() {
            chatBox.removeChild(videoElement); // Remove the video iframe
            chatBox.removeChild(closeButton); // Remove the close button
        };

        // Append the video iframe and close button to the chat box
        chatBox.appendChild(videoElement);
        chatBox.appendChild(closeButton);

        // Scroll to the bottom of the chat box to show the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        console.error('Invalid YouTube link');

    }
}
// ... (existing code)

function extractVideoId(url) {
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?\[?&\]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}


function displayReport(reportContent) {
    var reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';

    var closeButton = document.createElement('button');
    closeButton.innerHTML = '&#10006;'; // Unicode for the cross symbol
    closeButton.className = 'close-button';
    closeButton.onclick = function() {
        reportContainer.style.display = 'none'; // Hide the report container when the close button is clicked
    };
    reportContainer.appendChild(closeButton);

    var reportEmbed = document.createElement('embed');
    reportEmbed.src = 'data:application/pdf;base64,' + reportContent;
    reportEmbed.width = '100%';
    reportEmbed.height = '800';
    reportEmbed.type = 'application/pdf';
    reportContainer.appendChild(reportEmbed);

    var chatBox = document.getElementById('chat-box');
    chatBox.appendChild(reportContainer);
}

// Function to handle "display report" button click
document.getElementById('display-report-button').addEventListener('click', function() {
    sendReportRequest();
});


// function displayReport(reportContent) {
//     var reportContainer = document.createElement('div');
//     reportContainer.className = 'report-container';
//     var reportEmbed = document.createElement('embed');
//     reportEmbed.src = 'data:application/pdf;base64,' + reportContent;
//     reportEmbed.width = '100%';
//     reportEmbed.height = '800';
//     reportEmbed.type = 'application/pdf';
//     reportContainer.appendChild(reportEmbed);
//     var chatBox = document.getElementById('chat-box');
//     chatBox.appendChild(reportContainer);
// }

function fetchSentimentReport() {
    fetch('/api/sentiment-report/')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                appendMessage('bot', data.error);
            } else {
                displaySentimentReport(data);
            }
        })
        .catch(error => {
            appendMessage('bot', 'Sorry, an error occurred while fetching the report.');
            console.error('Error fetching sentiment report:', error);
        });
}