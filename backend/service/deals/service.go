package deals

import (
	"errors"
	"github.com/go-playground/validator/v10"
)

type DealService struct {
	repo     DealRepository
	validate *validator.Validate
}

func NewDealService(repo DealRepository) *DealService {
	return &DealService{
		repo:     repo,
		validate: validator.New(),
	}
}

func (s *DealService) Create(deal *Deal) error {
	if err := s.validate.Struct(deal); err != nil {
		return err
	}

	return s.repo.Create(deal)
}

func (s *DealService) GetByID(id int64) (*Deal, error) {
	deal, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if deal == nil {
		return nil, errors.New("deal not found")
	}

	return deal, nil
}

func (s *DealService) GetByUserID(userID string) ([]*Deal, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	return s.repo.GetByUserID(userID)
}

func (s *DealService) GetAll() ([]*Deal, error) {
	return s.repo.GetAll()
}

func (s *DealService) Update(deal *Deal) error {
	if err := s.validate.Struct(deal); err != nil {
		return err
	}

	if deal.Id <= 0 {
		return errors.New("invalid deal ID")
	}

	existingDeal, err := s.repo.GetByID(deal.Id)
	if err != nil {
		return err
	}

	if existingDeal == nil {
		return errors.New("deal not found")
	}

	return s.repo.Update(deal)
}

func (s *DealService) Delete(id int64) error {
	if id <= 0 {
		return errors.New("invalid deal ID")
	}

	return s.repo.Delete(id)
}

func (s *DealService) GetUserPortfolio(userID string) (map[string]*Portfolio, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	deals, err := s.repo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	portfolio := make(map[string]*Portfolio)

	for _, deal := range deals {
		currencyID := deal.CurrencyId
		cost := deal.Count * deal.Price

		if _, exists := portfolio[currencyID]; !exists {
			portfolio[currencyID] = &Portfolio{
				CurrencyID: currencyID,
				TotalCount: 0,
				AvgPrice:   0,
				TotalCost:  0,
			}
		}

		entry := portfolio[currencyID]

		entry.TotalCount += deal.Count
		entry.TotalCost += cost

		if entry.TotalCount > 0 {
			entry.AvgPrice = entry.TotalCost / entry.TotalCount
		}
	}

	return portfolio, nil
}
