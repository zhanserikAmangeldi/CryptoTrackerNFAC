package jobs

import (
	"context"
	"crypto-tracker/background"
	"crypto-tracker/service/currency"
	"log"
	"time"
)

type Jobs struct {
	currencyService *currency.Service
}

func NewJobs(currencyService *currency.Service) *Jobs {
	return &Jobs{
		currencyService: currencyService,
	}
}

// GetCurrencies is Background Job for getting in the all currencies every 60 seconds or 1 minute
func (j *Jobs) GetCurrencies(ctx context.Context) background.JobFunc {
	return func() {

		err := j.currencyService.FetchExchangeRates()
		if err != nil {
			log.Printf("Initial exchange rate fetch failed: %v", err)
		}

		currencyTicker := time.NewTicker(60 * time.Second)
		exchangeRateTicker := time.NewTicker(1 * time.Hour)

		defer currencyTicker.Stop()
		defer exchangeRateTicker.Stop()

		// Initial fetching data, after that will fetch in background every 60 second
		supportedCurrencies := j.currencyService.GetSupportedDirectCurrencies()

		for _, currencyCode := range supportedCurrencies {
			err := j.currencyService.FetchCurrencyData(currencyCode)
			if err != nil {
				log.Printf("Error fetching %s data: %v\n", currencyCode, err)
			}
		}

		err = j.currencyService.UpdateDerivedCurrencies()
		if err != nil {
			log.Printf("Error updating derived currencies: %v\n", err)
		}

		for {
			select {
			case <-ctx.Done():
				return
			case <-currencyTicker.C:
				for _, currencyCode := range supportedCurrencies {
					err := j.currencyService.FetchCurrencyData(currencyCode)
					if err != nil {
						log.Printf("Error fetching %s data: %v\n", currencyCode, err)
					}
				}

				err = j.currencyService.UpdateDerivedCurrencies()
				if err != nil {
					log.Printf("Error updating derived currencies: %v\n", err)
				}

			case <-exchangeRateTicker.C:
				err := j.currencyService.FetchExchangeRates()
				if err != nil {
					log.Printf("Error fetching exchange rates: %v\n", err)
				}
			}
		}
	}
}
