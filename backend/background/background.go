package background

import "log"

type JobFunc func()

func Go(fn func()) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Println("Recovered from panic:", r)
			}
		}()

		fn()
	}()
}
