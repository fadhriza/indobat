package models

import "time"

type Transaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	ProductID       uint      `gorm:"not null" json:"product_id"`
	Quantity        int       `gorm:"not null" json:"quantity"`
	DiscountPercent float64   `json:"discount_percent"`
	UnitPrice       float64   `gorm:"not null" json:"unit_price"`
	TotalPrice      float64   `gorm:"not null" json:"total_price"`
	CreatedAt       time.Time `json:"created_at"`
}

type CreateOrderRequest struct {
	ProductID       uint    `json:"product_id" binding:"required"`
	Quantity        int     `json:"quantity" binding:"required,min=1"`
	DiscountPercent float64 `json:"discount_percent" binding:"min=0,max=100"`
}

type OrderResponse struct {
	TransactionID  uint    `json:"transaction_id"`
	ProductName    string  `json:"product_name"`
	Quantity       int     `json:"quantity"`
	TotalPrice     float64 `json:"total_price"`
	RemainingStock int     `json:"remaining_stock"`
}
