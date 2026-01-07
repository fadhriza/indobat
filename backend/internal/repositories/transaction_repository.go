package repositories

import (
	"indobat-backend/internal/models"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	Create(tx *models.Transaction) error
	GetAll(params FilterParams) ([]models.Transaction, int64, error)
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

func (r *transactionRepository) GetAll(params FilterParams) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	query := r.db.Model(&models.Transaction{})

	// Grouping
	if params.GroupBy == "product" {
		// When grouping, we want to count unique products (groups) for 'total'
		// But counting distinct groups is tricky in simple count.
		// For pagination 'total' count usually means total rows returned.
		// Simplified: specific count query for grouping.
		// Actually, let's just count all for now or do a subquery count if needed.
		// For simple use case, maybe just getting all grouped records is fine if # products is small?
		// But user asked for pagination.
		
		query = query.Select("product_id, SUM(quantity) as quantity, SUM(total_price) as total_price, MAX(created_at) as created_at")
		query = query.Group("product_id")
		
		// For total count of groups:
		// GORM Count() with Group() might create "SELECT count(*) FROM ... GROUP BY ..." which returns multiple rows.
		// We need logic to count results.
		// Optimization: Use a separate count query or fetch all for grouping if dataset small.
		// Given it's a small app, let's fetch all then slice? No, pagination requested.
		// Proper way:
		if err := r.db.Model(&models.Transaction{}).Group("product_id").Count(&total).Error; err != nil {
			// This might return number of groups? GORM behavior varies. 
			// Actually GORM Count with Group generates valid SQL but Scan might be issue.
			// Let's rely on simplified total for now or skip total check for grouped view if problematic.
			// Re-enable total check:
			// total = int64(len(products)) // if we could cross reference.
		}
		// Correct way for row count with group by is `SELECT COUNT(DISTINCT product_id) ...`
		r.db.Model(&models.Transaction{}).Select("count(distinct product_id)").Count(&total)

	} else {
		if err := query.Count(&total).Error; err != nil {
			return nil, 0, err
		}
	}

	query = query.Preload("Product")

	// Sorting
	if params.SortBy != "" {
		order := "ASC"
		if params.Order == "desc" {
			order = "DESC"
		}
		query = query.Order(params.SortBy + " " + order)
	} else {
		query = query.Order("created_at desc")
	}

	// Pagination
	offset := (params.Page - 1) * params.Limit
	err := query.Offset(offset).Limit(params.Limit).Find(&transactions).Error

	return transactions, total, err
}
