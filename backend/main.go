package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

// Response represents the structured AI response
type Response struct {
	Disease     string `json:"disease"`
	IsOCTScan   bool   `json:"isOCTScan"`
	Explanation string `json:"explanation"`
}

// ErrorResponse represents an error message
type ErrorResponse struct {
	Error string `json:"error"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status string `json:"status"`
}

func main() {
	// Set up gin router
	router := gin.Default()

	// Configure API
	router.MaxMultipartMemory = 8 << 20 // 8 MiB

	// Health check endpoint
	router.GET("/health", healthCheckHandler)

	// Image analysis endpoint
	router.POST("/analyze", analyzeImageHandler)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
