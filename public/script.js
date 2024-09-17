window.onload = function () {
    displayLoadingMessage();
    hideInputFieldAndButton(); // Initially hide input field and button
};

function hideInputFieldAndButton() {
    document.getElementById("user-input").classList.add("hidden");
    document.getElementById("send-btn").classList.add("hidden");
}

function showInputFieldAndButton() {
    document.getElementById("user-input").classList.remove("hidden");
    document.getElementById("send-btn").classList.remove("hidden");
}

function displayLoadingMessage() {
    const loadingMessage = document.getElementById("loading-message");
    loadingMessage.classList.remove("hidden");

    setTimeout(() => {
        loadingMessage.classList.add("hidden");
        displayInitialMessage();
    }, 1000); // 1 second delay for the loading animation
}

function displayInitialMessage() {
    const initialMessage = "அன்புள்ள வாடிக்கையாளரே, நான் உங்கள் தனிப்பட்ட நபர் நித்ரா காலண்டர் உதவியாளர்";
    displayTypingAnimation("bot", () => {
        appendMessage(initialMessage, "bot");
        setTimeout(() => {
            displayOptionsMessage();
        }, 1000); // 1 second delay before displaying the options message
    });
}

function displayOptionsMessage() {
    const optionsMessage = `
        <p class="mb-2">நாங்கள் உங்களுக்கு என்ன உதவ முடியும்?</p>
        <ul class="list-none space-y-2">
            <li>
                <button class="w-full text-left bg-white border border-green-600 text-green-600 rounded-full py-2 px-4 focus:outline-none" onclick="handleOption('ஜாதகம் பார்க்க')">ஜாதகம் பார்க்க</button>
            </li>
            <li>
                <button class="w-full text-left bg-white border border-green-600 text-green-600 rounded-full py-2 px-4 focus:outline-none" onclick="handleOption('மேட்ரிமோனியில் பதிவு செய்ய')">மேட்ரிமோனியில் பதிவு செய்ய</button>
            </li>
            <li>
                <button class="w-full text-left bg-white border border-green-600 text-green-600 rounded-full py-2 px-4 focus:outline-none" onclick="handleOption('ஆன்மிகம் சார்ந்த')">ஆன்மிகம் சார்ந்த</button>
            </li>
            <li>
                <button class="w-full text-left bg-white border border-green-600 text-green-600 rounded-full py-2 px-4 focus:outline-none" onclick="handleOption('Account Action')">Account Action</button>
            </li>
            <li>
                <button class="w-full text-left bg-white border border-green-600 text-green-600 rounded-full py-2 px-4 focus:outline-none" onclick="handleOption('பயன்பாட்டை பற்றி புகார்')">பயன்பாட்டை பற்றி புகார்</button>
            </li>
        </ul>
    `;
    displayTypingAnimation("bot", () => {
        appendMessage(optionsMessage, "bot");
    });
}

function displayTypingAnimation(sender, callback) {
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator", "text-sm", "text-gray-500", "italic", "mb-2");

    // Create the dots for the typing indicator
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        typingIndicator.appendChild(dot);
    }

    chatBox.appendChild(typingIndicator);

    setTimeout(() => {
        chatBox.removeChild(typingIndicator);
        if (callback) callback();
    }, 1000); // 1 second delay for the typing animation

    // Auto scroll to the bottom of the chat container
    scrollToBottom();
}

function handleOption(option) {
    appendMessage(option, "user");
    displayTypingAnimation("bot", () => {
        fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: option })
        })
        .then(response => response.json())
        .then(data => {
            appendMessage(data.reply, "bot");

            // Check if the bot's message is the one asking for name and mobile number
            if (data.reply.includes("உங்கள் புகாரை எங்களிடம் தெரிவிக்க உங்கள் பெயர் மற்றும் WhatsApp உடன் இணைக்கப்பட்ட  மொபைல் எண்ணை உள்ளிடவும் (எ.கா: பெயர், மொபைல் எண்")) {
                showInputFieldAndButton(); // Show input field and button
            }
        });
    });
}

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() !== "") {
        appendMessage(userInput, "user");
        displayTypingAnimation("bot", () => {
            fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: userInput })
            })
            .then(response => response.json())
            .then(data => {
                appendMessage(data.reply, "bot");

                // After sending name and mobile number, hide the input field and button again
                if (data.reply.includes("பகிர்ந்தமைக்கு நன்றி")) {
                    hideInputFieldAndButton();
                }
            });

            document.getElementById("user-input").value = "";
        });
    }
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message-container", "flex", "flex-col");

    const messageSender = document.createElement("div");
    messageSender.classList.add("text-sm", "font-bold", "mb-1");
    if (sender === "bot") {
        messageSender.textContent = "Nithra Calendar Assistant";
    }

    const messageText = document.createElement("div");
    messageText.innerHTML = text;
    messageText.classList.add("rounded-lg", "p-3", "max-w-xs", "break-words");

    const timestamp = document.createElement("div");
    timestamp.textContent = formatTimestamp(new Date());
    timestamp.classList.add("text-gray-500", "text-xs", "mt-1");

    if (sender === "user") {
        messageText.classList.add("bg-green-500", "text-white", "self-end", "mr-2");
        timestamp.classList.add("self-end", "mr-2");
    } else {
        messageText.classList.add("bg-gray-200", "text-gray-900", "self-start", "ml-2");
        timestamp.classList.add("self-start", "ml-2");
        messageDiv.appendChild(messageSender); // Add the bot's name above the message
    }

    messageDiv.appendChild(messageText);
    messageDiv.appendChild(timestamp);
    chatBox.appendChild(messageDiv);

    // Auto scroll to the bottom of the chat container
    scrollToBottom();
}

function scrollToBottom() {
    const chatContainer = document.querySelector(".chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to format timestamp similar to WhatsApp
function formatTimestamp(date) {
    const now = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const time = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

    if (isToday) {
        return `Today ${time}`;
    } else if (isYesterday) {
        return `Yesterday ${time}`;
    } else {
        return `${date.toDateString()} ${time}`;
    }
}