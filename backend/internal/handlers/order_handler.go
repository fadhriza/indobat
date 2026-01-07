package handlers

import (
	"indobat-backend/internal/models"
	"indobat-backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"indobat-backend/internal/repositories"
	"strconv"
)

type OrderHandler struct {
	service services.OrderService
}

func NewOrderHandler(service services.OrderService) *OrderHandler {
	return &OrderHandler{service}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.service.CreateOrder(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *OrderHandler) GetHistory(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	sortBy := c.Query("sortBy")
	order := c.Query("order")
	groupBy := c.Query("groupBy")

	params := repositories.FilterParams{
		Page:    page,
		Limit:   limit,
		SortBy:  sortBy,
		Order:   order,
		GroupBy: groupBy,
	}

	history, total, err := h.service.GetOrderHistory(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  history,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
