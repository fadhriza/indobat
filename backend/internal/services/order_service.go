package services

import (
"errors"
"indobat-backend/internal/models"
"indobat-backend/internal/repositories"

"gorm.io/gorm"
"gorm.io/gorm/clause"
)

type OrderService interface {
CreateOrder(req *models.CreateOrderRequest) (*models.OrderResponse, error)
GetOrderHistory() ([]models.Transaction, error)
}

type orderService struct {
db          *gorm.DB
productRepo repositories.ProductRepository
txRepo      repositories.TransactionRepository
}

func NewOrderService(db *gorm.DB, productRepo repositories.ProductRepository, txRepo repositories.TransactionRepository) OrderService {
return &orderService{db, productRepo, txRepo}
}

func (s *orderService) CreateOrder(req *models.CreateOrderRequest) (*models.OrderResponse, error) {
var response models.OrderResponse

// 🔒 CRITICAL: Database Transaction + Row Locking
err := s.db.Transaction(func(tx *gorm.DB) error {
// Lock row untuk mencegah race condition
var product models.Product
if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, req.ProductID).Error; err != nil {
if errors.Is(err, gorm.ErrRecordNotFound) {
return errors.New("produk tidak ditemukan")
}
return err
}

// Validasi stok
if product.Stock < req.Quantity {
return errors.New("stok tidak mencukupi")
}

// Hitung harga
subtotal := product.Price * float64(req.Quantity)
discount := subtotal * (req.DiscountPercent / 100)
totalPrice := subtotal - discount

// Kurangi stok
newStock := product.Stock - req.Quantity
if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
return err
}

// Simpan transaksi
transaction := models.Transaction{
ProductID:       req.ProductID,
Quantity:        req.Quantity,
DiscountPercent: req.DiscountPercent,
UnitPrice:       product.Price,
TotalPrice:      totalPrice,
}

if err := tx.Create(&transaction).Error; err != nil {
return err
}

// Prepare response
response = models.OrderResponse{
TransactionID:  transaction.ID,
ProductName:    product.Name,
Quantity:       req.Quantity,
TotalPrice:     totalPrice,
RemainingStock: newStock,
}

return nil
})

if err != nil {
return nil, err
}

return &response, nil
}

func (s *orderService) GetOrderHistory() ([]models.Transaction, error) {
return s.txRepo.GetAll()
}
