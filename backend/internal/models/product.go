package models

import "time"

type Product struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Stock     int       `gorm:"not null;default:0" json:"stock"`
	Price     float64   `gorm:"not null" json:"price"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	Name  string  `json:"name" binding:"required"`
	Stock int     `json:"stock" binding:"required,min=0"`
	Price float64 `json:"price" binding:"required,gt=0"`
}
