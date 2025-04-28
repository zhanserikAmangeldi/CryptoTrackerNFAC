package chat

import (
	"context"
	"crypto-tracker/config"
	"crypto-tracker/service/auth"
	"crypto-tracker/types"
	"encoding/json"
	"github.com/Azure/azure-sdk-for-go/sdk/ai/azopenai"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"strings"
)

type Handler struct {
	userStore       types.UserStore
	client          *azopenai.Client
	modelDeployment string
}

func NewHandler(config *config.Config, userStore types.UserStore) (*Handler, error) {
	keyCredential := azcore.NewKeyCredential(config.AzureOpenAIKey)
	client, err := azopenai.NewClientWithKeyCredential(config.AzureOpenAIEndpoint, keyCredential, nil)
	if err != nil {
		return nil, err
	}

	return &Handler{
		client:          client,
		modelDeployment: config.ModelDeploymentID,
		userStore:       userStore,
	}, nil
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.Handle("/chat", auth.AuthMiddleware(h.HandleChat, h.userStore)).Methods("POST", "OPTIONS")
}

func (h *Handler) HandleChat(w http.ResponseWriter, r *http.Request) {
	log.Println("handling chat")

	userId := auth.GetUserIDFromContext(r.Context())

	var chatReq types.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&chatReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("Received chat request: %+v", chatReq)

	azureMessages := make([]azopenai.ChatRequestMessageClassification, 0, len(chatReq.Messages)+1)

	if chatReq.SystemPrompt != "" {
		azureMessages = append(azureMessages,
			&azopenai.ChatRequestSystemMessage{
				Content: azopenai.NewChatRequestSystemMessageContent(chatReq.SystemPrompt),
			})
	}
	log.Printf("Received chat request: %+v", chatReq)

	for _, msg := range chatReq.Messages {
		switch msg.Role {
		case "user":
			azureMessages = append(azureMessages,
				&azopenai.ChatRequestUserMessage{
					Content: azopenai.NewChatRequestUserMessageContent(msg.Content),
				})
		case "assistant":
			azureMessages = append(azureMessages,
				&azopenai.ChatRequestAssistantMessage{
					Content: azopenai.NewChatRequestAssistantMessageContent(msg.Content),
				})
		}
	}

	resp, err := h.client.GetChatCompletions(
		context.TODO(),
		azopenai.ChatCompletionsOptions{
			Messages:       azureMessages,
			DeploymentName: &h.modelDeployment,
		},
		nil,
	)

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		statusCode := http.StatusInternalServerError
		errorMsg := err.Error()

		if strings.Contains(strings.ToLower(errorMsg), "content_filter") {
			statusCode = http.StatusBadRequest
			errorMsg = "Be a decent person."
		}

		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(types.ChatResponse{
			Error: errorMsg,
		})
		return
	}

	if len(resp.Choices) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(types.ChatResponse{Error: "No response from the AI model"})
		return
	}

	choice := resp.Choices[0]
	var finishReason string
	if choice.FinishReason != nil {
		finishReason = string(*choice.FinishReason)
	}

	var messageContent string
	if choice.Message != nil && choice.Message.Content != nil {
		messageContent = *choice.Message.Content
	}

	json.NewEncoder(w).Encode(types.ChatResponse{
		Message:      messageContent,
		FinishReason: finishReason,
		UserId:       userId,
	})
}
