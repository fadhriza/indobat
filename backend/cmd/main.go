package main

import (
	"os"

	"indobat-backend/internal/config"
	"indobat-backend/internal/handlers"
	"indobat-backend/internal/models"
	"indobat-backend/internal/repositories"
	"indobat-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Init DB
	db := config.InitDB()

	// Auto migrate tables
	db.AutoMigrate(&models.Product{}, &models.Transaction{})

	// Init Repositories
	productRepo := repositories.NewProductRepository(db)
	txRepo := repositories.NewTransactionRepository(db)

	// Init Services
	productService := services.NewProductService(productRepo)
	orderService := services.NewOrderService(db, productRepo, txRepo)

	// Init Handlers
	productHandler := handlers.NewProductHandler(productService)
	orderHandler := handlers.NewOrderHandler(orderService)
	healthHandler := handlers.NewHealthHandler()

	// Setup Router
	r := gin.Default()

	// CORS
	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:3000"
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{clientURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Routes
	api := r.Group("/api/v1")
	{
		// Health
		api.GET("/health", healthHandler.Check)

		// Products
		api.GET("/products", productHandler.GetAll)
		api.POST("/products", productHandler.Create)
		api.PUT("/products/:id", productHandler.Update)
		api.DELETE("/products/:id", productHandler.Delete)

		// Orders
		api.POST("/order", orderHandler.CreateOrder)
		api.GET("/orders", orderHandler.GetHistory)
	}

	r.Run(":8080")
}
