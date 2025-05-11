package main

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

// healthCheckHandler returns a simple health check response
func healthCheckHandler(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status: "ok",
	})
}

// analyzeImageHandler handles the image upload and AI analysis
func analyzeImageHandler(c *gin.Context) {

	// Get uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: "No image file provided or invalid format",
		})
		return
	}

	// Open file
	uploadedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to process uploaded file",
		})
		return
	}
	defer uploadedFile.Close()

	// Read file content
	fileBytes := make([]byte, file.Size)
	if _, err := uploadedFile.Read(fileBytes); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to read file content",
		})
		return
	}

	// Get diagnosis from AI
	result, err := getDiagnosis(fileBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to get diagnosis from AI",
		})
		return
	}

	// Return response
	c.Header("Content-Type", "application/json")
	var response Response
	if err := json.Unmarshal([]byte(result.Text()), &response); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to process AI response",
		})
		return
	}
	c.JSON(http.StatusOK, response)
}
