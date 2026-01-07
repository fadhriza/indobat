package services

import (
	"indobat-backend/internal/models"
	"indobat-backend/internal/repositories"
)

type ProductService interface {
	GetAll() ([]models.Product, error)
	Create(req *models.CreateProductRequest) (*models.Product, error)
}

type productService struct {
	repo repositories.ProductRepository
}

func NewProductService(repo repositories.ProductRepository) ProductService {
	return &productService{repo}
}

func (s *productService) GetAll() ([]models.Product, error) {
	return s.repo.GetAll()
}

func (s *productService) Create(req *models.CreateProductRequest) (*models.Product, error) {
	product := &models.Product{
		Name:  req.Name,
		Stock: req.Stock,
		Price: req.Price,
	}
	err := s.repo.Create(product)
	return product, err
}
