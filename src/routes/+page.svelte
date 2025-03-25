<script lang="ts">
  import MarkdownIt from "markdown-it";
  import { onMount } from "svelte";
  import { tick } from "svelte";

  let userInput = "";
  let messages: { sender: string; content: string }[] = [];
  const md = new MarkdownIt();

  onMount(() => {
    messages = [...messages, { sender: "AI", content: "Hi Master! How can I assist you today?" }];
  });

  const sendMessage = async () => {
      if (!userInput.trim()) return;

      messages = [...messages, { sender: "User", content: userInput }];

      let inputCopy = userInput;
      userInput = "";  
      await tick();

      try {
          const response = await fetch("http://localhost:5173/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: inputCopy }),
          });

          if (!response.ok) throw new Error("Failed to fetch AI response.");

          const apiResponse = await response.json();
          const aiResponse = apiResponse?.response?.summary_of_context_data || "No response from AI.";

          messages = [...messages, { sender: "AI", content: aiResponse }];
      } catch (error) {
          console.error("Error fetching AI response:", error);
          messages = [...messages, { sender: "AI", content: "Error: Unable to fetch response. Try again." }];
      }
  };
</script>

<div class="container">
  <div class="chat-area">
      <div class="chat-box">
          {#each messages as msg}
              <div class="message-bubble {msg.sender === 'AI' ? 'ai-bubble' : 'user-bubble'}">
                  <p>{@html md.render(msg.content)}</p>
              </div>
          {/each}
      </div>

      <div class="user-input">
          <input type="text" placeholder="Type here..." bind:value={userInput} on:keydown={(e) => e.key === 'Enter' && sendMessage()} />
          <button on:click={sendMessage} aria-label="Send Message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14L21 3m0 0l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z"/>
              </svg>
          </button>
      </div>
  </div>
</div>

<style>
:global(body) {
  background-color: #c5c5c576;
  color: #FFFFFF;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.container {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
.chat-area {
  width: 600px;
  height: 80vh;
  padding: 20px;
  border-radius: 12px;
  background: #92929288;
  display: flex;
  flex-direction: column;
  border: 2px solid #bcbcbc;
}
.chat-box {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.message-bubble {
  margin: 10px 0;
  padding: 10px 15px;
  border-radius: 12px;
  color: #FFFFFF;
  word-wrap: break-word;
  max-width: 80%;
}
.ai-bubble {
  background-color: #6b696950;
  align-self: flex-start;
}
.user-bubble {
  background-color: #4CAF50;
  align-self: flex-end;
}
.user-input {
  display: flex;
  gap: 10px;
}
input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 16px;
  border: none;
  outline: none;
  background-color: #333333;
  border: 1.5px solid #444444;
  color: #FFFFFF;
}
button {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: #5cabe4;
  color: white;
  transition: background-color 0.3s ease, transform 0.2s ease; 
}
button:hover {
  background-color: #bebebe;
  transform: scale(1.1);
}
</style>
