class LLMService {
    constructor() {
        this.apiKey = 'YOUR OPENAI API KEY'; // Replace with your actual API key
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    }

    async enhanceDescription(description) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant that enhances task descriptions. Make them more detailed, actionable, and clear while maintaining the original intent. If the input is empty, generate a suitable description based on the context."
                        },
                        {
                            role: "user",
                            content: description || "Generate a task description"
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200
                })
            });

            if (!response.ok) {
                throw new Error('Failed to enhance description');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error enhancing description:', error);
            return description;
        }
    }
}

// Export the service
window.llmService = new LLMService(); 