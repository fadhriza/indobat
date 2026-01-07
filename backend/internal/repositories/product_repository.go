package repositories

import (
	"indobat-backend/internal/models"

	"gorm.io/gorm"
)

type FilterParams struct {
	Page    int
	Limit   int
	Search  string
	SortBy  string
	Order   string
}

type ProductRepository interface {
	GetAll(params FilterParams) ([]models.Product, int64, error)
	GetByID(id uint) (*models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id uint) error
	UpdateStock(id uint, newStock int) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db}
}

func (r *productRepository) GetAll(params FilterParams) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64
	
	query := r.db.Model(&models.Product{})

	if params.Search != "" {
		query = query.Where("name ILIKE ?", "%"+params.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if params.SortBy != "" {
		order := "ASC"
		if params.Order == "desc" {
			order = "DESC"
		}
		query = query.Order(params.SortBy + " " + order)
	} else {
		query = query.Order("id ASC")
	}

	offset := (params.Page - 1) * params.Limit
	if err := query.Offset(offset).Limit(params.Limit).Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *productRepository) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.First(&product, id).Error
	return &product, err
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) UpdateStock(id uint, newStock int) error {
	return r.db.Model(&models.Product{}).Where("id = ?", id).Update("stock", newStock).Error
}

func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}
