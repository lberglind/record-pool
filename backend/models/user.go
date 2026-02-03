package models

import "time"

type User struct {
	ID	string	`json:"user_id"`
	Email	string	`json:"email"`
	Name	string	`json:"name"`
	CreatedAt	time.Time	`json:"createdAt"`
}

