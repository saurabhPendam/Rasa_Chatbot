function sendMessage(event) {
    var userInput = document.getElementById("user-input").value;
  
    if (userInput.trim() !== "") {
      appendMessage("user", userInput);
  
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5005/webhooks/rest/webhook", true);
      xhr.setRequestHeader("Content-Type", "application/json");
  
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            var rasaResponse =
              data && data.length > 0
                ? data[0].text
                : "Sorry, I didn't understand that.";
  
            const videoId = extractVideoIdFromResponse(rasaResponse);
  
            if (videoId) {
              console.log("Embedding video with ID:", videoId);
              appendMessage("bot", rasaResponse, true, videoId);
              textToSpeech(rasaResponse);
            } else {
              appendMessage("bot", rasaResponse, false);
              textToSpeech(rasaResponse);
            }
          } else {
            appendMessage(
              "bot",
              "Sorry, an error occurred. Status: " + xhr.status
            );
          }
        }
      };
      xhr.onerror = function () {
        appendMessage("bot", "Sorry, an error occurred. Network error.");
      };
  
      xhr.send(JSON.stringify({ message: userInput }));
      document.getElementById("user-input").value = "";
    }
  }
  
  function handleKeyPress(event) {
    if (event.keyCode === 13) {
      sendMessage();
    }
  }
  
  // function clearChat() {
  //   var chatBox = document.getElementById("chat-box");
  //   chatBox.innerHTML = ""; // Clear the chat box content
  // }
  
  
  function appendMessage(sender, message, hasVideo, videoId = null) {
    var chatBox = document.getElementById("chat-box");
    var cssClass = sender === "bot" ? "bot-message" : "user-message";
    var messageElement = document.createElement("div");
    messageElement.className = "message " + cssClass;
    messageElement.appendChild(document.createTextNode(message));
  
    if (sender === "bot" && !hasVideo) {
      var speakerAnimation = document.createElement("div");
      speakerAnimation.className = "speaker-animation";
      messageElement.appendChild(speakerAnimation);
    }
  
    chatBox.appendChild(messageElement);
  
    if (hasVideo) {
      var videoDiv = document.createElement("div");
      videoDiv.className = "embedded-video";
  
      var iframe = document.createElement("iframe");
      iframe.width = "360";
      iframe.height = "240";
      iframe.src = "https://www.youtube.com/embed/" + videoId;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
  
      var closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.className = "close-btn";
      closeButton.onclick = () => {
        chatBox.removeChild(videoDiv);
      };
  
      videoDiv.appendChild(iframe);
      videoDiv.appendChild(closeButton);
      chatBox.appendChild(videoDiv);
    }
  
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  
  function textToSpeech(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
  
      if (voices.length > 0) {
        const englishVoice = voices.find((voice) => voice.lang.includes("en"));
        if (englishVoice) {
          utterance.voice = englishVoice;
          window.speechSynthesis.speak(utterance);
        } else {
          console.error("No English voice available for speech synthesis.");
        }
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", function () {
          const voices = window.speechSynthesis.getVoices();
          const englishVoice = voices.find((voice) => voice.lang.includes("en"));
          if (englishVoice) {
            utterance.voice = englishVoice;
            window.speechSynthesis.speak(utterance);
          } else {
            console.error("No English voice available for speech synthesis.");
          }
        });
      }
    } else {
      console.error("Speech synthesis is not supported in your browser.");
    }
  }
  
  function startVoiceInput() {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
  
      recognition.onstart = () => {
        console.log("Speech recognition started.");
      };
  
      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log("Speech recognition result:", result);
  
        // Update the user input box with the voice input
        updateUserInput(result);
        sendMessage();
      };
  
      recognition.onend = () => {
        console.log("Speech recognition ended.");
      };
  
      recognition.start();
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  }
  
  function updateUserInput(text) {
    const userInput = document.getElementById("user-input");
    userInput.value = text;
  }
  
  function extractVideoIdFromResponse(response) {
    const videoLinkRegex =
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const match = response.match(videoLinkRegex);
  
    if (match && match[1]) {
      return match[1]; // Return the video ID if there's a match
    } else {
      return null; // Return null if no match is found
    }
  }
  
  /* -------------- emoji  functions ----------------- */
  
  document.addEventListener("DOMContentLoaded", function () {
    // Initialize Emoji Button
    const inputField = document.getElementById("user-input");
    const emojiButton = document.getElementById("emoji-button");
    const picker = new EmojiButton();
  
    // Open Emoji Picker when emoji button is clicked
    emojiButton.addEventListener("click", function () {
      picker.togglePicker(inputField);
    });
  });
  
  function handleKeyPress(event) {
    if (event.keyCode === 13) {
      // Add your code to handle "Enter" key press here
      console.log("Enter key pressed");
    }
  }
  
  // navbar
  const sidenavToggler = document.querySelector(".sidenav .navbar-toggler");
  const sidenav = document.querySelector(".sidenav");
  
  sidenavToggler.addEventListener("click", () => {
    sidenavToggler.classList.toggle("open");
    sidenav.classList.toggle("show");
  });