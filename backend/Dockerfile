FROM golang:1.24.1-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o migrate ./cmd/migrate

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
COPY --from=builder /app/migrate .
COPY --from=builder /app/.env .
COPY --from=builder /app/cmd/migrate/migrations ./migrations

COPY ./start.sh .
RUN chmod +x ./start.sh

EXPOSE 8080
CMD ["./main"]