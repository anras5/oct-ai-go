package main

import (
	"context"
	"errors"
	"os"

	"google.golang.org/genai"
)

func getDiagnosis(fileBytes []byte) (*genai.GenerateContentResponse, error) {
	// Get API key from environment
	apiKey := os.Getenv("GOOGLEAI_API_KEY")
	if apiKey == "" {
		return nil, errors.New("Google AI API key not configured")
	}

	// Initialize AI client
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	// Create request parts
	parts := []*genai.Part{
		{Text: "What is the disease visible in this OCT scan?"},
		{InlineData: &genai.Blob{Data: fileBytes, MIMEType: "image/jpg"}},
	}

	// Set up response schema
	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type:     genai.TypeObject,
			Required: []string{"disease", "isOCTScan", "explanation"},
			Properties: map[string]*genai.Schema{
				"disease":     {Type: genai.TypeString, Description: "type of the disease. can be AMD/DME/NORMAL."},
				"isOCTScan":   {Type: genai.TypeBoolean, Description: "is this an OCT scan?"},
				"explanation": {Type: genai.TypeString, Description: "why did you make this prediction?"},
			},
			PropertyOrdering: []string{"disease", "isOCTScan", "explanation"},
		},
	}

	// Generate content
	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.0-flash",
		[]*genai.Content{{Parts: parts}},
		config,
	)
	if err != nil {
		return nil, err
	}

	return result, nil
}
