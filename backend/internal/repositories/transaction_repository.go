package repositories

import (
	"indobat-backend/internal/models"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	Create(tx *models.Transaction) error
	GetAll() ([]models.Transaction, error)
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db}
}

func (r *transactionRepository) Create(tx *models.Transaction) error {
	return r.db.Create(tx).Error
}

func (r *transactionRepository) GetAll() ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Preload("Product").Order("created_at desc").Find(&transactions).Error
	return transactions, err
}
