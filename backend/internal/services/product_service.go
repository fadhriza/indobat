package services

import (
	"indobat-backend/internal/models"
	"indobat-backend/internal/repositories"
)

type ProductService interface {
	GetAll(params repositories.FilterParams) ([]models.Product, int64, error)
	Create(req *models.CreateProductRequest) (*models.Product, error)
	Update(id uint, req *models.CreateProductRequest) (*models.Product, error)
	Delete(id uint) error
}

type productService struct {
	repo repositories.ProductRepository
}

func NewProductService(repo repositories.ProductRepository) ProductService {
	return &productService{repo}
}

func (s *productService) GetAll(params repositories.FilterParams) ([]models.Product, int64, error) {
	return s.repo.GetAll(params)
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

func (s *productService) Update(id uint, req *models.CreateProductRequest) (*models.Product, error) {
	product, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	product.Name = req.Name
	product.Stock = req.Stock
	product.Price = req.Price

	err = s.repo.Update(product)
	return product, err
}

func (s *productService) Delete(id uint) error {
	return s.repo.Delete(id)
}
